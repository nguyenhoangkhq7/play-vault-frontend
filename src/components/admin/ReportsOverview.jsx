"use client"

import { TrendingUp, TrendingDown, DollarSign, Users, Gamepad2, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchReportSummary } from "../../api/report"

export default function ReportsOverview({ dateFilter }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const res = await fetchReportSummary(dateFilter.from, dateFilter.to)
        setData(res)
      } catch (error) {
        console.error("Failed to load summary", error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    
    if (dateFilter.from && dateFilter.to) {
        loadData()
    }
  }, [dateFilter])

  if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-purple-900/50 rounded-xl"></div>)}
        </div>
      )
  }

  if (!data) return null

  const metrics = [
    {
      title: "Tổng doanh thu",
      value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.totalRevenue || 0),
      change: `${data.revenueGrowth}%`,
      trend: data.revenueGrowth >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Người dùng mới",
      value: (data.newUsers || 0).toLocaleString(),
      change: `${data.userGrowth}%`,
      trend: data.userGrowth >= 0 ? "up" : "down",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Game đã bán",
      value: (data.soldGames || 0).toLocaleString(),
      change: `${data.soldGamesGrowth}%`,
      trend: data.soldGamesGrowth >= 0 ? "up" : "down",
      icon: Gamepad2,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Đơn hàng",
      value: (data.totalOrders || 0).toLocaleString(),
      change: `${data.orderGrowth}%`,
      trend: data.orderGrowth >= 0 ? "up" : "down",
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