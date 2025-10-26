import { AlertTriangle } from "lucide-react"

export default function AlertBanner() {
  return (
    <div className="bg-gradient-to-r from-pink-600 to-red-500 p-4 rounded-xl flex items-center gap-3 shadow-md">
      <AlertTriangle className="text-white h-6 w-6 flex-shrink-0" />
      <div>
        <p className="font-semibold text-white">Cảnh báo: Tỷ lệ lỗi thanh toán &gt; 3% trong 10 phút qua</p>
        <p className="text-gray-100 text-sm">Kiểm tra gateway payment logs và retry queue để xác nhận nguyên nhân.</p>
      </div>
    </div>
  )
}
