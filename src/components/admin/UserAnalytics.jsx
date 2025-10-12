"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Users, UserPlus, UserMinus, Activity } from "lucide-react"

export default function UserAnalytics({ dateRange }) {
  const userData = [
    { date: "01/01", active: 12500, new: 450, churned: 120 },
    { date: "02/01", active: 13200, new: 520, churned: 95 },
    { date: "03/01", active: 13800, new: 480, churned: 110 },
    { date: "04/01", active: 14500, new: 610, churned: 88 },
    { date: "05/01", active: 15200, new: 550, churned: 102 },
    { date: "06/01", active: 16100, new: 680, churned: 75 },
    { date: "07/01", active: 17000, new: 720, churned: 92 },
  ]

  const userStats = [
    { label: "Người dùng hoạt động", value: "17,000", icon: Activity, color: "from-blue-500 to-cyan-600" },
    { label: "Người dùng mới", value: "720", icon: UserPlus, color: "from-green-500 to-emerald-600" },
    { label: "Người dùng rời đi", value: "92", icon: UserMinus, color: "from-red-500 to-orange-600" },
    { label: "Tỷ lệ giữ chân", value: "94.6%", icon: Users, color: "from-purple-500 to-pink-600" },
  ]

  return (
    <div className="space-y-6">
      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-5 rounded-xl shadow-lg border border-purple-700/50"
            >
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-lg w-fit mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-pink-200 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* User Trend Chart */}
      <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Phân tích người dùng</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={userData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
            <XAxis dataKey="date" stroke="#e9d5ff" />
            <YAxis stroke="#e9d5ff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#581c87", border: "1px solid #a855f7", borderRadius: "8px" }}
              labelStyle={{ color: "#fdf4ff" }}
            />
            <Legend />
            <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} name="Hoạt động" />
            <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} name="Mới" />
            <Line type="monotone" dataKey="churned" stroke="#ef4444" strokeWidth={2} name="Rời đi" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
