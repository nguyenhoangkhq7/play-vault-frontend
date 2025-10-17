"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, Tooltip } from "recharts"
import { TrendingUpIcon, TrendingDownIcon, EyeIcon } from "lucide-react"
import { saveAs } from 'file-saver'
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";



// Mock data
const monthlyRevenueData = [
  { month: "T1", revenue: 48500 },
  { month: "T2", revenue: 52300 },
  { month: "T3", revenue: 55800 },
  { month: "T4", revenue: 58200 },
  { month: "T5", revenue: 62100 },
  { month: "T6", revenue: 68500 },
  { month: "T7", revenue: 71200 },
  { month: "T8", revenue: 73800 },
  { month: "T9", revenue: 76500 },
  { month: "T10", revenue: 82300 },
  { month: "T11", revenue: 89100 },
  { month: "T12", revenue: 95200 },
]

const gamesData = [
  {
    id: 1,
    name: "Puzzle Master",
    revenue: 156780,
    players: 15600,
    conversionRate: 12.5,
    trend: 8.2,
    status: "Hoạt động",
    monthlyData: monthlyRevenueData,
  },
  {
    id: 2,
    name: "Racing Thunder",
    revenue: 234500,
    players: 28900,
    conversionRate: 15.8,
    trend: 12.5,
    status: "Hoạt động",
    monthlyData: monthlyRevenueData,
  },
]

const timeRanges = [
  { value: "7days", label: "7 ngày qua" },
  { value: "30days", label: "30 ngày qua" },
  { value: "3months", label: "3 tháng qua" },
  { value: "6months", label: "6 tháng qua" },
  { value: "year", label: "Năm nay" },
  { value: "all", label: "Tất cả" },
]


