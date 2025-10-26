import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";

export default function OrdersTable({ orders, handleOpenModal }) {
  return (
    <div className="overflow-x-auto bg-[#3D1778]/50 rounded-xl shadow-lg">
      <table className="w-full text-left responsive-table">
        <thead className="border-b border-purple-500/50 text-sm text-gray-400">
          <tr>
            <th className="p-4">Mã đơn hàng</th>
            <th className="p-4">Khách hàng</th>
            <th className="p-4">Số tiền</th>
            <th className="p-4">Mã giao dịch</th>
            <th className="p-4">Thời gian</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Thao tác</th>
          </tr>
        </thead>

        <tbody className="text-white divide-y divide-purple-500/20">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-purple-600/20 transition-colors duration-200">
              <td data-label="Mã đơn hàng" className="p-4 font-semibold">{order.id}</td>
              <td data-label="Khách hàng" className="p-4">
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-sm text-gray-400">{order.customerEmail}</p>
              </td>
              <td data-label="Số tiền" className="p-4 font-semibold">{order.amount}</td>
              <td data-label="Mã giao dịch" className="p-4">{order.bankTransactionId}</td>
              <td data-label="Thời gian" className="p-4">{order.time}</td>
              <td data-label="Trạng thái" className="p-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Đã xác nhận'
                    ? 'bg-green-500/10 text-green-400'
                    : order.status === 'Chờ xác nhận'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {order.status === 'Đã xác nhận' ? <CheckCircleIcon className="h-4 w-4"/>
                  : order.status === 'Chờ xác nhận' ? <ClockIcon className="h-4 w-4"/>
                  : <XCircleIcon className="h-4 w-4"/>}
                  <span>{order.status}</span>
                </div>
              </td>
              <td data-label="Thao tác" className="p-4">
                <button onClick={() => handleOpenModal(order)} 
                  className="bg-purple-600/50 hover:bg-purple-600/80 text-white font-semibold py-2 px-4 rounded-lg text-sm transition">
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
