"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, Link as LinkIcon, Search, CheckCircle, X } from "lucide-react"
import { useUser } from "../store/UserContext"

// Add animation styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
import {
  searchPromotions,
  createPromotion,
  updatePromotion,
  applyPromotionToGames,
  getGamesForPromotion,
} from "../api/promotions"
import { getMyGames } from "../api/games"

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

  // State tạm cho input search (chỉ update filters khi nhấn Enter)
  const [searchInput, setSearchInput] = useState("")

  // State cho modal gắn khuyến mãi vào games
  const [showGameSelectModal, setShowGameSelectModal] = useState(false)
  const [selectedPromotionId, setSelectedPromotionId] = useState(null)
  const [publisherGames, setPublisherGames] = useState([])
  const [selectedGameIds, setSelectedGameIds] = useState([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [gamePromotionMap, setGamePromotionMap] = useState(new Map()) // Map gameId -> promotionId
  
  // State cho success notification
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ promotionName: '', count: 0 })
  
  // State cho toast notification (thay thế alert)
  const [toast, setToast] = useState({ show: false, message: '', type: '' }) // type: 'success', 'error', 'warning'
  
  // Hàm hiển thị toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 4000)
  }

  // Fetch promotions khi component mount
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchPromotions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Fetch promotions khi filters thay đổi (trừ keyword vì keyword chỉ update khi Enter)
  useEffect(() => {
    if (!user) return
    fetchPromotionsWithFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fromDate, filters.toDate, filters.status, filters.keyword, user])

  // Handle Enter key để search
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setFilters({ ...filters, keyword: searchInput })
    }
  }

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
      
      // Validate các trường bắt buộc
      if (!formData.name || !formData.name.trim()) {
        showToast("Vui lòng nhập tên khuyến mãi", "error")
        setLoading(false)
        return
      }
      
      if (!formData.startDate) {
        showToast("Vui lòng chọn ngày bắt đầu", "error")
        setLoading(false)
        return
      }
      
      if (!formData.endDate) {
        showToast("Vui lòng chọn ngày kết thúc", "error")
        setLoading(false)
        return
      }
      
      // Validate phải có ít nhất một loại giảm giá
      const hasDiscountPercent = formData.discountPercent !== null && formData.discountPercent !== undefined && formData.discountPercent !== ''
      const hasDiscountAmount = formData.discountAmount !== null && formData.discountAmount !== undefined && formData.discountAmount !== ''
      
      if (!hasDiscountPercent && !hasDiscountAmount) {
        showToast("Vui lòng nhập giá trị giảm giá (% hoặc số tiền cố định)", "error")
        setLoading(false)
        return
      }
      
      // Validate ngày kết thúc phải sau ngày bắt đầu
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        showToast("Ngày kết thúc phải sau ngày bắt đầu", "error")
        setLoading(false)
        return
      }
      
      // Clean data trước khi gửi
      const cleanedData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      }
      
      // Chỉ thêm discountPercent hoặc discountAmount
      if (hasDiscountPercent) {
        cleanedData.discountPercent = Number(formData.discountPercent)
        cleanedData.discountAmount = null
      } else if (hasDiscountAmount) {
        cleanedData.discountAmount = Number(formData.discountAmount)
        cleanedData.discountPercent = null
      }
      
      console.log("📤 Sending data:", cleanedData)
      
      if (editingPromotion) {
        // Cập nhật khuyến mãi
        await updatePromotion(setAccessToken, editingPromotion.id, cleanedData)
        showToast("Cập nhật khuyến mãi thành công!", "success")
      } else {
        // Tạo mới promotion
        await createPromotion(setAccessToken, cleanedData)
        showToast("Tạo khuyến mãi mới thành công!", "success")
      }
      
      // Refresh danh sách
      await fetchPromotions()
      handleCloseDialog()
    } catch (err) {
      console.error("Error saving promotion:", err)
      console.error("Error response:", err.response)
      
      // Xử lý error message từ backend
      let errorMsg = "Không thể lưu khuyến mãi"
      
      if (err.response?.data) {
        // Nếu backend trả về string
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data
        }
        // Nếu backend trả về object có message
        else if (err.response.data.message) {
          errorMsg = err.response.data.message
        }
        // Nếu backend trả về object có error
        else if (err.response.data.error) {
          errorMsg = err.response.data.error
        }
      } else if (err.message) {
        errorMsg = err.message
      }
      
      showToast(errorMsg, "error")
    } finally {
      setLoading(false)
    }
  }
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  // Fetch danh sách game của publisher
  const fetchMyGames = async () => {
    try {
      setLoadingGames(true)
      const games = await getMyGames(setAccessToken)
      console.log("📦 Games from backend:", games) // Debug log
      setPublisherGames(games)
      
      // Build gamePromotionMap bằng cách lấy tất cả promotions
      console.log("📋 Fetching all promotions to build game-promotion map...")
      const allPromotionsResponse = await searchPromotions(setAccessToken, {
        status: "ALL",
        page: 0,
        size: 1000, // Lấy tất cả promotions
      })
      
      const allPromotions = allPromotionsResponse.content || []
      console.log("📋 Found promotions:", allPromotions.length)
      
      // Build map từ tất cả promotions
      const promoMap = new Map()
      
      // Dùng Promise.all để fetch games cho tất cả promotions song song
      await Promise.all(
        allPromotions.map(async (promo) => {
          try {
            const gameIds = await getGamesForPromotion(setAccessToken, promo.id)
            
            if (Array.isArray(gameIds) && gameIds.length > 0) {
              gameIds.forEach((gameId) => {
                promoMap.set(gameId, promo.id)
                console.log(`✅ Promotion "${promo.name}" (ID: ${promo.id}) → Game ID: ${gameId}`)
              })
            }
          } catch (error) {
            console.error(`Failed to fetch games for promotion ${promo.id}:`, error)
          }
        })
      )
      
      console.log("🗺️ GamePromotionMap:", promoMap)
      setGamePromotionMap(promoMap)
    } catch (err) {
      console.error("Error fetching games:", err)
      showToast("Không thể tải danh sách game", "error")
    } finally {
      setLoadingGames(false)
    }
  }

  // Tính giá sau khuyến mãi
  const calculateDiscountedPrice = (originalPrice, promotion) => {
    if (!promotion) return originalPrice
    
    let discountedPrice = originalPrice
    
    if (promotion.discountPercent) {
      discountedPrice = originalPrice * (1 - promotion.discountPercent / 100)
    } else if (promotion.discountAmount) {
      discountedPrice = originalPrice - promotion.discountAmount
    }
    
    return Math.max(0, discountedPrice) // Không cho giá âm
  }

  // Lấy thông tin promotion hiện tại
  const getCurrentPromotion = () => {
    return promotions.find(p => p.id === selectedPromotionId)
  }

  // Mở modal áp dụng khuyến mãi cho games
  const handleApplyToGames = async (promotionId) => {
    // Tìm promotion để kiểm tra trạng thái
    const promotion = promotions.find(p => p.id === promotionId)
    
    if (!promotion) {
      showToast("Không tìm thấy thông tin khuyến mãi!", "error")
      return
    }
    
    // Kiểm tra nếu khuyến mãi đã hết hạn
    if (isExpired(promotion.endDate)) {
      showToast("Khuyến mãi này đã hết hạn. Vui lòng chọn khuyến mãi đang hoạt động.", "warning")
      return
    }
    
    // Kiểm tra nếu khuyến mãi chưa bắt đầu (sắp diễn ra)
    if (!isActive(promotion)) {
      showToast("Khuyến mãi này chưa bắt đầu. Vui lòng đợi đến ngày " + formatDate(promotion.startDate) + " để áp dụng.", "warning")
      return
    }
    
    // Kiểm tra nếu promotion không active (bị tạm ngưng)
    if (!promotion.isActive) {
      showToast("Khuyến mãi này đang bị tạm ngưng. Vui lòng kích hoạt lại khuyến mãi trước.", "warning")
      return
    }
    
    setSelectedPromotionId(promotionId)
    setSelectedGameIds([])
    setShowGameSelectModal(true)
    await fetchMyGames()
  }

  // Toggle chọn game
  const toggleGameSelection = (gameId) => {
    // Kiểm tra nếu game đã có promotion khác
    const existingPromoId = gamePromotionMap.get(gameId)
    if (existingPromoId && existingPromoId !== selectedPromotionId) {
      showToast(`Game này đã có khuyến mãi khác. Vui lòng gỡ khuyến mãi cũ trước.`, "warning")
      return
    }
    
    setSelectedGameIds(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    )
  }

  // Xác nhận áp dụng khuyến mãi cho các games đã chọn
  const handleConfirmApply = async () => {
    if (selectedGameIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một game", "warning")
      return
    }

    const count = selectedGameIds.length
    const appliedGameIds = [...selectedGameIds]
    const currentPromotion = promotions.find(p => p.id === selectedPromotionId)

    try {
      setLoading(true)
      
      // 1. Apply promotion to games
      await applyPromotionToGames(setAccessToken, selectedPromotionId, appliedGameIds)
      
      // 2. Cập nhật gamePromotionMap ngay lập tức (không cần fetch lại)
      const newMap = new Map(gamePromotionMap)
      appliedGameIds.forEach(gameId => {
        newMap.set(gameId, selectedPromotionId)
      })
      setGamePromotionMap(newMap)
      
      // 3. Reset selected games và đóng modal
      setSelectedGameIds([])
      setShowGameSelectModal(false)
      
      // 4. Hiển thị notification
      setSuccessMessage({
        promotionName: currentPromotion?.name || 'Khuyến mãi',
        count: count
      })
      setShowSuccessNotification(true)
      
      // Tự động ẩn sau 3 giây
      setTimeout(() => {
        setShowSuccessNotification(false)
      }, 3000)
      
    } catch (err) {
      console.error("Error applying promotion:", err)
      const errorMessage = err.response?.data?.message 
        || err.response?.data 
        || err.message 
        || "Không thể áp dụng khuyến mãi"
      showToast(typeof errorMessage === 'string' ? errorMessage : "Không thể áp dụng khuyến mãi", "error")
    } finally {
      setLoading(false)
    }
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
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
        {/* Header Modern 2025 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
                Quản lý khuyến mãi
              </h1>
              <p className="text-gray-400 text-sm">Tạo và quản lý các chương trình khuyến mãi của bạn</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isFilterOpen 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Bộ lọc</span>
              </button>
              
              <button
                onClick={() => handleOpenDialog()}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/60"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo khuyến mãi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bộ lọc nâng cao - Modern 2025 */}
        {isFilterOpen && (
          <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 mb-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-white">Bộ lọc nâng cao</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">Tìm kiếm</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    placeholder="Tìm theo tên khuyến mãi... (Enter để tìm)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput('')
                        setFilters({ ...filters, keyword: '' })
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-gray-300 text-sm font-medium mb-2">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">📋 Tất cả</option>
                  <option value="ACTIVE" className="bg-slate-900">✅ Đang hoạt động</option>
                  <option value="UPCOMING" className="bg-slate-900">⏰ Sắp diễn ra</option>
                  <option value="EXPIRED" className="bg-slate-900">❌ Đã hết hạn</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách khuyến mãi - Modern 2025 */}
        <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 md:p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Danh sách khuyến mãi</h2>
              <p className="text-gray-400 text-sm mt-1">Quản lý tất cả các chương trình khuyến mãi</p>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 text-lg font-medium">{error}</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">Không tìm thấy khuyến mãi nào phù hợp</p>
              <p className="text-gray-500 text-sm mt-2">Thử điều chỉnh bộ lọc hoặc tạo khuyến mãi mới</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b-2 border-white/10">
                    <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Tên khuyến mãi</th>
                    <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Giảm giá</th>
                    <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Thời gian</th>
                    <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Trạng thái</th>
                    <th className="pb-4 pt-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Mô tả</th>
                    <th className="pb-4 pt-2 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPromotions.map((promotion, index) => (
                    <tr 
                      key={promotion.id} 
                      className="group hover:bg-white/5 transition-all duration-200"
                      style={{animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`}}
                    >
                      <td className="py-5 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {promotion.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold group-hover:text-purple-400 transition-colors">{promotion.name}</p>
                            <p className="text-xs text-gray-500">ID: #{promotion.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-2">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg px-3 py-2">
                          <span className="text-2xl">🔥</span>
                          <span className="text-white font-bold text-lg">
                            {promotion.discountPercent 
                              ? `-${promotion.discountPercent}%` 
                              : promotion.discountAmount 
                              ? `-${promotion.discountAmount.toLocaleString('vi-VN')}` 
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="text-green-400">▶</span>
                            <span>{formatDate(promotion.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="text-red-400">⏹</span>
                            <span>{formatDate(promotion.endDate)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-2">
                        <div className="space-y-2">
                          {isExpired(promotion.endDate) ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold rounded-lg">
                              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                              Hết hạn
                            </span>
                          ) : isActive(promotion) ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold rounded-lg">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded-lg">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                              Sắp diễn ra
                            </span>
                          )}
                          <div>
                            {promotion.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-semibold rounded-lg">
                                ✓ Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/20 border border-gray-500/50 text-gray-400 text-xs font-semibold rounded-lg">
                                ⏸ Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-2 max-w-xs">
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {promotion.description || 'Chưa có mô tả chi tiết cho khuyến mãi này'}
                        </p>
                      </td>
                      <td className="py-5 px-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApplyToGames(promotion.id)}
                            disabled={isExpired(promotion.endDate) || !isActive(promotion) || !promotion.isActive}
                            className={`group relative px-4 py-2.5 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                              isExpired(promotion.endDate) || !isActive(promotion) || !promotion.isActive
                                ? 'bg-gray-600/20 border border-gray-600/30 cursor-not-allowed opacity-40 text-gray-500'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105'
                            }`}
                            title={
                              isExpired(promotion.endDate) 
                                ? "Khuyến mãi đã hết hạn - Không thể gắn game"
                                : !isActive(promotion)
                                ? "Khuyến mãi chưa bắt đầu - Không thể gắn game"
                                : !promotion.isActive
                                ? "Khuyến mãi đang bị tạm ngưng - Không thể gắn game"
                                : "Áp dụng cho games"
                            }
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Gắn game</span>
                          </button>
                          <button
                            onClick={() => handleOpenDialog(promotion)}
                            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all"
                          >
                            Sửa
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
    </div>

    {/* Modal chọn games - Modern 2025 */}
    {showGameSelectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                      Chọn games để áp dụng khuyến mãi
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-gray-400 text-sm">Khuyến mãi:</span>
                    <span className="text-green-400 font-semibold">
                      {getCurrentPromotion()?.name || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGameSelectModal(false)
                    setSelectedGameIds([])
                    setSelectedPromotionId(null)
                  }}
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all"
                  title="Đóng"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loadingGames ? (
                <div className="text-center py-12">
                  <p className="text-white/60 text-lg">Đang tải danh sách game...</p>
                </div>
              ) : publisherGames.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60 text-lg">Bạn chưa có game nào</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {publisherGames
                      .filter(game => {
                        // Lọc bỏ những game đã có khuyến mãi này rồi
                        const isCurrentPromo = gamePromotionMap.get(game.id) === selectedPromotionId
                        return !isCurrentPromo // Chỉ hiển thị game chưa có KM này
                      })
                      .map(game => {
                        const hasPromotion = gamePromotionMap.has(game.id)
                        const isCurrentPromo = gamePromotionMap.get(game.id) === selectedPromotionId
                        const hasDifferentPromo = hasPromotion && !isCurrentPromo
                        
                        return (
                          <div 
                            key={game.id}
                            className={`p-4 border rounded-xl transition-all ${
                              hasDifferentPromo
                                ? 'border-orange-500/50 bg-orange-500/10 cursor-not-allowed opacity-60'
                                : selectedGameIds.includes(game.id) 
                                ? 'border-green-500/50 bg-green-500/20 shadow-lg shadow-green-500/20 cursor-pointer hover:scale-105' 
                                : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer hover:scale-105'
                            }`}
                            onClick={() => !hasDifferentPromo && toggleGameSelection(game.id)}
                          >
                            <div className="relative mb-3">
                              <img 
                                src={game.thumbnail || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game'} 
                                alt={game.name}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              {hasDifferentPromo && (
                                <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-lg">
                                  Đã có KM
                                </div>
                              )}
                              {isCurrentPromo && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-lg">
                                  KM này
                                </div>
                              )}
                              {selectedGameIds.includes(game.id) && !hasPromotion && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-lg shadow-green-500/50">
                                  <CheckCircle className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <h3 className="text-white font-bold truncate mb-2">
                              {game.name}
                            </h3>
                            
                            {/* Preview giá khuyến mãi */}
                            {(() => {
                              const currentPromo = getCurrentPromotion()
                              const originalPrice = game.price || 0
                              const discountedPrice = calculateDiscountedPrice(originalPrice, currentPromo)
                              
                              
                              
                              return (
                                <div className="space-y-1">
                                  {/* Giá gốc */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Giá gốc:</span>
                                    <span className={`text-sm font-semibold ${!hasDifferentPromo && !isCurrentPromo ? 'line-through text-gray-400' : 'text-purple-300'}`}>
                                      {originalPrice.toLocaleString('vi-VN')} GCoin
                                    </span>
                                  </div>
                                  
                                  {/* Giá sau KM - chỉ hiển thị nếu không có promotion khác */}
                                  {!hasDifferentPromo && currentPromo && (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <span className="text-green-400 text-xs">Giá KM:</span>
                                        <span className="text-lg font-bold text-green-400">
                                          {discountedPrice.toLocaleString('vi-VN')} GCoin
                                        </span>
                                      </div>
                                    
                                    </>
                                  )}
                                  
                                  {/* Thông báo nếu game có promotion khác */}
                                  {hasDifferentPromo && (
                                    <div className="bg-orange-500/20 border border-orange-500/50 rounded px-2 py-1 mt-2">
                                      <p className="text-orange-400 text-xs font-semibold">
                                        ⚠ Đã có khuyến mãi khác
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Thông báo nếu đang áp dụng KM này */}
                                  {isCurrentPromo && (
                                    <div className="bg-blue-500/20 border border-blue-500/50 rounded px-2 py-1 mt-2">
                                      <p className="text-blue-400 text-xs font-semibold">
                                        ✓ Đang áp dụng KM này
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )
                      })}
                  </div>

                  <div className="border-t border-purple-600 pt-4 mb-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-4">
                        <p className="text-white">
                          Đã chọn: <span className="font-bold text-green-400">{selectedGameIds.length}</span> game
                        </p>
                        {(() => {
                          const hiddenGamesCount = publisherGames.filter(game => gamePromotionMap.get(game.id) === selectedPromotionId).length
                          if (hiddenGamesCount > 0) {
                            return (
                              <p className="text-yellow-400 text-sm flex items-center gap-1">
                                <span className="text-lg">ℹ️</span>
                                <span>{hiddenGamesCount} game đã có KM này (đã ẩn)</span>
                              </p>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowGameSelectModal(false)
                    setSelectedGameIds([])
                    setSelectedPromotionId(null)
                  }}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all font-medium"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleConfirmApply}
                  disabled={selectedGameIds.length === 0}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    selectedGameIds.length === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30'
                  }`}
                >
                  Áp dụng cho {selectedGameIds.length} game(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa - Modern 2025 */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                    {editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi mới"}
                  </h2>
                </div>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all"
                  title="Đóng"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Tên khuyến mãi */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tên khuyến mãi <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                    placeholder="VD: Black Friday 2025"
                    required
                  />
                </div>

                {/* Discount Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Giảm theo % (0-100) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discountPercent || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discountPercent: e.target.value ? Number(e.target.value) : null,
                        discountAmount: null
                      })}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                      placeholder="VD: 20"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Hoặc giảm cố định (GCoin) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.discountAmount || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        discountAmount: e.target.value ? Number(e.target.value) : null,
                        discountPercent: null
                      })}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                      placeholder="VD: 50000 GCoin"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Trạng thái</label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                  >
                    <option value="true" className="bg-slate-800">Kích hoạt</option>
                    <option value="false" className="bg-slate-800">Tạm ngưng</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Ngày bắt đầu <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Ngày kết thúc <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Mô tả (tùy chọn)</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all resize-none"
                    placeholder="Mô tả chi tiết về khuyến mãi..."
                  />
                </div>

                {/* Ghi chú */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm flex items-start gap-2">
                    <span className="text-red-400 font-bold">*</span>
                    <span>Các trường đánh dấu (<span className="text-red-400">*</span>) là bắt buộc. Bạn phải nhập giá trị giảm theo % HOẶC giảm cố định, không được bỏ trống cả hai.</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleCloseDialog}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  {editingPromotion ? "Cập nhật" : "Tạo khuyến mãi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification - Modern 2025 */}
      {showSuccessNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-green-900/30 to-slate-900 border border-green-500/50 rounded-2xl shadow-2xl shadow-green-500/20 max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                  Thành công!
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Đã áp dụng khuyến mãi{" "}
                  <span className="font-semibold text-green-400">"{successMessage.promotionName}"</span> cho{" "}
                  <span className="font-bold text-green-400">{successMessage.count} game</span>.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="mt-5 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slideIn">
          <div className={`min-w-[320px] max-w-md rounded-xl shadow-2xl p-4 backdrop-blur-md border ${
            toast.type === 'success' ? 'bg-green-500/90 border-green-400/50' :
            toast.type === 'error' ? 'bg-red-500/90 border-red-400/50' :
            toast.type === 'warning' ? 'bg-orange-500/90 border-orange-400/50' :
            'bg-blue-500/90 border-blue-400/50'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-white" />}
                {toast.type === 'error' && <X className="w-6 h-6 text-white" />}
                {toast.type === 'warning' && <span className="text-2xl">⚠️</span>}
                {toast.type === 'info' && <span className="text-2xl">ℹ️</span>}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: '', type: '' })}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}