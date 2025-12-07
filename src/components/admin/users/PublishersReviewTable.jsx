import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function PublishersReviewTable({ publishers, onApprove, onReject, actionLoading = {} }) {
  const [selectedPublisher, setSelectedPublisher] = useState(null);

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
      case "Active":
        return "border-green-400 text-green-400 bg-green-500/10";
      case "Blocked":
      case "BLOCKED":
        return "border-orange-500 text-orange-500 bg-orange-500/10";
      case "Pending review":
      case "PENDING":
        return "border-sky-400 text-sky-400 bg-sky-500/10";
      default:
        return "border-gray-500 text-gray-500 bg-gray-500/10";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      <div className="overflow-x-auto bg-[#3D1778]/50 p-4 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-purple-500/50 text-sm text-gray-400">
              <th className="p-4">Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4 text-center">Xử lý</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {publishers.map((pub) => (
              <tr 
                key={pub.id} 
                onClick={() => setSelectedPublisher(pub)}
                className="border-b border-purple-500/20 hover:bg-purple-600/20 transition-colors duration-200 cursor-pointer"
              >
                <td className="p-4">{pub.name}</td>
                <td className="p-4">{pub.email}</td>
                <td className="p-4">{formatDate(pub.date)}</td>
                <td className="p-4 max-w-xs truncate text-gray-300">{pub.description || "N/A"}</td>
                <td className="p-4 flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={async () => {
                      try {
                        await onApprove(pub.publisherRequestId);
                        toast.success(`Duyệt ${pub.name} thành công!`);
                      } catch (err) {
                        toast.error(`Lỗi khi duyệt ${pub.name}`);
                      }
                    }}
                    disabled={actionLoading[pub.publisherRequestId]}
                    className={`flex items-center justify-center gap-2 w-24 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-green-500 to-teal-600 shadow-teal-500/30 ${actionLoading[pub.publisherRequestId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {actionLoading[pub.publisherRequestId] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Duyệt</span>
                    )}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await onReject(pub.publisherRequestId);
                        toast.success(`Từ chối ${pub.name}`);
                      } catch (err) {
                        toast.error(`Lỗi khi từ chối ${pub.name}`);
                      }
                    }}
                    disabled={actionLoading[pub.publisherRequestId]}
                    className={`flex items-center justify-center gap-2 w-24 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 ${actionLoading[pub.publisherRequestId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {actionLoading[pub.publisherRequestId] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Từ chối</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Chi Tiết Publisher */}
      {selectedPublisher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a0b2e] border border-purple-500/50 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-purple-500/30 bg-[#2d1654]">
              <h2 className="text-2xl font-bold text-white">Chi tiết Publisher</h2>
              <button
                onClick={() => setSelectedPublisher(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Tên */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Tên</label>
                  <p className="text-white bg-purple-900/30 rounded-lg p-3">{selectedPublisher.name || "N/A"}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
                  <p className="text-white bg-purple-900/30 rounded-lg p-3">{selectedPublisher.email || "N/A"}</p>
                </div>


              </div>

              {/* Ngày tạo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Ngày tạo</label>
                  <p className="text-white bg-purple-900/30 rounded-lg p-3">{formatDate(selectedPublisher.date)}</p>
                </div>

              

              {/* Các trường khác nếu có */}
              {selectedPublisher.phone && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Số điện thoại</label>
                  <p className="text-white bg-purple-900/30 rounded-lg p-3">{selectedPublisher.phone}</p>
                </div>
              )}

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Mô tả</label>
                <p className="text-white bg-purple-900/30 rounded-lg p-3 whitespace-pre-wrap">{selectedPublisher.description || "N/A"}</p>
              </div>

              {selectedPublisher.address && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Địa chỉ</label>
                  <p className="text-white bg-purple-900/30 rounded-lg p-3">{selectedPublisher.address}</p>
                </div>
              )}

              {selectedPublisher.website && (
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Website</label>
                  <a href={selectedPublisher.website} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 bg-purple-900/30 rounded-lg p-3 block break-all">
                    {selectedPublisher.website}
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-end gap-4 p-6 border-t border-purple-500/30 bg-[#2d1654]">
              <button
                onClick={() => setSelectedPublisher(null)}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
