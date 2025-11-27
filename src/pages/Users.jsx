import React, { useState, useRef, useEffect } from 'react';
import UsersTable from '../components/admin/users/UsersTable';
import PublishersTable from '../components/admin/users/PublishersTable';
import DetailModal from '../components/admin/users/DetailModal';
import { getAllPublisher } from '../api/publisher';
import { getBlockRecordByUserName } from '../api/block-record';
import { getPublisherReuqestByUserName } from '../api/publisher-request';
import { updatePublisherRequestStatus } from '../api/publisher-request';

export default function Users() {
  // Cập nhật trạng thái tab để bao gồm 'pending_review'
  const [activeTab, setActiveTab] = useState('user'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [users, setUsers] = useState([
    { id: 'U-10111', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', date: '20-10-2024', status: 'Active', blockHistory: [] },
    { id: 'U-10112', name: 'Trần Thị B', email: 'tranthib@gmail.com', date: '21-10-2024', status: 'Active', blockHistory: [] },
    { id: 'U-10113', name: 'Lê Văn C', email: 'levanc@gmail.com', date: '22-10-2024', status: 'Blocked', blockHistory: [{ date: '23-10-2024', reason: 'Vi phạm quy tắc cộng đồng' }] },
  ]);
  // { id: 'P-10111', name: 'GameDev Studio X', email: 'contact@x.com', date: '20-10-2024', games: 12, status: 'Active', blockHistory: [] },
  //   { id: 'P-10112', name: 'Indie Creators', email: 'support@indie.com', date: '19-10-2024', games: 5, status: 'Blocked', blockHistory: [{ date: '20-10-2024', reason: 'Chậm báo cáo doanh thu' }] },
  //   { id: 'P-10113', name: 'AAA Games Inc.', email: 'press@aaa.com', date: '18-10-2024', games: 25, status: 'Pending review', blockHistory: [] },
  //   { id: 'P-10114', name: 'New Request Games', email: 'new@request.com', date: '25-11-2025', games: 0, status: 'Pending review', blockHistory: [] },

  const [publishers, setPublishers] = useState([
    
  ]);

  const userTabRef = useRef(null);
  const publisherTabRef = useRef(null);
  const reviewTabRef = useRef(null); // Ref cho tab mới
  const [underlineStyle, setUnderlineStyle] = useState({});

  // Lọc dữ liệu Publisher đang chờ duyệt
  const pendingPublishers = publishers.filter(p => p.status === 'Pending review');

  useEffect(() => {
  const fetchPublishers = async () => {
    try {
      const data = await getAllPublisher();

      const publishersWithHistory = await Promise.all(
        data.map(async (pub) => {
          const [records, request] = await Promise.all([
            getBlockRecordByUserName(pub.username),
            getPublisherReuqestByUserName(pub.username)
          ]);

          const newStatus = 
              request && request.status === "PENDING"
                ? "Pending review"
                : pub.status;

          return {
            ...pub,
            status: newStatus,
            blockHistory: records,
            publisherRequestId: request?.id || null
          };
        })
      );

      console.log(publishersWithHistory);
      
      setPublishers(publishersWithHistory);

    } catch (error) {
      console.error("Error fetching publishers:", error);
    }
  };

  fetchPublishers();
}, []);


  // Logic cập nhật gạch chân
  useEffect(() => {
    let currentRef = null;
    if (activeTab === 'user') {
      currentRef = userTabRef.current;
    } else if (activeTab === 'publisher') {
      currentRef = publisherTabRef.current;
    } else if (activeTab === 'pending_review') { // Logic cho tab mới
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
  const handleUserStatusToggle = (userId, reason) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
        const newBlockHistory = [...user.blockHistory];
        if (newStatus === 'Blocked' && reason) {
          newBlockHistory.push({ date: new Date().toLocaleDateString('vi-VN'), reason });
        }
        return { ...user, status: newStatus, blockHistory: newBlockHistory };
      }
      return user;
    }));
  };

  // Toggle status (Block/Unblock) cho Publisher
  const handlePublisherStatusToggle = (pubId) => {
    setPublishers(publishers.map(pub =>
      pub.id === pubId ? { ...pub, status: pub.status === 'Active' ? 'Blocked' : 'Active' } : pub
    ));
  };
  
// Xử lý Cấp quyền Publisher (chuyển từ Pending review sang Active)
const handlePublisherApprove = async (publisherRequestId) => {
  // Update local state nhanh
  setPublishers(prev =>
    prev.map(pub =>
      pub.publisherRequestId === publisherRequestId
        ? { ...pub, status: 'ACTIVE' }
        : pub
    )
  );

  try {
    // Gọi API backend để duyệt
    const updated = await updatePublisherRequestStatus(publisherRequestId);
    if (updated) {
      // Thông báo thành công
      alert('✅ Duyệt Publisher thành công!');
    } else {
      console.warn(`Không tìm thấy PublisherRequest với id ${publisherRequestId} trên server`);
      // revert nếu server không update
      setPublishers(prev =>
        prev.map(pub =>
          pub.publisherRequestId === publisherRequestId
            ? { ...pub, status: 'Pending review' }
            : pub
        )
      );
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật status PublisherRequest:', error);
    // revert nếu lỗi
    setPublishers(prev =>
      prev.map(pub =>
        pub.publisherRequestId === publisherRequestId
          ? { ...pub, status: 'Pending review' }
          : pub
      )
    );
    alert('❌ Duyệt Publisher thất bại!');
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
      case 'user':
        return (
          <UsersTable
            users={users}
            onStatusToggle={handleUserStatusToggle}
            onViewDetails={handleViewDetails}
          />
        );
      case 'publisher':
        // Hiển thị tất cả Publisher (trừ Pending review, vì đã có tab riêng)
        const activeAndBlockedPublishers = publishers.filter(p => p.status !== 'Pending review');
        return (
          <PublishersTable
            publishers={activeAndBlockedPublishers}
            onStatusToggle={handlePublisherStatusToggle}
            onViewDetails={handleViewDetails}
          />
        );
      case 'pending_review':
        return (
          // Dùng PublishersTable để hiển thị, nhưng truyền vào action Approve
          <PublishersTable
            publishers={pendingPublishers}
            // Truyền handler duyệt thay vì handler toggle status
            onStatusToggle={handlePublisherApprove} 
            onViewDetails={handleViewDetails}
            isReviewMode={true} // Báo cho component Table biết đây là chế độ Duyệt
          />
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen text-gray-300 font-sans">
      <main>
        <h1 className="text-3xl font-bold text-white mb-6">Admin quản lý tài khoản</h1>

        {/* --- TAB NAVIGATION --- */}
        <div className="relative flex border-b border-purple-500/50 mb-6">
          <button ref={userTabRef} onClick={() => setActiveTab('user')}
            className={`py-2 px-6 text-lg font-semibold ${activeTab === 'user' ? 'text-white' : 'text-gray-400'}`}>
            Người dùng (User)
          </button>

          <button ref={publisherTabRef} onClick={() => setActiveTab('publisher')}
            className={`py-2 px-6 text-lg font-semibold ${activeTab === 'publisher' ? 'text-white' : 'text-gray-400'}`}>
            Nhà phát hành (Publisher)
          </button>
          
          {/* TAB MỚI: DUYỆT PUBLISHER */}
          <button ref={reviewTabRef} onClick={() => setActiveTab('pending_review')}
            className={`py-2 px-6 text-lg font-semibold ${activeTab === 'pending_review' ? 'text-pink-500' : 'text-yellow-400'}`}>
            Duyệt Publisher ({pendingPublishers.length})
          </button>

          <div className="absolute bottom-[-1px] h-0.5 bg-pink-500 transition-all duration-300 ease-in-out"
            style={underlineStyle}></div>
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
        <div className="table-container">
          {renderTable()}
        </div>

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