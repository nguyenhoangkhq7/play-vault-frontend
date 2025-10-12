"use client"

import { TrendingUp, DollarSign, ChevronRight, Filter, ArrowUpDown, Search } from "lucide-react"
import { useState } from "react"

export default function GameRevenueBreakdown({ dateRange }) {
  const [showAll, setShowAll] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("revenue")
  const [gameSearchQuery, setGameSearchQuery] = useState("")

  // ✅ Dữ liệu 12 game (có hình ảnh)
  const gameRevenues = [
    {
      id: "1",
      name: "Cyberpunk 2077",
      revenue: 1250000,
      sales: 2500,
      trend: 12.5,
      color: "from-cyan-500 to-blue-600",
      category: "rpg",
      image: "/images/games/cyberpunk.jpg",
    },
    {
      id: "2",
      name: "The Witcher 3",
      revenue: 980000,
      sales: 3200,
      trend: 8.3,
      color: "from-purple-500 to-pink-600",
      category: "rpg",
      image: "/images/games/witcher3.jpg",
    },
    {
      id: "3",
      name: "Red Dead Redemption 2",
      revenue: 1450000,
      sales: 2100,
      trend: 15.7,
      color: "from-orange-500 to-red-600",
      category: "action",
      image: "/images/games/rdr2.jpg",
    },
    {
      id: "4",
      name: "GTA V",
      revenue: 2100000,
      sales: 4200,
      trend: 22.1,
      color: "from-green-500 to-emerald-600",
      category: "action",
      image: "/images/games/gtav.jpg",
    },
    {
      id: "5",
      name: "Elden Ring",
      revenue: 1680000,
      sales: 3800,
      trend: 18.9,
      color: "from-yellow-500 to-orange-600",
      category: "rpg",
      image: "/images/games/eldenring.jpg",
    },
    {
      id: "6",
      name: "God of War",
      revenue: 1320000,
      sales: 2900,
      trend: 10.2,
      color: "from-red-500 to-pink-600",
      category: "action",
      image: "/images/games/godofwar.jpg",
    },
    {
      id: "7",
      name: "Hogwarts Legacy",
      revenue: 1890000,
      sales: 4100,
      trend: 25.4,
      color: "from-indigo-500 to-purple-600",
      category: "rpg",
      image: "/images/games/hogwarts.jpg",
    },
    {
      id: "8",
      name: "Starfield",
      revenue: 1560000,
      sales: 3300,
      trend: 14.6,
      color: "from-blue-500 to-cyan-600",
      category: "rpg",
      image: "/images/games/starfield.jpg",
    },
    {
      id: "9",
      name: "Baldur's Gate 3",
      revenue: 1780000,
      sales: 3600,
      trend: 20.3,
      color: "from-violet-500 to-purple-600",
      category: "rpg",
      image: "/images/games/baldursgate3.jpg",
    },
    {
      id: "10",
      name: "Spider-Man 2",
      revenue: 1920000,
      sales: 3900,
      trend: 17.8,
      color: "from-red-500 to-orange-600",
      category: "action",
      image: "/images/games/spiderman2.jpg",
    },
    {
      id: "11",
      name: "Final Fantasy XVI",
      revenue: 1340000,
      sales: 2700,
      trend: 11.5,
      color: "from-blue-500 to-purple-600",
      category: "rpg",
      image: "/images/games/finalfantasy16.jpg",
    },
    {
      id: "12",
      name: "Resident Evil 4",
      revenue: 1480000,
      sales: 3100,
      trend: 13.9,
      color: "from-red-500 to-gray-600",
      category: "horror",
      image: "/images/games/re4.jpg",
    },
  ]

  // 🔍 Lọc và sắp xếp
  let filtered = gameRevenues.filter((g) =>
    g.name.toLowerCase().includes(gameSearchQuery.toLowerCase())
  )
  if (selectedCategory !== "all") filtered = filtered.filter((g) => g.category === selectedCategory)
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "revenue"
      ? b.revenue - a.revenue
      : sortBy === "sales"
        ? b.sales - a.sales
        : sortBy === "trend"
          ? b.trend - a.trend
          : a.name.localeCompare(b.name)
  )
  const displayed = showAll ? sorted : sorted.slice(0, 8)

  const totalRevenue = filtered.reduce((sum, g) => sum + g.revenue, 0)
  const totalSales = filtered.reduce((sum, g) => sum + g.sales, 0)

  return (
    <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Doanh thu theo Game</h3>
          <p className="text-pink-200 text-sm">
            {gameSearchQuery ? `Kết quả tìm kiếm: "${gameSearchQuery}"` : "Tất cả game"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <Search className="h-4 w-4 text-pink-400" />
            <input
              type="text"
              placeholder="Tìm kiếm game..."
              value={gameSearchQuery}
              onChange={(e) => setGameSearchQuery(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder-purple-300 min-w-[150px]"
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <Filter className="h-4 w-4 text-pink-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              <option value="all" className="bg-purple-950">
                Tất cả thể loại
              </option>
              <option value="rpg" className="bg-purple-950">
                RPG
              </option>
              <option value="action" className="bg-purple-950">
                Hành động
              </option>
              <option value="horror" className="bg-purple-950">
                Kinh dị
              </option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <ArrowUpDown className="h-4 w-4 text-pink-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              <option value="revenue" className="bg-purple-950">
                Doanh thu cao nhất
              </option>
              <option value="sales" className="bg-purple-950">
                Lượt bán nhiều nhất
              </option>
              <option value="trend" className="bg-purple-950">
                Tăng trưởng cao nhất
              </option>
              <option value="name" className="bg-purple-950">
                Tên A-Z
              </option>
            </select>
          </div>

          {/* Tổng */}
          <div className="text-right bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <div className="text-lg font-bold text-white">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                totalRevenue
              )}
            </div>
            <div className="text-pink-200 text-xs">{totalSales.toLocaleString()} lượt bán</div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayed.map((game) => (
          <div
            key={game.id}
            className="bg-purple-950/40 backdrop-blur-sm rounded-lg p-4 border border-purple-600/30 hover:border-purple-500/50 transition-all hover:scale-105"
          >
            {/* Ảnh game */}
            <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
              <img
                src={game.image}
                alt={game.name}
                className="object-cover w-full h-full rounded-lg"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 text-green-400 text-xs bg-black/40 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                <span>+{game.trend}%</span>
              </div>
            </div>

            <h4 className="text-white font-semibold mb-1 text-sm line-clamp-1">{game.name}</h4>
            <div className="text-lg font-bold text-white">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                game.revenue
              )}
            </div>
            <div className="text-pink-200 text-xs">{game.sales.toLocaleString()} lượt bán</div>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
      {sorted.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 bg-purple-950/60 hover:bg-purple-900/60 px-6 py-3 rounded-lg font-semibold text-white border border-purple-600/50 hover:border-purple-500/70 transition-all duration-200"
          >
            {showAll ? "Thu gọn" : `Xem tất cả (${sorted.length} game)`}
            <ChevronRight className={`h-4 w-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}
    </div>
  )
}
