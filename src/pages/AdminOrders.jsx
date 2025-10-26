"use client"

import { useState } from "react"
import { Search, CheckCircle, XCircle, Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function AdminOrders() {
  // 📦 Dữ liệu tĩnh mẫu
  const staticOrders = [
    {
      id: "HD001",
      user: "Nguyễn Văn A",
      email: "vana@example.com",
      gameCount: 2,
      price: 210000,
      date: "21/10/2025 10:35",
      status: "Đang xử lý",
    },
    {
      id: "HD002",
      user: "Phạm Thị B",
      email: "phamb@example.com",
      gameCount: 1,
      price: 150000,
      date: "20/10/2025 19:00",
      status: "Đã thanh toán",
    },
    {
      id: "HD003",
      user: "Trần Minh C",
      email: "minhc@example.com",
      gameCount: 3,
      price: 350000,
      date: "19/10/2025 09:45",
      status: "Đã hủy",
    },
    {
      id: "HD004",
      user: "Lê Hoàng D",
      email: "hoangd@example.com",
      gameCount: 1,
      price: 99000,
      date: "19/10/2025 21:20",
      status: "Đang xử lý",
    },
  ]

  const [orders, setOrders] = useState(staticOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  // 🔍 Lọc danh sách theo từ khóa tìm kiếm
  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 🔄 Cập nhật trạng thái hóa đơn (chỉ khi đang xử lý)
  const handleUpdateStatus = (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    // Cho phép chuyển từ "Đang xử lý" sang "Đã hủy" hoặc "Đã thanh toán"
    if (order.status !== "Đang xử lý") {
      toast.warning(`Chỉ có thể cập nhật trạng thái từ "Đang xử lý".`)
      return
    }

    if (order.status === newStatus) {
      toast.info(`Đơn hàng ${orderId} đã ở trạng thái "${newStatus}".`)
      return
    }

    // Đã bỏ `confirm` để dùng `toast` hoặc dialog riêng, nhưng giữ lại `confirm`
    // nếu không có dialog/modal chuyên dụng.
    if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng ${orderId} sang "${newStatus}"?`)) {
      return
    }

    setUpdatingId(orderId)
    // Giả lập API call
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      )
      toast.success(`Cập nhật ${orderId} → ${newStatus} thành công!`)
      setUpdatingId(null)
    }, 600)
  }

  // 💎 Lấy class cho badge trạng thái
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Đang xử lý":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
      case "Đã thanh toán":
        return "bg-green-500/20 text-green-300 border border-green-500/30"
      case "Đã hủy":
        return "bg-red-500/20 text-red-300 border border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30"
    }
  }

  return (
    <div className="container mx-auto max-w-full px-2 py-4 sm:px-4 sm:py-6 lg:py-10">
      <Card className="bg-purple-950/60 border border-purple-800/40 shadow-[0_0_30px_rgba(168,85,247,0.3)] backdrop-blur-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
              Quản lý đơn hàng
            </h2>

            <div className="relative w-full sm:w-72 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm (Mã ĐH/Người mua)..."
                className="pl-9 bg-purple-900/40 border-purple-700 text-white placeholder-purple-400 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 sm:py-20 text-purple-300">
              <p className="text-sm sm:text-base">Không có đơn hàng nào phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-purple-800/40">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-900/70 border-b border-purple-700/40">
                    {/* Cột Ẩn/Hiện: Thêm hidden trên mobile (md:table-cell) */}
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-purple-300 text-xs sm:text-sm font-medium w-16 sm:w-20">Mã ĐH</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-purple-300 text-xs sm:text-sm font-medium w-32">Người mua</th>
                    <th className="hidden md:table-cell text-left py-2 sm:py-3 px-4 text-purple-300 text-sm font-medium w-48 max-w-[120px]">Email</th>
                    <th className="hidden lg:table-cell text-left py-2 sm:py-3 px-4 text-purple-300 text-sm font-medium w-24">SL Game</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-purple-300 text-xs sm:text-sm font-medium w-28">Tổng tiền</th>
                    <th className="hidden md:table-cell text-left py-2 sm:py-3 px-4 text-purple-300 text-sm font-medium w-32">Ngày tạo</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-purple-300 text-xs sm:text-sm font-medium w-28 sm:w-40">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-purple-800/20 hover:bg-purple-800/20 transition-colors"
                    >
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-white text-xs font-medium">{order.id}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-purple-200 text-xs truncate max-w-[80px] sm:max-w-none">{order.user}</td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-4 text-purple-300 text-xs truncate max-w-[100px]">{order.email}</td>
                      <td className="hidden lg:table-cell py-2 sm:py-3 px-4 text-purple-300 text-sm">{order.gameCount}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-purple-200 font-medium text-xs sm:text-sm">
                        {order.price.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-4 text-purple-300 text-xs truncate">{order.date}</td>
                      
                      <td className="py-2 px-2 sm:py-3 sm:px-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          {/* Badge trạng thái */}
                          <span
                            className={`inline-flex px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border transition-colors whitespace-nowrap ${getStatusBadgeClass(order.status)}`}
                          >
                            {order.status}
                          </span>

                          {/* Nút hành động */}
                          {order.status === "Đang xử lý" && (
                            <div className="flex items-center gap-0.5 sm:gap-1 mt-1 sm:mt-0">
                              <Button
                                size="icon" // Dùng size="icon" để có kích thước nhỏ hơn mặc định
                                variant="ghost"
                                disabled={updatingId === order.id}
                                className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-full transition-colors"
                                onClick={() => handleUpdateStatus(order.id, "Đã thanh toán")}
                                title="Đánh dấu đã thanh toán"
                              >
                                {updatingId === order.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={updatingId === order.id}
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                                onClick={() => handleUpdateStatus(order.id, "Đã hủy")}
                                title="Hủy đơn hàng"
                              >
                                {updatingId === order.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}