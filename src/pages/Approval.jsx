import { Routes, Route } from "react-router-dom"
import { ApprovalPage } from "../components/admin/ApprovalPage"
import { GameDetailPage } from "../components/admin/GameDetailPage"

export default function Approval() {
  return (
    <Routes>
      {/* Trang danh sách cần duyệt */}
      <Route path="/" element={<ApprovalPage />} />

      {/* Trang chi tiết game cần duyệt */}
      <Route path="games/:id" element={<GameDetailPage />} />
    </Routes>
  )
}
