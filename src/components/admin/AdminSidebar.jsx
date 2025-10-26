"use client"

import { useLocation, NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Gamepad2, FileCheck, Activity, BarChart3, Crown } from "lucide-react"

const menuItems = [
  { id: "dashboard", href: "/admin", icon: LayoutDashboard, label: "Trang chủ" },
  { id: "users", href: "/admin/users", icon: Users, label: "Quản lý tài khoản" },
  { id: "games", href: "/admin/games", icon: Gamepad2, label: "Quản lý game" },
  { id: "approval", href: "/admin/approval", icon: FileCheck, label: "Duyệt game & cấp quyền" },
  { id: "monitoring", href: "/admin/monitoring", icon: Activity, label: "Giám sát hệ thống" },
  { id: "reports", href: "/admin/reports", icon: BarChart3, label: "Báo cáo thống kê" },
]

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-purple-950/80 shadow-lg border-r border-purple-700 transition-all duration-300 overflow-y-auto p-5 z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center justify-center mb-6">
        {isOpen ? (
          <h1 className="text-2xl font-bold text-pink-400 transition-opacity duration-300">Admin Panel</h1>
        ) : (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full shadow-md">
            <Crown className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <NavLink
              key={item.id}
              to={item.href}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                isActive ? "bg-pink-600/60 text-white" : "hover:bg-purple-800/60 text-pink-300"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="text-left">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
