import { PlayCircleIcon, StopCircleIcon, EyeIcon } from "lucide-react";
import React, { useState } from "react";
import BlockReasonModal from "./BlockReasonModal";

export default function UsersTable({ users, onStatusToggle, onViewDetails }) {
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleBlockClick = (user) => {
    setSelectedUser(user);
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = (reason) => {
    onStatusToggle(selectedUser.id, reason); // truyền lý do về parent
    setBlockModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="overflow-x-auto bg-[#3D1778]/50 p-4 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-purple-500/50 text-sm text-gray-400">
              <th className="p-4">ID</th>
              <th className="p-4">Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Xử lý</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {users.map(user => (
              <tr key={user.id} className="border-b border-purple-500/20 hover:bg-purple-600/20 transition-colors duration-200">
                <td className="p-4">{user.id}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.date}</td>
                <td className="p-4">
                  <div className={`inline-block px-5 py-1 rounded-full text-sm font-semibold border-2 ${
                    user.status === 'Active' 
                    ? 'border-green-400 text-green-400 bg-green-500/10' 
                    : 'border-orange-500 text-orange-500 bg-orange-500/10'
                  }`}>
                    {user.status === 'Active' ? 'Hoạt động' : 'Bị chặn'}
                  </div>
                </td>
                <td className="p-4 flex justify-center items-center gap-2">
                  {user.status === 'Active' ? (
                    <button 
                      onClick={() => handleBlockClick(user)}
                      className="flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-pink-500/30 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <StopCircleIcon className="h-4 w-4" />
                      <span>Chặn</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => onStatusToggle(user.id)}
                      className="flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-teal-500/30 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <PlayCircleIcon className="h-4 w-4" />
                      <span>Kích hoạt</span>
                    </button>
                  )}
                  <button 
                    onClick={() => onViewDetails(user)}
                    className="flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-indigo-500/30 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Xem</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nhập lý do */}
      <BlockReasonModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
      />
    </>
  );
}
