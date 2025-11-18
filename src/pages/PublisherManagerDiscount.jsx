"use client"

import { useState, useEffect } from "react"
import { Plus, Filter } from "lucide-react"
import { useUser } from "../store/UserContext"
import {
  searchPromotions,
  createPromotion,
} from "../api/promotions"

export default function PublisherManagerDiscount() {
  const { user, setAccessToken } = useUser()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
    discountPercent: null,
    discountAmount: null,
  })

  const [filters, setFilters] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    status: "ALL",
  })

  // Fetch promotions khi component mount
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchPromotions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Fetch promotions khi filters thay đổi
  useEffect(() => {
    if (!user) return
    fetchPromotionsWithFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user])

  // Fetch tất cả promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchPromotions(setAccessToken, { status: "ALL" })
      setPromotions(data.content || [])
    } catch (err) {
      console.error("Error fetching promotions:", err)
      setError(err.message || "Không thể tải danh sách khuyến mãi")
    } finally {
      setLoading(false)
    }
  }

  // Fetch với filters
  const fetchPromotionsWithFilters = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchPromotions(setAccessToken, filters)
      setPromotions(data.content || [])
    } catch (err) {
      console.error("Error fetching filtered promotions:", err)
      setError(err.message || "Không thể lọc khuyến mãi")
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const isExpired = (endDate) => new Date(endDate) < new Date()
  const isActive = (promo) => {
    const now = new Date()
    return new Date(promo.startDate) <= now && new Date(promo.endDate) >= now
  }

  const handleOpenDialog = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({
        name: promotion.name || "",
        description: promotion.description || "",
        startDate: promotion.startDate || "",
        endDate: promotion.endDate || "",
        isActive: promotion.isActive !== undefined ? promotion.isActive : true,
        discountPercent: promotion.discountPercent || null,
        discountAmount: promotion.discountAmount || null,
      })
    } else {
      setEditingPromotion(null)
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        isActive: true,
        discountPercent: null,
        discountAmount: null,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPromotion(null)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      if (editingPromotion) {
        // TODO: Implement update promotion API when backend supports it
        console.log("Update promotion not implemented yet")
      } else {
        // Tạo mới promotion
        await createPromotion(setAccessToken, formData)
      }
      
      // Refresh danh sách
      await fetchPromotions()
      handleCloseDialog()
    } catch (err) {
      console.error("Error saving promotion:", err)
      alert(err.response?.data || "Không thể lưu khuyến mãi")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return
    
    try {
      setLoading(true)
      // TODO: Implement delete promotion API when backend supports it
      console.log("Delete promotion not implemented yet")
      // Tạm thời remove khỏi state
      setPromotions(promotions.filter(p => p.id !== id))
    } catch (err) {
      console.error("Error deleting promotion:", err)
      alert("Không thể xóa khuyến mãi")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  // Không cần filter ở client vì đã filter ở backend
  const filteredPromotions = promotions

  // Show loading nếu chưa có user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Vui lòng đăng nhập để quản lý khuyến mãi</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Quản lý khuyến mãi</h1>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition-all"
            >
              <Filter className="w-5 h-5" />
              Bộ lọc nâng cao
            </button>
            
            <button
              onClick={() => handleOpenDialog()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Thêm khuyến mãi
            </button>
          </div>
        </div>

        {/* Bộ lọc nâng cao */}
        {isFilterOpen && (
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Bộ lọc nâng cao</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                placeholder="Tìm kiếm theo tên khuyến mãi..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="bg-purple-800/50 border border-purple-600 text-white placeholder:text-white/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              
              <div>
                <label className="block text-white/80 text-sm mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full bg-purple-800/50 border border-purple-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full bg-purple-800/50 border border-purple-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-1">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-purple-800/50 border border-purple-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="UPCOMING">Sắp diễn ra</option>
                  <option value="EXPIRED">Đã hết hạn</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách khuyến mãi */}
        <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Danh sách khuyến mãi</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">Không tìm thấy khuyến mãi nào phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20 text-left">
                    <th className="pb-4 text-sm font-semibold text-white/80">Tên</th>
                    <th className="pb-4 text-sm font-semibold text-white/80">Giảm giá</th>
                    <th className="pb-4 text-sm font-semibold text-white/80">Thời gian</th>
                    <th className="pb-4 text-sm font-semibold text-white/80">Trạng thái</th>
                    <th className="pb-4 text-sm font-semibold text-white/80">Mô tả</th>
                    <th className="pb-4 text-center text-sm font-semibold text-white/80">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="py-5 text-white font-medium">{promotion.name}</td>
                      <td className="py-5 text-white font-medium">
                        {promotion.discountPercent 
                          ? `${promotion.discountPercent}%` 
                          : promotion.discountAmount 
                          ? `${promotion.discountAmount.toLocaleString('vi-VN')}đ` 
                          : 'N/A'}
                      </td>
                      <td className="py-5">
                        <div className="text-sm text-white/80">
                          {formatDate(promotion.startDate)} → {formatDate(promotion.endDate)}
                        </div>
                      </td>
                      <td className="py-5">
                        <div>
                          {isExpired(promotion.endDate) ? (
                            <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded">Hết hạn</span>
                          ) : isActive(promotion) ? (
                            <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">Đang hoạt động</span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded">Sắp diễn ra</span>
                          )}
                        </div>
                        <div className="mt-2">
                          {promotion.isActive ? (
                            <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded">Active</span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-gray-500 text-white text-xs rounded">Inactive</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 text-white/80 max-w-xs">
                        <p className="line-clamp-2">{promotion.description || 'Không có mô tả'}</p>
                      </td>
                      <td className="py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleOpenDialog(promotion)}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(promotion.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl shadow-2xl border border-purple-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                {editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi mới"}
              </h2>

              <div className="space-y-6">
                {/* Các input giống hệt file cũ, mình giữ nguyên để bạn dễ dùng */}
                <div>
                  <label className="block text-white/80 mb-2">Tên khuyến mãi</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="VD: Black Friday 2025"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">Giảm theo % (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discountPercent || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discountPercent: e.target.value ? Number(e.target.value) : null,
                        discountAmount: null // Clear amount khi nhập percent
                      })}
                      className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="VD: 20"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Hoặc giảm số tiền cố định</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.discountAmount || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discountAmount: e.target.value ? Number(e.target.value) : null,
                        discountPercent: null // Clear percent khi nhập amount
                      })}
                      className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="VD: 50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Trạng thái</label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="true">Kích hoạt</option>
                    <option value="false">Tạm ngưng</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Mô tả</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-700/50 border border-purple-500 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    placeholder="Mô tả chi tiết về khuyến mãi..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={handleCloseDialog}
                  className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  {editingPromotion ? "Cập nhật" : "Tạo khuyến mãi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}