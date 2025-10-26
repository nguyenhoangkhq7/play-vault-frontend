import { MailIcon, PlayCircleIcon, StopCircleIcon } from "lucide-react";
import React from "react";


export default function UsersTable({ users, onStatusToggle, onGenerateEmail }) {
  return (
    <div className="overflow-x-auto bg-[#3D1778]/50 p-4 rounded-xl">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-purple-500/50 text-sm text-gray-400">
          <th className="p-4">ID</th>
          <th className="p-4">TÊN</th>
          <th className="p-4">EMAIL</th>
          <th className="p-4">NGÀY TẠO</th>
          <th className="p-4">TRẠNG THÁI</th>
          <th className="p-4 text-center">XỬ LÝ</th>
        </tr>
      </thead>
      <tbody className="text-white">
        {users.map((user) => (
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
              <button onClick={() => onStatusToggle(user.id)} className={`flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg ${user.status === 'Active' ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-pink-500/30' : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-teal-500/30'}`}>
                {user.status === 'Active' ? <StopCircleIcon className="h-4 w-4" /> : <PlayCircleIcon className="h-4 w-4" />}
                <span>{user.status === 'Active' ? 'Chặn' : 'Kích hoạt'}</span>
              </button>
               <button onClick={() => onGenerateEmail(user)} className="flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-indigo-500/30 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg">
                <MailIcon className="h-4 w-4" />
                <span>Email ✨</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
}
