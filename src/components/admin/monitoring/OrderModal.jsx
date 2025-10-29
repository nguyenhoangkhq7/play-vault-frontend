import { CheckCircleIcon, ClockIcon, XCircleIcon, XIcon } from "lucide-react";

export default function OrderModal({ order, onClose, onUpdate }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#4a0e74] to-[#2a0242] rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 animate-scale-in border border-purple-500/50">
        <div className="p-6 border-b border-purple-500/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Khiếu nại: <span className="text-pink-400">{order.id}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><p className="font-semibold text-gray-400">Khách hàng:</p><p>{order.customerName}</p></div>
          <div><p className="font-semibold text-gray-400">Email:</p><p>{order.customerEmail}</p></div>
          <div><p className="font-semibold text-gray-400">Số tiền:</p><p className="font-bold text-pink-400">{order.amount}</p></div>
          <div><p className="font-semibold text-gray-400">Thời gian:</p><p>{order.time}</p></div>
          <div className="font-semibold text-gray-400"><p className="font-semibold text-gray-400">Mã giao dịch ngân hàng:</p><p className="font-mono">{order.bankTransactionId}</p></div>
          <div className="font-semibold text-gray-400"><p className="font-semibold text-gray-400">Mô tả:</p><p className="font-mono">{order.description}</p></div>
          <div className="sm:col-span-2"><p className="font-semibold text-gray-400">Trạng thái hiện tại:</p>
            <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${
              order.status === 'Đã xác nhận' ? 'bg-green-500/10 text-green-400'
              : order.status === 'Chờ xác nhận' ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-red-500/10 text-red-400'
            }`}>
              {order.status === 'Đã xác nhận' ? <CheckCircleIcon className="h-4 w-4"/>
              : order.status === 'Chờ xác nhận' ? <ClockIcon className="h-4 w-4"/>
              : <XCircleIcon className="h-4 w-4"/>}
              <span>{order.status}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 rounded-b-2xl flex flex-col sm:flex-row justify-end items-center gap-4">
          {order.status === 'Chờ xác nhận' ? (
            <>
              <button onClick={() => onUpdate(order.id, 'Đã hủy')}
                className="w-full sm:w-auto bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Hủy đơn hàng
              </button>
              <button onClick={() => onUpdate(order.id, 'Đã xác nhận')}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Xác nhận thanh toán
              </button>
            </>
          ) : order.status === 'Đã hủy' ? (
            <p className="text-red-400">Đơn hàng này đã bị hủy.</p>
          ) : (
            <p className="text-green-400">Đơn hàng đã được xử lý.</p>
          )}
        </div>
      </div>
    </div>
  );
}
