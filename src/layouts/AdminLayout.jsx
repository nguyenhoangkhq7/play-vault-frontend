import { Outlet } from "react-router-dom"
import AdminHeader from "../components/admin/AdminHeader"

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-purple-900 via-purple-700 to-pink-700 text-white">
      <AdminHeader />
      <main className="flex-1 p-6 space-y-6 ml-20 mt-16">
        <Outlet />
      </main>
    </div>
  )
}
