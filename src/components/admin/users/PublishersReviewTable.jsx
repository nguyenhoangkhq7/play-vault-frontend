import React from "react";

export default function PublishersReviewTable({ publishers, onApprove, onReject }) {
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

  return (
    <div className="overflow-x-auto bg-[#3D1778]/50 p-4 rounded-xl">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-purple-500/50 text-sm text-gray-400">
            <th className="p-4">ID</th>
            <th className="p-4">Tên</th>
            <th className="p-4">Email</th>
            <th className="p-4">Ngày tạo</th>
            <th className="p-4">Số game</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4 text-center">Xử lý</th>
          </tr>
        </thead>
        <tbody className="text-white">
          {publishers.map((pub) => (
            <tr key={pub.id} className="border-b border-purple-500/20 hover:bg-purple-600/20 transition-colors duration-200">
              <td className="p-4">{pub.id}</td>
              <td className="p-4">{pub.name}</td>
              <td className="p-4">{pub.email}</td>
              <td className="p-4">{pub.date}</td>
              <td className="p-4 text-center">{pub.games}</td>
              <td className="p-4">
                <div className={`inline-block px-5 py-1 rounded-full text-sm font-semibold border-2 ${getStatusClass(pub.status)}`}>
                  {pub.status === "ACTIVE" || pub.status === "Active" ? "Hoạt động" : pub.status === "Blocked" ? "Bị chặn" : "Chờ duyệt"}
                </div>
              </td>
              <td className="p-4 flex justify-center items-center gap-2">
                <button
                  onClick={() => onApprove(pub.publisherRequestId)}
                  className={`flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-green-500 to-teal-600 shadow-teal-500/30`}
                >
                  <span>Duyệt</span>
                </button>

                <button
                  onClick={() => onReject(pub.publisherRequestId)}
                  className={`flex items-center justify-center gap-2 w-28 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30`}
                >
                  <span>Từ chối</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
