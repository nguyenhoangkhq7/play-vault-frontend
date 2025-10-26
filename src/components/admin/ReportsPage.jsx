
import { useState, useRef } from "react"
import { Calendar, Download, Filter, X } from "lucide-react"
import ReportsOverview from "./ReportsOverview"
import RevenueAnalytics from "./RevenueAnalytics"
import UserAnalytics from "./UserAnalytics"
import GameAnalytics from "./GameAnalytics"
import ExportModal from "./ExportModal"
import GameRevenueBreakdown from "./GameRevenueBreakdown"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("7days")
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customDateType, setCustomDateType] = useState("range")
  const [customDateRange, setCustomDateRange] = useState({ from: "", to: "" })
  const [customMonth, setCustomMonth] = useState("")
  const [customMonthYear, setCustomMonthYear] = useState(new Date().getFullYear().toString())
  const [customYear, setCustomYear] = useState("")

  const revenueRef = useRef(null)
  const usersRef = useRef(null)
  const gamesRef = useRef(null)
  const gameRevenueRef = useRef(null)

  const dateRanges = [
    { value: "24hours", label: "24 giờ qua" },
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "90days", label: "90 ngày qua" },
    { value: "custom", label: "Tùy chỉnh" },
  ]

  const categories = [
    { value: "all", label: "Tất cả báo cáo", ref: null },
    { value: "revenue", label: "Doanh thu", ref: revenueRef },
    { value: "users", label: "Người dùng", ref: usersRef },
    { value: "games", label: "Game", ref: gamesRef },
  ]

  const getActualDateRange = () => {
    const today = new Date()
    let startDate, endDate

    if (dateRange.startsWith("custom:")) {
      if (customDateType === "range" && customDateRange.from && customDateRange.to) {
        return {
          from: customDateRange.from,
          to: customDateRange.to,
          label: `${customDateRange.from} - ${customDateRange.to}`,
        }
      } else if (customDateType === "month" && customMonth && customMonthYear) {
        const year = Number.parseInt(customMonthYear)
        const month = Number.parseInt(customMonth)
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)
        const monthNames = [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ]
        return {
          from: firstDay.toISOString().split("T")[0],
          to: lastDay.toISOString().split("T")[0],
          label: `${monthNames[month - 1]} ${customMonthYear}`,
        }
      } else if (customDateType === "year" && customYear) {
        const year = Number.parseInt(customYear)
        return {
          from: `${year}-01-01`,
          to: `${year}-12-31`,
          label: `Năm ${customYear}`,
        }
      }
    }

    endDate = today.toISOString().split("T")[0]

    switch (dateRange) {
      case "24hours":
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        return { from: startDate, to: endDate, label: "24 giờ qua" }
      case "7days":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        return { from: startDate, to: endDate, label: "7 ngày qua" }
      case "30days":
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        return { from: startDate, to: endDate, label: "30 ngày qua" }
      case "90days":
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        return { from: startDate, to: endDate, label: "90 ngày qua" }
      default:
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        return { from: startDate, to: endDate, label: "7 ngày qua" }
    }
  }

  const handleDateRangeChange = (value) => {
    if (value === "custom") {
      setShowCustomDatePicker(true)
    } else {
      setDateRange(value)
    }
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    const category = categories.find((cat) => cat.value === value)
    if (category?.ref?.current) {
      category.ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleApplyCustomDate = () => {
    let label = ""
    if (customDateType === "range" && customDateRange.from && customDateRange.to) {
      label = `${customDateRange.from} - ${customDateRange.to}`
    } else if (customDateType === "month" && customMonth && customMonthYear) {
      const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ]
      label = `${monthNames[Number.parseInt(customMonth) - 1]} ${customMonthYear}`
    } else if (customDateType === "year" && customYear) {
      label = `Năm ${customYear}`
    }

    if (label) {
      setDateRange(`custom:${label}`)
      setShowCustomDatePicker(false)
    }
  }

  const getDateRangeLabel = () => {
    if (dateRange.startsWith("custom:")) {
      return dateRange.replace("custom:", "")
    }
    return dateRanges.find((r) => r.value === dateRange)?.label || "7 ngày qua"
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Báo cáo & Thống kê</h3>
            <p className="text-pink-200">Phân tích chi tiết về hoạt động kinh doanh</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
              <Calendar className="h-4 w-4 text-pink-400" />
              <select
                value={dateRange.startsWith("custom:") ? "custom" : dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value} className="bg-purple-950">
                    {range.value === "custom" && dateRange.startsWith("custom:") ? getDateRangeLabel() : range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
              <Filter className="h-4 w-4 text-pink-400" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-purple-950">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Game Revenue Breakdown section */}
      <div ref={gameRevenueRef}>
        <GameRevenueBreakdown dateRange={dateRange} />
      </div>

      {/* Reports Content */}
      <div ref={revenueRef}>
        <ReportsOverview dateRange={dateRange} />
        <div className="mt-6">
          <RevenueAnalytics dateRange={dateRange} />
        </div>
      </div>

      <div ref={usersRef}>
        <UserAnalytics dateRange={dateRange} />
      </div>

      <div ref={gamesRef}>
        <GameAnalytics dateRange={dateRange} />
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} dateRangeInfo={getActualDateRange()} />
      )}

      {showCustomDatePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl shadow-2xl border border-purple-600/50 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-purple-600/50">
              <h3 className="text-xl font-bold text-white">Chọn khoảng thời gian</h3>
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="text-pink-300 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2 bg-purple-950/60 p-1 rounded-lg">
                <button
                  onClick={() => setCustomDateType("range")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${customDateType === "range"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                      : "text-pink-200 hover:text-white"
                    }`}
                >
                  Khoảng thời gian
                </button>
                <button
                  onClick={() => setCustomDateType("month")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${customDateType === "month"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                      : "text-pink-200 hover:text-white"
                    }`}
                >
                  Theo tháng
                </button>
                <button
                  onClick={() => setCustomDateType("year")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${customDateType === "year"
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                      : "text-pink-200 hover:text-white"
                    }`}
                >
                  Theo năm
                </button>
              </div>

              {customDateType === "range" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pink-200 mb-2">Từ ngày</label>
                    <input
                      type="date"
                      value={customDateRange.from}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                      className="w-full bg-purple-950/60 border border-purple-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pink-200 mb-2">Đến ngày</label>
                    <input
                      type="date"
                      value={customDateRange.to}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                      className="w-full bg-purple-950/60 border border-purple-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              )}

              {customDateType === "month" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pink-200 mb-2">Chọn tháng</label>
                    <select
                      value={customMonth}
                      onChange={(e) => setCustomMonth(e.target.value)}
                      className="w-full bg-purple-950/60 border border-purple-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">-- Chọn tháng --</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pink-200 mb-2">Chọn năm</label>
                    <select
                      value={customMonthYear}
                      onChange={(e) => setCustomMonthYear(e.target.value)}
                      className="w-full bg-purple-950/60 border border-purple-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {customDateType === "year" && (
                <div>
                  <label className="block text-sm font-medium text-pink-200 mb-2">Chọn năm</label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="w-full bg-purple-950/60 border border-purple-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">-- Chọn năm --</option>
                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-purple-600/50">
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="flex-1 px-4 py-2 bg-purple-950/60 hover:bg-purple-950 text-white rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyCustomDate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg transition-all"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
