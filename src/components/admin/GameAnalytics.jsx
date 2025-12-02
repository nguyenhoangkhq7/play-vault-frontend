"use client"

import { Trophy, Gamepad2, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchGameRevenue } from "../../api/report"

export default function GameAnalytics({ dateFilter }) {
  const [topGames, setTopGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const res = await fetchGameRevenue(dateFilter.from, dateFilter.to)
        
        // Logic: Sắp xếp theo sales (bán chạy nhất) và lấy Top 5
        const sortedBySales = [...res].sort((a, b) => b.sales - a.sales).slice(0, 5)
        
        setTopGames(sortedBySales)
      } catch (error) {
        console.error("Lỗi tải Game Analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    if (dateFilter.from && dateFilter.to) loadData()
  }, [dateFilter])

  if (loading) return <div className="text-white py-10 text-center animate-pulse">Đang tải bảng xếp hạng...</div>
  if (topGames.length === 0) return null

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột 1: Top 5 Game Bán Chạy Nhất (Bảng xếp hạng) */}
      <div className="lg:col-span-2 bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Top 5 Game Bán Chạy Nhất</h3>
                <p className="text-pink-200 text-sm">Xếp hạng theo số lượng đơn hàng đã hoàn tất</p>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-pink-200 border-b border-purple-600/30">
                <th className="py-3 px-2 font-medium">#</th>
                <th className="py-3 px-2 font-medium">Game</th>
                <th className="py-3 px-2 font-medium text-right">Đã bán</th>
                <th className="py-3 px-2 font-medium text-right">Doanh thu</th>
                <th className="py-3 px-2 font-medium text-right">Thị phần</th>
              </tr>
            </thead>
            <tbody>
              {topGames.map((game, index) => {
                // Tính thị phần giả định so với người đứng nhất để vẽ thanh bar
                const maxSales = topGames[0]?.sales || 1;
                const percentage = (game.sales / maxSales) * 100;

                return (
                  <tr key={game.gameId} className="group hover:bg-purple-800/20 transition-colors border-b border-purple-600/10 last:border-0">
                    <td className="py-4 px-2 text-white font-bold">
                        {index === 0 ? <span className="text-yellow-400">🥇</span> : 
                         index === 1 ? <span className="text-gray-300">🥈</span> : 
                         index === 2 ? <span className="text-orange-400">🥉</span> : 
                         <span className="text-purple-300 ml-1">{index + 1}</span>}
                    </td>
                    <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                            <img 
                                src={game.thumbnail || "/placeholder-game.jpg"} 
                                alt={game.name} 
                                className="w-12 h-12 rounded-lg object-cover border border-purple-500/30"
                                onError={(e) => e.target.src = 'https://placehold.co/100?text=Game'}
                            />
                            <div>
                                <div className="text-white font-medium line-clamp-1">{game.name}</div>
                                <div className="text-xs text-purple-300">{game.category}</div>
                            </div>
                        </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                        <div className="text-white font-bold">{game.sales.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-2 text-right">
                        <div className="text-pink-300 font-medium">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(game.revenue)}
                        </div>
                    </td>
                    <td className="py-4 px-2 text-right w-24">
                        <div className="h-1.5 w-full bg-purple-950 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cột 2: Card thống kê phụ (Nếu muốn) */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Gamepad2 className="h-5 w-5 text-blue-400" />
                </div>
                <h4 className="text-white font-bold">Game hoạt động</h4>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{topGames.length}</div>
            <p className="text-purple-200 text-sm">Số game phát sinh doanh thu trong kỳ</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-900/60 to-purple-900/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-pink-400" />
                </div>
                <h4 className="text-white font-bold">Top Doanh Thu</h4>
            </div>
            <div className="text-white font-medium line-clamp-1 mb-1">{topGames[0]?.name || "N/A"}</div>
            <div className="text-2xl font-bold text-pink-300">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(topGames[0]?.revenue || 0)}
            </div>
        </div>
      </div>
    </div>
  )
}