"use client"

import { useState } from "react"
import {
  Search,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  ShoppingCart,
  Heart,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Footer from "../home/footer";

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
    image: "/resident-evil-village-game-cover.jpg",
    name: "King Of War",
    publisher: "Team Cherry",
    price: "100.000đ",
    releaseDate: "12/05/2020",
    status: "Không hoạt động",
  },
]

export function GamePage() {
  const [categoryFilter, setCategoryFilter] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Main Content */}
      <main className="w-full px-8 py-12">
        {/* Title */}
        <h1 className="text-5xl font-bold text-white text-center mb-8">Quản lý game</h1>

        {/* Search Bar */}
        <div className="max-w-xs mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Tìm kiếm theo tên, publisher hoặc tên game" className="pl-10 bg-white rounded-lg" />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto mb-12">
          <div className="bg-purple-600/80 rounded-2xl p-8 text-center">
            <h3 className="text-white text-lg mb-2">Số lượng game</h3>
            <p className="text-white text-5xl font-bold">152</p>
          </div>
          <div className="bg-purple-600/80 rounded-2xl p-8 text-center">
            <h3 className="text-white text-lg mb-2">Số lượt tải</h3>
            <p className="text-white text-5xl font-bold">283,234</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-end mb-6 max-w-7xl mx-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-purple-700/50 gap-2">
                Thể loại game <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem onClick={() => setCategoryFilter("all")}>Tất cả</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("action")}>Hành động</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("adventure")}>Phiêu lưu</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Data Table */}
        <div className="max-w-7xl mx-auto bg-purple-800/50 rounded-2xl p-8">
          <h2 className="text-white text-2xl font-bold mb-6">Danh sách tài khoản</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-600">
                  <th className="text-left text-white font-semibold py-4 px-4">Ảnh</th>
                  <th className="text-left text-white font-semibold py-4 px-4">Tên Game</th>
                  <th className="text-left text-white font-semibold py-4 px-4">Publisher</th>
                  <th className="text-left text-white font-semibold py-4 px-4">
                    <div className="flex items-center gap-2">
                      Giá
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left text-white font-semibold py-4 px-4">
                    <div className="flex items-center gap-2">
                      Ngày phát hành
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left text-white font-semibold py-4 px-4">
                    <div className="flex items-center gap-2">
                      Trạng thái
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-left text-white font-semibold py-4 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {gameData.map((game) => (
                  <tr key={game.id} className="border-b border-purple-700/30">
                    <td className="py-4 px-4">
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    </td>
                    <td className="py-4 px-4 text-white">{game.name}</td>
                    <td className="py-4 px-4 text-white">{game.publisher}</td>
                    <td className="py-4 px-4 text-white">{game.price}</td>
                    <td className="py-4 px-4 text-white">{game.releaseDate}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          game.status === "Hoạt động" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-6">Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

        <Footer />
    </div>
  )
}
