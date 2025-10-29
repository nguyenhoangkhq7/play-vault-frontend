import { Link } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

export default function DetailModal({ isOpen, account, onClose }) {
  if (!isOpen) return null;

  // Ví dụ dữ liệu lịch sử chặn, bạn có thể truyền từ parent nếu muốn
  const blockHistory = account?.blockHistory || [
    // { date: '20-10-2024', reason: 'Vi phạm nội dung' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#4a0e74] to-[#2a0242] rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 transform transition-all duration-300 scale-95 animate-scale-in border border-purple-500/50">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-white mb-4 flex justify-between">
          <span>Chi tiết tài khoản: <span className="text-pink-400">{account?.name}</span></span>
          <span>
  <NavLink to={`/users/${account.id}`} className="text-sm  hover:text-blue-600 hover:underline transition-colors duration-200">
    Xem chi tiết
  </NavLink>
</span>

        </h2>
        

        {/* Thông tin cơ bản */}
        <div className="text-white space-y-2 mb-6">
          <p><strong>ID:</strong> {account?.id}</p>
          <p><strong>Email:</strong> {account?.email}</p>
          {account?.games !== undefined && <p><strong>Số game:</strong> {account.games}</p>}
          <p><strong>Ngày tạo:</strong> {account?.date}</p>
          <p><strong>Trạng thái:</strong> {account?.status}</p>
        </div>

        {/* Bảng lịch sử chặn */}
        {blockHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Lịch sử bị chặn</h3>
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-left border border-purple-500/50">
                <thead className="bg-purple-800/50 text-gray-300">
                  <tr>
                    <th className="p-2 border-b border-purple-500/50">Ngày chặn</th>
                    <th className="p-2 border-b border-purple-500/50">Lý do</th>
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
        )}




        {/* Nút đóng */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
