"use client"

import { useState } from "react"
import { Plus, Filter, BarChart3 } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"


export default function PublisherManagerDiscount() {
  const [promotions, setPromotions] = useState([
    {
      id: "1",
      name: "Giảm Cả Năm Vui",
      code: "HAPPY",
      discountType: "percentage",
      discountValue: 20,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      description: "Khuyến mãi áp dụng cho tất cả các game trong hệ thống. Giảm 20% cho mọi giao dịch.",
    },
    {
      id: "2",
      name: "Mùa Hè Sôi Động",
      code: "SUMMER",
      discountType: "fixed",
      discountValue: 50000,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      description: "Giảm 50.000đ cho mỗi giao dịch vào mùa hè.",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    description: "",
  })

  const [filters, setFilters] = useState({
    searchQuery: "",
    startDate: "",
    endDate: "",
    discountType: "",
    status: "",
  })

  // Helpers
  const isExpired = (endDate) => new Date(endDate) < new Date()
  const isActive = (promo) => {
    const now = new Date()
    return new Date(promo.startDate) <= now && new Date(promo.endDate) >= now
  }
  const isUpcoming = (promo) => new Date(promo.startDate) > new Date()

  const handleOpenDialog = (promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({ ...promotion })
    } else {
      setEditingPromotion(null)
      setFormData({
        name: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        startDate: "",
        endDate: "",
        description: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPromotion(null)
  }

  const handleSave = () => {
    if (editingPromotion) {
      setPromotions(promotions.map((p) => (p.id === editingPromotion.id ? { ...formData, id: p.id } : p)))
    } else {
      const newPromotion = { ...formData, id: Date.now().toString() }
      setPromotions([...promotions, newPromotion])
    }
    handleCloseDialog()
  }

  const handleDelete = (id) => {
    setPromotions(promotions.filter((p) => p.id !== id))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  const filteredPromotions = promotions.filter((p) => {
    const matchName = p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
    const matchStart = !filters.startDate || new Date(p.startDate) >= new Date(filters.startDate)
    const matchEnd = !filters.endDate || new Date(p.endDate) <= new Date(filters.endDate)
    const matchType = !filters.discountType || p.discountType === filters.discountType
    let matchStatus = true
    if (filters.status === "active") matchStatus = isActive(p)
    else if (filters.status === "expired") matchStatus = isExpired(p.endDate)
    return matchName && matchStart && matchEnd && matchType && matchStatus
  })

  // --- Thống kê ---
  const total = promotions.length
  const active = promotions.filter(isActive).length
  const upcoming = promotions.filter(isUpcoming).length
  const expired = promotions.filter((p) => isExpired(p.endDate)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-white">Quản lý khuyến mãi</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg"
            >
              <BarChart3 className="mr-2 h-4 w-4" /> Thống kê
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
            >
              <Filter className="mr-2 h-4 w-4" /> Bộ lọc nâng cao
            </button>
            <button
              onClick={() => handleOpenDialog()}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm khuyến mãi
            </button>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <AnimatePresence>
  {showStats && (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      <div className="bg-white/10 rounded-xl p-4 text-center shadow-lg">
        <p className="text-purple-300 text-sm font-medium">🟣 Tổng số khuyến mãi</p>
        <p className="text-3xl font-bold text-white mt-1">{total}</p>
      </div>
      <div className="bg-white/10 rounded-xl p-4 text-center shadow-lg">
        <p className="text-green-300 text-sm font-medium">🟢 Đang hoạt động</p>
        <p className="text-3xl font-bold text-white mt-1">{active}</p>
      </div>
      <div className="bg-white/10 rounded-xl p-4 text-center shadow-lg">
        <p className="text-yellow-300 text-sm font-medium">🟡 Sắp diễn ra</p>
        <p className="text-3xl font-bold text-white mt-1">{upcoming}</p>
      </div>
      <div className="bg-white/10 rounded-xl p-4 text-center shadow-lg">
        <p className="text-red-300 text-sm font-medium">🔴 Đã hết hạn</p>
        <p className="text-3xl font-bold text-white mt-1">{expired}</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>


        {/* Bộ lọc */}
        {isFilterOpen && (
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-2">Bộ lọc nâng cao</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                placeholder="Tìm kiếm theo tên khuyến mãi..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="bg-purple-800 border border-purple-700 text-white placeholder:text-white/50 rounded-lg px-3 py-2"
              />
              <div>
                <label className="text-white mb-1 block">Từ ngày</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="bg-purple-800 border border-purple-700 text-white rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="text-white mb-1 block">Đến ngày</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="bg-purple-800 border border-purple-700 text-white rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="text-white mb-1 block">Loại khuyến mãi</label>
                <select
                  value={filters.discountType}
                  onChange={(e) => setFilters({ ...filters, discountType: e.target.value })}
                  className="bg-purple-800 border border-purple-700 text-white rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Tất cả</option>
                  <option value="percentage">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              <div>
                <label className="text-white mb-1 block">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="bg-purple-800 border border-purple-700 text-white rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Đã hết hạn</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách */}
        <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Danh sách khuyến mãi</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3 text-left text-sm font-semibold text-white">Tên</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Mã</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Giảm giá</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Thời gian</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Mô tả</th>
                  <th className="pb-3 text-center text-sm font-semibold text-white">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 text-white">{promotion.name}</td>
                    <td className="py-4">
                      <span className="rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
                        {promotion.code}
                      </span>
                    </td>
                    <td className="py-4 text-white">
                      {promotion.discountType === "percentage"
                        ? `${promotion.discountValue}%`
                        : `${promotion.discountValue.toLocaleString("vi-VN")}đ`}
                    </td>
                    <td className="py-4 text-white">
                      <div className="text-sm">
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </div>
                      {isExpired(promotion.endDate) ? (
                        <span className="mt-1 inline-block rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          Hết hạn
                        </span>
                      ) : isActive(promotion) ? (
                        <span className="mt-1 inline-block rounded bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="mt-1 inline-block rounded bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black">
                          Sắp diễn ra
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-white max-w-xs">
                      <div className="line-clamp-2 text-sm text-white/80">{promotion.description}</div>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenDialog(promotion)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPromotions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-white/80">
                      Không tìm thấy khuyến mãi nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-900 border border-purple-700 rounded-2xl p-6 w-full max-w-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">
              {editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
            </h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block mb-1 text-sm">Tên khuyến mãi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2"
                  placeholder="Nhập tên khuyến mãi"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Mã khuyến mãi</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2"
                  placeholder="VD: SUMMER2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Loại giảm giá</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2"
                  >
                    <option value="percentage">Phần trăm</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm">Giá trị giảm</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2"
                    placeholder={formData.discountType === "percentage" ? "10" : "50000"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">Mô tả</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg bg-purple-800 border border-purple-700 px-3 py-2 resize-none"
                  placeholder="Mô tả chi tiết về khuyến mãi..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