export default function PublisherManagerRevenue() {
    // Bên trong component PublisherManagerRevenue(), thêm hàm:
const handleExportCSV = () => {
  const header = ["Tên game", "Doanh thu", "Người chơi", "Tỷ lệ chuyển đổi", "Xu hướng"]
  const rows = filteredGames.map(g => [
    g.name,
    g.revenue,
    g.players,
    g.conversionRate,
    g.trend
  ])

  const csvContent =
    [header, ...rows]
      .map(e => e.join(","))
      .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, "bao_cao_doanh_thu.csv")
}
const exportToCSV = () => {
  const csvRows = []

  // Thêm tiêu đề báo cáo
  csvRows.push("BÁO CÁO DOANH THU")
  csvRows.push("")

  // Thêm thống kê tổng quan
  csvRows.push("TỔNG QUAN")
  csvRows.push(`Tổng doanh thu,${totalRevenue.toLocaleString()}đ`)
  csvRows.push(`Tổng người chơi,${totalPlayers.toLocaleString()}`)
  csvRows.push(`Số lượng game,${totalGames}`)
  csvRows.push(`TB doanh thu/game,${Math.round(avgRevenuePerGame).toLocaleString()}đ`)
  csvRows.push("")

  // Thêm doanh thu theo tháng
  csvRows.push("DOANH THU THEO THÁNG")
  csvRows.push("Tháng,Doanh thu")
  monthlyRevenueData.forEach((item) => {
    csvRows.push(`${item.month},${item.revenue}đ`)
  })
  csvRows.push("")

  // Thêm chi tiết từng game
  csvRows.push("CHI TIẾT DOANH THU THEO GAME")
  csvRows.push("Tên game,Doanh thu,Người chơi,Tỷ lệ chuyển đổi,Xu hướng,Trạng thái")
  filteredGames.forEach((game) => {
    csvRows.push(
      `${game.name},${game.revenue}đ,${game.players},${game.conversionRate}%,${game.trend > 0 ? "+" : ""}${game.trend}%,${game.status}`,
    )
  })

  // Tạo blob và tải về
  const csvContent = csvRows.join("\n")
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `bao-cao-doanh-thu-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportToExcel = async () => {
  const XLSX = await import("xlsx")

  const wb = XLSX.utils.book_new()

  // Sheet Tổng quan
  const summaryData = [
    ["BÁO CÁO DOANH THU"],
    [],
    ["TỔNG QUAN"],
    ["Tổng doanh thu", `${totalRevenue.toLocaleString()}đ`],
    ["Tổng người chơi", totalPlayers.toLocaleString()],
    ["Số lượng game", totalGames],
    ["TB doanh thu/game", `${Math.round(avgRevenuePerGame).toLocaleString()}đ`],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summarySheet, "Tổng quan")

  // Sheet doanh thu theo tháng
  const monthlyData = [
    ["DOANH THU THEO THÁNG"],
    [],
    ["Tháng", "Doanh thu"],
    ...monthlyRevenueData.map((item) => [item.month, `${item.revenue}đ`]),
  ]
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)
  XLSX.utils.book_append_sheet(wb, monthlySheet, "Doanh thu theo tháng")

  // Sheet chi tiết game
  const gamesDetailsData = [
    ["CHI TIẾT DOANH THU THEO GAME"],
    [],
    ["Tên game", "Doanh thu", "Người chơi", "Tỷ lệ chuyển đổi", "Xu hướng", "Trạng thái"],
    ...filteredGames.map((game) => [
      game.name,
      `${game.revenue}đ`,
      game.players,
      `${game.conversionRate}%`,
      `${game.trend > 0 ? "+" : ""}${game.trend}%`,
      game.status,
    ]),
  ]
  const gamesSheet = XLSX.utils.aoa_to_sheet(gamesDetailsData)
  XLSX.utils.book_append_sheet(wb, gamesSheet, "Chi tiết game")

  // Ghi file Excel
  XLSX.writeFile(wb, `bao-cao-doanh-thu-${new Date().toISOString().split("T")[0]}.xlsx`)
}

  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState("year")
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedGameDetail, setSelectedGameDetail] = useState(null)
  const [searchQuery, setSearchQuery] = useState("") // thêm sau các state khác

  const totalRevenue = gamesData.reduce((sum, g) => sum + g.revenue, 0)
  const totalPlayers = gamesData.reduce((sum, g) => sum + g.players, 0)
  const totalGames = gamesData.length
  const avgRevenuePerGame = totalRevenue / totalGames

  const filteredGames = gamesData
  .filter((g) => selectedGame === "all" || g.id.toString() === selectedGame)
  .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))


  const handleViewDetail = (game) => {
    setSelectedGameDetail(game)
    setDetailDialogOpen(true)
  }
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Báo cáo doanh thu</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-white/20"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <input
  type="text"
  placeholder="Tìm kiếm theo tên..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="p-2 rounded bg-white/10 text-white border border-white/20 placeholder-white/50"
/>


          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="p-2 rounded bg-white/10 text-white border border-white/20"
          >
            <option value="all">Tất cả game</option>
            {gamesData.map((game) => (
              <option key={game.id} value={game.id.toString()}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">Tổng doanh thu</p>
            <p className="mt-2 text-3xl font-bold text-white">{totalRevenue.toLocaleString()}đ</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-green-300">
              <TrendingUpIcon className="w-4 h-4" />
              +12.5%
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">Tổng người chơi</p>
            <p className="mt-2 text-3xl font-bold text-white">{totalPlayers.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-green-300">
              <TrendingUpIcon className="w-4 h-4" />
              +5.2%
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">Số lượng game</p>
            <p className="mt-2 text-3xl font-bold text-white">{totalGames}</p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">TB doanh thu/game</p>
            <p className="mt-2 text-3xl font-bold text-white">{Math.round(avgRevenuePerGame).toLocaleString()}đ</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">Doanh thu theo tháng</h2>
          <AreaChart data={monthlyRevenueData} width={700} height={300}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(value) => `${Number(value).toLocaleString()}đ`} />
            <Area type="monotone" dataKey="revenue" stroke="#a78bfa" fill="url(#revenueGradient)" />
          </AreaChart>
        </div>

        {/* Games Revenue Table */}
        <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">Chi tiết doanh thu theo game</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3 text-left text-sm font-medium text-white/80">Tên game</th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">Doanh thu</th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">Người chơi</th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">Tỷ lệ chuyển đổi</th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">Xu hướng</th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game) => (
                  <tr key={game.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 text-white">{game.name}</td>
                    <td className="py-4 text-white">{game.revenue.toLocaleString()}đ</td>
                    <td className="py-4 text-white">{game.players.toLocaleString()}</td>
                    <td className="py-4 text-green-300">+{game.conversionRate}%</td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 ${game.trend > 0 ? "text-green-300" : "text-red-300"}`}>
                        {game.trend > 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                        {game.trend > 0 ? "+" : ""}
                        {game.trend}%
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        className="flex items-center gap-1 px-2 py-1 rounded border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => handleViewDetail(game)}
                      >
                        <EyeIcon className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <DropdownMenu.Root>
  <DropdownMenu.Trigger 
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    Xuất báo cáo
  </DropdownMenu.Trigger>

  <DropdownMenu.Content 
    className="mt-2 w-40 bg-white rounded shadow-lg border border-gray-200 overflow-hidden"
  >
    <DropdownMenu.Item
      onClick={exportToCSV}
      className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
    >
      Xuất file CSV
    </DropdownMenu.Item>

    <DropdownMenu.Item
      onClick={exportToExcel}
      className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
    >
      Xuất file Excel
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

            

  <button
    onClick={handleExportCSV}
    className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
  >
    Xuất CSV
  </button>
</div>
        </div>

      </div>

      {/* Detail Dialog */}
      {detailDialogOpen && selectedGameDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-4xl w-full bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Chi tiết doanh thu - {selectedGameDetail.name}</h2>
              <button onClick={() => setDetailDialogOpen(false)} className="text-white font-bold">✕</button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/80">Tổng doanh thu</p>
                <p className="mt-2 text-2xl font-bold">{selectedGameDetail.revenue.toLocaleString()}đ</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/80">Người chơi</p>
                <p className="mt-2 text-2xl font-bold">{selectedGameDetail.players.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/80">Xu hướng</p>
                <p className={`mt-2 flex items-center gap-1 text-2xl font-bold ${selectedGameDetail.trend > 0 ? "text-green-300" : "text-red-300"}`}>
                  {selectedGameDetail.trend > 0 ? <TrendingUpIcon className="w-6 h-6" /> : <TrendingDownIcon className="w-6 h-6" />}
                  {selectedGameDetail.trend > 0 ? "+" : ""}{selectedGameDetail.trend}%
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="mb-4 text-lg font-semibold">Doanh thu theo tháng</h3>
              <BarChart data={selectedGameDetail.monthlyData} width={700} height={300}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}đ`} />
                <Bar dataKey="revenue" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
