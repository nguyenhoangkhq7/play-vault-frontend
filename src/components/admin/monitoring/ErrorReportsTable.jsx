import React from "react";

export default function ErrorReportsTable({ errors, handleOpenModal }) {
  return (
    <div className="overflow-x-auto bg-[#3D1778]/50 rounded-xl shadow-lg">
      <table className="w-full text-left responsive-table">
        <thead className="border-b border-purple-500/50 text-sm text-gray-400">
          <tr>
            <th className="p-4">ID lỗi</th>
            <th className="p-4">Tiêu đề lỗi</th>
            <th className="p-4">Khách hàng</th>
            <th className="p-4">Thời gian</th>
            <th className="p-4">Thao tác</th>
          </tr>
        </thead>

        <tbody className="text-white divide-y divide-purple-500/20">
          {errors.map((e) => (
            <tr key={e.id} className="hover:bg-purple-600/20 transition-colors duration-200">
              <td className="p-4 font-semibold">{e.id}</td>
              <td className="p-4 font-semibold">{e.title}</td>
              <td className="p-4">
                <p className="font-semibold">{e.customerName}</p>
                <p className="text-sm text-gray-400">{e.customerEmail}</p>
              </td>
              <td className="p-4">{e.time}</td>
              <td className="p-4">
                <button
                  onClick={() => handleOpenModal(e)}
                  className="bg-purple-600/50 hover:bg-purple-600/80 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
