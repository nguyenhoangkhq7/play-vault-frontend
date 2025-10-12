"use client"

import { TrendingUp, TrendingDown, DollarSign, Users, Gamepad2, ShoppingCart } from "lucide-react"

export default function ReportsOverview({ dateRange }) {
  const metrics = [
    {
      title: "Tổng doanh thu",
      value: "₫2,847,500,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Người dùng mới",
      value: "8,432",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Game đã bán",
      value: "15,847",
      change: "+15.3%",
      trend: "up",
      icon: Gamepad2,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Đơn hàng",
      value: "12,394",
      change: "-2.4%",
      trend: "down",
      icon: ShoppingCart,
      color: "from-orange-500 to-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown

        return (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50 hover:border-pink-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`bg-gradient-to-br ${metric.color} p-3 rounded-lg shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  metric.trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                <TrendIcon className="h-3 w-3" />
                {metric.change}
              </div>
            </div>
            <h3 className="text-pink-200 text-sm mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
          </div>
        )
      })}
    </div>
  )
}
