"use client"

import { useLocation, useNavigate, NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  FileCheck,
  Activity,
  FileText,
  Crown,
  Bell,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function AdminHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef(null)
  const notificationRef = useRef(null)

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Trang chủ", path: "/admin" },
    { id: "users", icon: Users, label: "Quản lý tài khoản", path: "/admin/users" },
    { id: "games", icon: Gamepad2, label: "Quản lý game", path: "/admin/games" },
    { id: "approval", icon: FileCheck, label: "Duyệt game & cấp quyền", path: "/admin/approval" },
    { id: "monitoring", icon: Activity, label: "Giám sát hệ thống", path: "/admin/monitoring" },
    { id: "reports", icon: FileText, label: "Báo cáo thống kê", path: "/admin/reports" },
  ]

  const notifications = [
    { id: 1, type: "error", message: "Lỗi kết nối database", time: "5 phút trước" },
    { id: 2, type: "warning", message: "CPU sử dụng cao (85%)", time: "10 phút trước" },
    { id: 3, type: "warning", message: "3 game đang chờ duyệt", time: "1 giờ trước" },
    { id: 4, type: "info", message: "Cập nhật hệ thống thành công", time: "2 giờ trước" },
  ]

  const unreadCount = notifications.filter((n) => n.type === "error" || n.type === "warning").length

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...")
    navigate("/login")
  }

  return (
    <>
      {/* Vertical Sidebar */}
      <div className="w-20 bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col items-center py-8 fixed top-0 left-0 h-screen z-10 shadow-xl border-r border-purple-800/30">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col items-center space-y-8 mt-4">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              href={item.path}
              isActive={pathname === item.path}
              icon={<item.icon className="w-6 h-6" />}
              label={item.label}
            />
          ))}
        </div>
      </div>

      <div className="fixed top-0 left-20 right-0 h-16 bg-gradient-to-r from-purple-950/95 to-indigo-950/95 backdrop-blur-md border-b border-purple-800/30 z-10 flex items-center justify-end px-6">
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-purple-800/40 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5 text-purple-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-pink-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-purple-900/95 backdrop-blur-md border border-purple-700/50 rounded-lg shadow-xl overflow-hidden">
                <div className="p-3 border-b border-purple-700/50">
                  <h3 className="text-sm font-semibold text-white">Thông báo</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border-b border-purple-800/30 hover:bg-purple-800/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.type === "error"
                              ? "bg-red-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-white">{notification.message}</p>
                          <p className="text-xs text-purple-300 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-4 border-l border-purple-700/50 hover:bg-purple-800/40 rounded-lg p-2 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-semibold text-white">Admin User</div>
                <div className="text-xs text-purple-300">Quản trị viên</div>
              </div>
              <div className="w-9 h-9 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-purple-300" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-purple-900/95 backdrop-blur-md border border-purple-700/50 rounded-lg shadow-xl overflow-hidden">
                <NavLink
                  to="/admin/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-purple-800/40 transition-colors text-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Xem hồ sơ</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-800/40 transition-colors text-white border-t border-purple-700/50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function NavItem({ href, icon, label, isActive }) {
  return (
    <div className="relative group">
      <NavLink to={href} className="block">
        <div
          className={`
          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
          ${
            isActive
              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50"
              : "text-purple-300 bg-purple-900/20 hover:bg-purple-800/40"
          }
        `}
        >
          {icon}
        </div>
      </NavLink>

      {/* Tooltip */}
      <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg pointer-events-none">
        {label}
      </div>
    </div>
  )
}
