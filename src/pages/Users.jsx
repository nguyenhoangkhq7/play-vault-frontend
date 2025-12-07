import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import UsersTable from "../components/admin/users/UsersTable";
import PublishersTable from "../components/admin/users/PublishersTable";
import PublishersReviewTable from "../components/admin/users/PublishersReviewTable";
import DetailModal from "../components/admin/users/DetailModal";
import {
  getAllPublisher,
  blockPublisher,
  unblockPublisher,
} from "../api/publisher";
import { getAllCustomers } from "../api/customer";
import { blockCustomer, unblockCustomer } from "../api/customer";
import {
  getBlockRecordByUserName,
  blockUser,
  unblockUser,
} from "../api/block-record";
import { getPublisherReuqestByUserName } from "../api/publisher-request";
import {
  approvePublisherRequest,
  rejectPublisherRequest,
} from "../api/publisher-request";
import { useUser } from "../store/UserContext";

export default function Users() {
  // Cập nhật trạng thái tab để bao gồm 'pending_review'
  const [activeTab, setActiveTab] = useState("user");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const { setAccessToken } = useUser();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userActionLoading, setUserActionLoading] = useState({});

  const [publishers, setPublishers] = useState([]);
  const [publisherActionLoading, setPublisherActionLoading] = useState({});

  const userTabRef = useRef(null);
  const publisherTabRef = useRef(null);
  const reviewTabRef = useRef(null); // Ref cho tab mới
  const [underlineStyle, setUnderlineStyle] = useState({});

  // Lọc dữ liệu Publisher đang chờ duyệt
  const pendingPublishers = publishers.filter(
    (p) => p.status === "Pending review"
  );

  useEffect(() => {
    // fetch users (customers) from backend
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        const data = await getAllCustomers(setAccessToken);

        // normalize response (api.get returns axios response with .data)
        const list = (data && data.data) || (Array.isArray(data) ? data : []);

        // map backend customer objects to frontend shape
        const usersWithHistory = await Promise.all(
          (list || []).map(async (cust) => {
            // cust expected: { id, fullName, email, date, status, username }
            let records = [];
            try {
              const recResp = await getBlockRecordByUserName(
                cust.username,
                setAccessToken
              );
              records = (recResp && recResp.data) || recResp || [];
            } catch (e) {
              // ignore block record errors for now
              console.warn(
                "Failed to fetch block records for",
                cust.username,
                e
              );
            }

            return {
              id: cust.id,
              name: cust.fullName || cust.username,
              email: cust.email,
              date: cust.date || "",
              status:
                cust.status === "ACTIVE"
                  ? "Active"
                  : cust.status === "BLOCKED"
                  ? "Blocked"
                  : cust.status,
              username: cust.username,
              blockHistory: records || [],
            };
          })
        );

        setUsers(usersWithHistory);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsersError("Không thể tải danh sách user.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();

    const fetchPublishers = async () => {
      try {
        const data = await getAllPublisher(setAccessToken);
        console.log(data);

        const publishersWithHistory = await Promise.all(
          (data && data.data ? data.data : Array.isArray(data) ? data : []).map(
            async (pub) => {
              const [recordsResp, requestResp] = await Promise.all([
                getBlockRecordByUserName(pub.username, setAccessToken),
                getPublisherReuqestByUserName(pub.username, setAccessToken),
              ]);

              const records =
                (recordsResp && recordsResp.data) || recordsResp || [];
              const request =
                (requestResp && requestResp.data) || requestResp || null;

              const newStatus =
                request &&
                (request.status === "PENDING" || request.status === "PENDING")
                  ? "Pending review"
                  : pub.status;
              return {
                ...pub,
                status: newStatus,
                blockHistory: Array.isArray(records) ? records : [],
                publisherRequestId: request?.id || null,
              };
            }
          )
        );

        console.log(publishersWithHistory);

        setPublishers(publishersWithHistory);
      } catch (error) {
        console.error("Error fetching publishers:", error);
      }
    };

    fetchPublishers();
  }, [setAccessToken]);

  // Logic cập nhật gạch chân
  useEffect(() => {
    let currentRef = null;
    if (activeTab === "user") {
      currentRef = userTabRef.current;
    } else if (activeTab === "publisher") {
      currentRef = publisherTabRef.current;
    } else if (activeTab === "pending_review") {
      // Logic cho tab mới
      currentRef = reviewTabRef.current;
    }

    if (currentRef) {
      setUnderlineStyle({
        left: currentRef.offsetLeft,
        width: currentRef.offsetWidth,
      });
    }
  }, [activeTab]);

  // Toggle status (Block/Unblock) cho User
  const handleUserStatusToggle = async (userId, reason) => {
    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const isActive = user.status === "Active" || user.status === "ACTIVE";
      let success;
      if (isActive) {
        success = await blockUser(user.username, reason, setAccessToken);
      } else {
        success = await unblockUser(user.username, setAccessToken);
      }

      if (success) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === userId) {
              const newStatus = isActive ? "Blocked" : "Active";
              const newBlockHistory = [...(u.blockHistory || [])];
              if (isActive && reason) {
                newBlockHistory.push({
                  date: new Date().toLocaleDateString("vi-VN"),
                  reason,
                });
              }
              return { ...u, status: newStatus, blockHistory: newBlockHistory };
            }
            return u;
          })
        );
        toast.success(
          isActive ? `Chặn user thành công!` : `Kích hoạt user thành công!`
        );
      } else {
        toast.error("Thao tác thất bại.");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Lỗi khi thực hiện thao tác.");
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Toggle status (Block/Unblock) cho Publisher
  const handlePublisherStatusToggle = async (pubId, reason) => {
    setPublisherActionLoading((prev) => ({ ...prev, [pubId]: true }));
    try {
      const pub = publishers.find(
        (p) => p.id === pubId || p.publisherRequestId === pubId
      );
      if (!pub) return;

      const isActive = pub.status === "Active" || pub.status === "ACTIVE";
      let success;
      if (isActive) {
        success = await blockUser(pub.username, reason, setAccessToken);
      } else {
        success = await unblockUser(pub.username, setAccessToken);
      }

      if (success) {
        setPublishers((prev) =>
          prev.map((p) => {
            if (p.id === pubId || p.publisherRequestId === pubId) {
              const newStatus = isActive ? "Blocked" : "Active";
              const newHistory = [...(p.blockHistory || [])];
              if (isActive && reason) {
                newHistory.push({
                  date: new Date().toLocaleDateString("vi-VN"),
                  reason,
                });
              }
              return { ...p, status: newStatus, blockHistory: newHistory };
            }
            return p;
          })
        );
        toast.success(
          isActive
            ? `Chặn publisher thành công!`
            : `Kích hoạt publisher thành công!`
        );
      } else {
        toast.error("Thao tác thất bại.");
      }
    } catch (error) {
      console.error("Error toggling publisher status:", error);
      toast.error("Lỗi khi thực hiện thao tác.");
    } finally {
      setPublisherActionLoading((prev) => ({ ...prev, [pubId]: false }));
    }
  };

  // Xử lý Cấp quyền Publisher (chuyển từ Pending review sang Active)
  const handlePublisherApprove = async (publisherRequestId) => {
    setPublisherActionLoading((prev) => ({
      ...prev,
      [publisherRequestId]: true,
    }));
    try {
      const success = await approvePublisherRequest(
        publisherRequestId,
        setAccessToken
      );
      if (success) {
        setPublishers((prev) =>
          prev.map((pub) =>
            pub.publisherRequestId === publisherRequestId
              ? { ...pub, status: "Active", publisherRequestId: null }
              : pub
          )
        );
        toast.success("Duyệt Publisher thành công!");
      } else {
        toast.error(
          "Duyệt Publisher thất bại: server trả về không thành công."
        );
      }
    } catch (error) {
      console.error("Error approving publisher request:", error);
      toast.error("Lỗi khi gọi API duyệt publisher.");
    } finally {
      setPublisherActionLoading((prev) => ({
        ...prev,
        [publisherRequestId]: false,
      }));
    }
  };

  // Xử lý Từ chối Publisher
  const handlePublisherReject = async (publisherRequestId) => {
    setPublisherActionLoading((prev) => ({
      ...prev,
      [publisherRequestId]: true,
    }));
    try {
      const success = await rejectPublisherRequest(
        publisherRequestId,
        setAccessToken
      );
      if (success) {
        setPublishers((prev) =>
          prev.map((pub) =>
            pub.publisherRequestId === publisherRequestId
              ? { ...pub, status: "Rejected", publisherRequestId: null }
              : pub
          )
        );
        toast.error("Từ chối Publisher thành công!");
      } else {
        toast.error(
          "Từ chối Publisher thất bại: server trả về không thành công."
        );
      }
    } catch (error) {
      console.error("Error rejecting publisher request:", error);
      toast.error("Lỗi khi gọi API từ chối publisher.");
    } finally {
      setPublisherActionLoading((prev) => ({
        ...prev,
        [publisherRequestId]: false,
      }));
    }
  };

  // VIEW DETAILS -> mở modal
  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  // Hàm render Table dựa trên activeTab
  const renderTable = () => {
    switch (activeTab) {
      case "user":
        return (
          <UsersTable
            users={users}
            onStatusToggle={handleUserStatusToggle}
            onViewDetails={handleViewDetails}
            actionLoading={userActionLoading}
          />
        );
      case "publisher":
        // Hiển thị tất cả Publisher (trừ Pending review, vì đã có tab riêng)
        const activeAndBlockedPublishers = publishers.filter(
          (p) => p.status !== "Pending review"
        );
        return (
          <PublishersTable
            publishers={activeAndBlockedPublishers}
            onStatusToggle={handlePublisherStatusToggle}
            onViewDetails={handleViewDetails}
            actionLoading={publisherActionLoading}
          />
        );
      case "pending_review":
        return (
          <PublishersReviewTable
            publishers={pendingPublishers}
            onApprove={handlePublisherApprove}
            onReject={handlePublisherReject}
            actionLoading={publisherActionLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-300 font-sans">
      <main>
        <h1 className="text-3xl font-bold text-white mb-6">
          Admin quản lý tài khoản
        </h1>

        {/* --- TAB NAVIGATION --- */}
        <div className="relative flex border-b border-purple-500/50 mb-6">
          <button
            ref={userTabRef}
            onClick={() => setActiveTab("user")}
            className={`py-2 px-6 text-lg font-semibold ${
              activeTab === "user" ? "text-white" : "text-gray-400"
            }`}
          >
            Người dùng (User)
          </button>

          <button
            ref={publisherTabRef}
            onClick={() => setActiveTab("publisher")}
            className={`py-2 px-6 text-lg font-semibold ${
              activeTab === "publisher" ? "text-white" : "text-gray-400"
            }`}
          >
            Nhà phát hành (Publisher)
          </button>

          {/* TAB MỚI: DUYỆT PUBLISHER */}
          <button
            ref={reviewTabRef}
            onClick={() => setActiveTab("pending_review")}
            className={`py-2 px-6 text-lg font-semibold ${
              activeTab === "pending_review" ? "text-white" : "text-gray-400"
            }`}
          >
            Duyệt Publisher ({pendingPublishers.length})
          </button>

          <div
            className="absolute bottom-[-1px] h-0.5 bg-pink-500 transition-all duration-300 ease-in-out"
            style={underlineStyle}
          ></div>
        </div>
        {/* --- END TAB NAVIGATION --- */}

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm theo ID, Tên, Email..."
            className="w-full bg-[#3D1778]/80 border border-purple-500/50 rounded-lg py-3 pl-4 pr-12 text-white"
          />
        </div>

        {/* HIỂN THỊ BẢNG DỰA TRÊN TRẠNG THÁI */}
        <div className="table-container">{renderTable()}</div>

        {/* MODAL */}
        <DetailModal
          isOpen={isModalOpen}
          account={selectedAccount}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
}
