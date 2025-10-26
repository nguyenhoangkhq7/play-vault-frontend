"use client"

import { useState } from "react"
import {
  Search,
  Settings,
  ShoppingCart,
  Heart,
  Gamepad2,
  ChevronDown,
  Check,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Footer from "../home/footer";

const games = [
  {
    id: 1,
    title: "Resident Evil Village",
    publisher: "Publisher: Capcom/VN",
    price: "499.000đ",
    image: "/resident-evil-village-game-cover.jpg",
    status: "pending",
  },
  {
    id: 2,
    title: "Hollow Knight",
    publisher: "Publisher: Team Cherry",
    price: "149.000đ",
    image: "/hollow-knight-game-icon-blue.jpg",
    status: "pending",
  },
  {
    id: 3,
    title: "Hollow Knight",
    publisher: "Publisher: Team Cherry",
    price: "149.000đ",
    image: "/hollow-knight-game-icon-blue.jpg",
    status: "approved",
  },
  {
    id: 4,
    title: "Resident Evil Village",
    publisher: "Publisher: Capcom/VN",
    price: "499.000đ",
    image: "/resident-evil-village-game-cover.jpg",
    status: "rejected",
  },
  {
    id: 5,
    title: "Hollow Knight",
    publisher: "Publisher: Team Cherry",
    price: "149.000đ",
    image: "/hollow-knight-game-icon-blue.jpg",
    status: "pending",
  },
  {
    id: 6,
    title: "Resident Evil Village",
    publisher: "Publisher: Capcom/VN",
    price: "499.000đ",
    image: "/resident-evil-village-game-cover.jpg",
    status: "pending",
  },
  {
    id: 7,
    title: "Hollow Knight",
    publisher: "Publisher: Team Cherry",
    price: "149.000đ",
    image: "/hollow-knight-game-icon-blue.jpg",
    status: "pending",
  },
  {
    id: 8,
    title: "Hollow Knight",
    publisher: "Publisher: Team Cherry",
    price: "149.000đ",
    image: "/hollow-knight-game-icon-blue.jpg",
    status: "approved",
  },
  {
    id: 9,
    title: "Resident Evil Village",
    publisher: "Publisher: Capcom/VN",
    price: "499.000đ",
    image: "/resident-evil-village-game-cover.jpg",
    status: "rejected",
  },
  {
    id: 10,
    title: "Hollow Knight",
    publisher: "Publisher: Team Cherry",
    price: "149.000đ",
    image: "/hollow-knight-game-icon-blue.jpg",
    status: "pending",
  },
  {
    id: 11,
    title: "Resident Evil Village",
    publisher: "Publisher: Capcom/VN",
    price: "499.000đ",
    image: "/resident-evil-village-game-cover.jpg",
    status: "pending",
  },
]

export function ApprovalPage() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">

      {/* Main Content */}
      <main className="w-full p-8">
        <h1 className="text-5xl font-bold text-white text-center mb-12">Duyệt game</h1>

        <div className="flex items-center justify-between mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-purple-800/50 gap-2">
                Trạng thái game <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                <span className="w-4 h-4 rounded-full border-2 border-gray-400 mr-2" />
                Đã duyệt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("pending")}>
                <span className="w-4 h-4 rounded-full bg-yellow-400 mr-2" />
                Chờ duyệt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("rejected")}>
                <span className="w-4 h-4 rounded-full border-2 border-gray-400 mr-2" />
                Từ chối
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Tìm kiếm theo tên, publisher hoặc tên game" className="pl-10 bg-white" />
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-3 gap-6">
          {games.map((game) => (
            <div
             key={game.id}
             className="bg-gray-900/80 rounded-lg p-4 border border-purple-700/30 flex flex-col justify-between min-h-[260px]"
            >

             <div className="flex gap-4 mb-4 items-start min-h-[90px]">

                <img
                  src={game.image || "/placeholder.svg"}
                  alt={game.title}
                  className="w-20 h-20 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{game.title}</h3>
                  <p className="text-purple-300 text-sm mb-2">{game.publisher}</p>
                  <p className="text-white font-bold">{game.price}</p>
                </div>
              </div>

              {game.status === "pending" && (
                <>
                  <div className="text-yellow-400 text-sm mb-3">Chờ duyệt</div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700">
                      <X className="w-4 h-4 mr-1" />
                      Từ chối
                    </Button>
                  </div>
                </>
              )}

              {game.status === "approved" && (
                <>
                  <div className="text-green-400 text-sm mb-3">Đã duyệt</div>
                  <Button className="w-full bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700">
                    Xóa
                  </Button>
                </>
              )}

              {game.status === "rejected" && (
                <>
                  <div className="text-red-400 text-sm mb-3">Từ chối</div>
                  <Button className="w-full bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700">
                    Duyệt lại
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </main>

        <Footer />
    </div>
  )
}
