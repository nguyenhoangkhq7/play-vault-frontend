"use client"

import { useState } from "react"
import { Search, ChevronDown, Trash2, Edit2, MoreHorizontal, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Footer from "@/components/home/footer"

const gameData = [
  {
    id: 1,
    image: "/resident-evil-village-game-cover.jpg",
    name: "Resident Evil Village",
    publisher: "Capcom/VN",
    price: "499.000đ",
    releaseDate: "12/05/2020",
    status: "Hoạt động",
  },
  {
    id: 2,
    image: "/hollow-knight-game-icon-blue.jpg",
    name: "Hollow Knight",
    publisher: "Team Cherry",
    price: "149.000đ",
    releaseDate: "12/05/2020",
    status: "Hoạt động",
  },
  {
    id: 3,
    image: "/hollow-knight-game-icon-blue.jpg",
    name: "King Of War",
    publisher: "Team Cherry",
    price: "100.000đ",
    releaseDate: "12/05/2020",
    status: "Không hoạt động",
  },
]

export function GamePage() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col">
      <header className="border-b border-purple-700/50 bg-purple-800/40 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-center items-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-lg">
            Quản lý Game
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 h-full flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 flex-shrink-0">
            {/* Total Games Card */}
            <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:bg-purple-600/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-purple-200 mb-2">Tổng số Game</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">152</p>
                  <p className="text-xs text-purple-300 mt-2">+12 trong tháng này</p>
                </div>
                <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg border border-purple-500/30 flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                </div>
              </div>
            </div>

            {/* Downloads Card */}
            <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:bg-purple-600/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-purple-200 mb-2">Số lượt Tải</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">283,234</p>
                  <p className="text-xs text-purple-300 mt-2">+8.2% so với tuần trước</p>
                </div>
                <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg border border-purple-500/30 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                </div>
              </div>
            </div>

            {/* Active Games Card */}
            <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:bg-purple-600/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-purple-200 mb-2">Game Hoạt Động</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">148</p>
                  <p className="text-xs text-purple-300 mt-2">97.4% tỷ lệ hoạt động</p>
                </div>
                <div className="bg-green-500/20 p-2 sm:p-3 rounded-lg border border-green-500/30 flex-shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/30 border border-green-400/50" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 flex-shrink-0">
            {/* Search Bar */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300 flex-shrink-0" />
              <Input
                placeholder="Tìm kiếm theo tên, publisher..."
                className="pl-10 bg-purple-700/30 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400/50 focus:bg-purple-700/40 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-purple-500/30 hover:bg-purple-700/40 gap-2 bg-purple-700/20 text-white hover:text-white flex-shrink-0 text-sm"
                >
                  Thể loại <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-purple-800 border-purple-600/50">
                <DropdownMenuItem
                  onClick={() => setCategoryFilter("all")}
                  className="text-white hover:bg-purple-700/50 cursor-pointer"
                >
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCategoryFilter("action")}
                  className="text-white hover:bg-purple-700/50 cursor-pointer"
                >
                  Hành động
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCategoryFilter("adventure")}
                  className="text-white hover:bg-purple-700/50 cursor-pointer"
                >
                  Phiêu lưu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="bg-purple-800/40 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-500/30 flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-white">Danh sách Game</h2>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30 bg-purple-700/20 sticky top-0">
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Ảnh
                    </th>
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Tên Game
                    </th>
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Publisher
                    </th>
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Giá
                    </th>
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Ngày phát hành
                    </th>
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="text-left text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gameData.map((game) => (
                    <tr
                      key={game.id}
                      className="border-b border-purple-600/30 hover:bg-purple-700/20 transition-colors duration-200"
                    >
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <img
                          src={game.image || "/placeholder.svg"}
                          alt={game.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-purple-500/30 flex-shrink-0"
                        />
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <p className="font-medium text-white text-sm truncate">{game.name}</p>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <p className="text-xs sm:text-sm text-purple-200 truncate">{game.publisher}</p>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <p className="font-medium text-white text-sm whitespace-nowrap">{game.price}</p>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <p className="text-xs sm:text-sm text-purple-200 whitespace-nowrap">{game.releaseDate}</p>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            game.status === "Hoạt động"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1 sm:mr-2 flex-shrink-0 ${
                              game.status === "Hoạt động" ? "bg-green-400" : "bg-red-400"
                            }`}
                          />
                          {game.status}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-purple-700/40 text-purple-200 flex-shrink-0"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-purple-800 border-purple-600/50">
                            <DropdownMenuItem className="cursor-pointer text-white hover:bg-purple-700/50 text-sm">
                              <Edit2 className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-300 hover:bg-purple-700/50 text-sm">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-purple-500/30 flex items-center justify-between bg-purple-700/20 flex-shrink-0 gap-2 flex-wrap">
              <p className="text-xs sm:text-sm text-purple-200">
                Hiển thị <span className="font-medium text-white">{gameData.length}</span> trên{" "}
                <span className="font-medium text-white">152</span> game
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 hover:bg-purple-700/40 bg-purple-700/20 text-white hover:text-white text-xs"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 hover:bg-purple-700/40 bg-purple-700/20 text-white hover:text-white text-xs"
                >
                  Tiếp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default GamePage
