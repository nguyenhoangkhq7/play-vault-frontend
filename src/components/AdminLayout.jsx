import { Outlet, NavLink } from "react-router-dom"
import { Home, MessageSquare, Gamepad2, Users } from "lucide-react"

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900/20 backdrop-blur-sm border-r border-purple-500/30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-purple-100 hover:bg-purple-700/50 ${
                isActive ? "bg-purple-700 text-white" : ""
              }`
            }
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/feedback"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-purple-100 hover:bg-purple-700/50 ${
                isActive ? "bg-purple-700 text-white" : ""
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Feedback
          </NavLink>
          <NavLink
            to="/admin/games"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-purple-100 hover:bg-purple-700/50 ${
                isActive ? "bg-purple-700 text-white" : ""
              }`
            }
          >
            <Gamepad2 className="w-5 h-5 mr-3" />
            Game Management
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-purple-100 hover:bg-purple-700/50 ${
                isActive ? "bg-purple-700 text-white" : ""
              }`
            }
          >
            <Users className="w-5 h-5 mr-3" />
            User Management
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout