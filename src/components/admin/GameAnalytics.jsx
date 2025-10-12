

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Trophy, Star, Download, Eye } from "lucide-react"

export default function GameAnalytics({ dateRange }) {
  const topGames = [
    { name: "Cyber Warriors 2077", sales: 3420, revenue: 342000000, rating: 4.8 },
    { name: "Fantasy Quest Online", sales: 2890, revenue: 289000000, rating: 4.6 },
    { name: "Speed Racing Ultimate", sales: 2340, revenue: 234000000, rating: 4.5 },
    { name: "Puzzle Master Pro", sales: 1980, revenue: 198000000, rating: 4.7 },
    { name: "Battle Royale Arena", sales: 1750, revenue: 175000000, rating: 4.4 },
  ]

  const colors = ["#ec4899", "#a855f6", "#8b5cf6", "#7c3aed", "#6d28d9"]

  const gameMetrics = [
    { label: "Game bán chạy nhất", value: "Cyber Warriors", icon: Trophy, color: "from-yellow-500 to-orange-600" },
    { label: "Đánh giá trung bình", value: "4.6/5.0", icon: Star, color: "from-pink-500 to-rose-600" },
    { label: "Tổng lượt tải", value: "45,280", icon: Download, color: "from-blue-500 to-cyan-600" },
    { label: "Lượt xem", value: "128,450", icon: Eye, color: "from-purple-500 to-indigo-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Game Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-5 rounded-xl shadow-lg border border-purple-700/50"
            >
              <div className={`bg-gradient-to-br ${metric.color} p-3 rounded-lg shadow-lg w-fit mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-pink-200 text-sm mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Top Games Chart */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Top 5 Game bán chạy</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={topGames} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
            <XAxis type="number" stroke="#e9d5ff" />
            <YAxis dataKey="name" type="category" stroke="#e9d5ff" width={150} />
            <Tooltip
              contentStyle={{ backgroundColor: "#581c87", border: "1px solid #a855f7", borderRadius: "8px" }}
              labelStyle={{ color: "#fdf4ff" }}
            />
            <Bar dataKey="sales" radius={[0, 8, 8, 0]}>
              {topGames.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Games Table */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Chi tiết game hàng đầu</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-700">
                <th className="text-left py-3 px-4 text-pink-300 font-semibold">Tên game</th>
                <th className="text-right py-3 px-4 text-pink-300 font-semibold">Lượt bán</th>
                <th className="text-right py-3 px-4 text-pink-300 font-semibold">Doanh thu</th>
                <th className="text-right py-3 px-4 text-pink-300 font-semibold">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {topGames.map((game, index) => (
                <tr key={index} className="border-b border-purple-800/50 hover:bg-purple-800/30 transition-colors">
                  <td className="py-3 px-4 text-white">{game.name}</td>
                  <td className="py-3 px-4 text-right text-pink-200">{game.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-green-400">₫{game.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      {game.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
