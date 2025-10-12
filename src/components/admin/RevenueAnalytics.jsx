"use client"

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function RevenueAnalytics({ dateRange }) {
  const revenueData = [
    { date: "01/01", revenue: 45000000, orders: 234, avgOrder: 192307 },
    { date: "02/01", revenue: 52000000, orders: 267, avgOrder: 194756 },
    { date: "03/01", revenue: 48000000, orders: 245, avgOrder: 195918 },
    { date: "04/01", revenue: 61000000, orders: 312, avgOrder: 195512 },
    { date: "05/01", revenue: 55000000, orders: 278, avgOrder: 197841 },
    { date: "06/01", revenue: 67000000, orders: 334, avgOrder: 200598 },
    { date: "07/01", revenue: 72000000, orders: 356, avgOrder: 202247 },
  ]

  const categoryData = [
    { category: "Action", revenue: 850000000, percentage: 32 },
    { category: "RPG", revenue: 720000000, percentage: 27 },
    { category: "Strategy", revenue: 480000000, percentage: 18 },
    { category: "Sports", revenue: 380000000, percentage: 14 },
    { category: "Puzzle", revenue: 240000000, percentage: 9 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend Chart */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Xu hướng doanh thu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
            <XAxis dataKey="date" stroke="#e9d5ff" />
            <YAxis stroke="#e9d5ff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#581c87", border: "1px solid #a855f7", borderRadius: "8px" }}
              labelStyle={{ color: "#fdf4ff" }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#ec4899" fillOpacity={1} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Revenue Chart */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Doanh thu theo thể loại</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
            <XAxis dataKey="category" stroke="#e9d5ff" />
            <YAxis stroke="#e9d5ff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#581c87", border: "1px solid #a855f7", borderRadius: "8px" }}
              labelStyle={{ color: "#fdf4ff" }}
            />
            <Bar dataKey="revenue" fill="#ec4899" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
