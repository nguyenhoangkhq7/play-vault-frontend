import { X } from "lucide-react";
import React from "react";

export default function DetailModal({ isOpen, account, onClose }) {
  if (!isOpen) return null;

  const blockHistory = account?.blockHistory || [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "border-green-400 text-green-400 bg-green-500/10";
      case "blocked":
        return "border-orange-500 text-orange-500 bg-orange-500/10";
      case "pending review":
        return "border-sky-400 text-sky-400 bg-sky-500/10";
      default:
        return "border-gray-500 text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1a0b2e] border border-purple-500/50 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-purple-500/30 bg-[#2d1654]">
          <h2 className="text-2xl font-bold text-white">
            Chi tiết tài khoản: <span className="text-pink-400">{account?.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* ID */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">ID</label>
              <p className="text-white bg-purple-900/30 rounded-lg p-3">{account?.id || "N/A"}</p>
            </div> */}

            {/* Studio Name */}
            {account?.name && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tên Studio</label>
                <p className="text-white bg-purple-900/30 rounded-lg p-3">{account.name}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
              <p className="text-white bg-purple-900/30 rounded-lg p-3">{account?.email || "N/A"}</p>
            </div>

            {/* Ngày tạo */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Ngày tạo</label>
              <p className="text-white bg-purple-900/30 rounded-lg p-3">{formatDate(account?.date)}</p>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Trạng thái</label>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusClass(account?.status)}`}>
                {account?.status === 'Active' ? 'Hoạt động' : account?.status === 'Blocked' ? 'Bị chặn' : account?.status || 'N/A'}
              </div>
            </div>

            {/* Số game */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Số game</label>
              <p className="text-white bg-purple-900/30 rounded-lg p-3">{account?.games || 0}</p>
            </div>

            {/* Website */}
            {account?.website && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Website</label>
                <p className="text-white bg-purple-900/30 rounded-lg p-3">
                  <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {account.website}
                  </a>
                </p>
              </div>
            )}
          </div>

          <div>
            {/* Mô tả */}
            <label className="block text-sm font-semibold text-gray-400 mb-2">Mô tả</label>
            <p className="text-white bg-purple-900/30 rounded-lg p-3 whitespace-pre-wrap">{account?.description || "N/A"}</p>
          </div>

          {/* Lịch sử bị chặn */}
          {blockHistory.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Lịch sử bị chặn</label>
              <div className="bg-purple-900/30 rounded-lg p-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-purple-500/30 text-sm text-gray-400">
                        <th className="p-2">Ngày chặn</th>
                        <th className="p-2">Lý do</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {blockHistory.map((item, index) => (
                        <tr key={index} className="border-b border-purple-500/20">
                          <td className="p-2">{item.date}</td>
                          <td className="p-2">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-4 p-6 border-t border-purple-500/30 bg-[#2d1654]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
