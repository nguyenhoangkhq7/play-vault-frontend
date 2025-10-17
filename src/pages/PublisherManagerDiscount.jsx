"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Plus } from "lucide-react"

export default function PublisherManagerDiscount() {
  const [promotions, setPromotions] = useState([
    {
      id: "1",
      name: "Giảm Cả Năm Vui",
      code: "HAPPY",
      discountType: "percentage",
      discountValue: 20,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      description: "Khuyến mãi áp dụng cho tất cả các game trong hệ thống. Giảm 20% cho mọi giao dịch.",
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    description: "",
  })
  const [searchQuery, setSearchQuery] = useState("")

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date()
  }

  const handleOpenDialog = (promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({ ...promotion })
    } else {
      setEditingPromotion(null)
      setFormData({
        name: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        startDate: "",
        endDate: "",
        description: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPromotion(null)
  }

  const handleSave = () => {
    if (editingPromotion) {
      setPromotions(
        promotions.map((p) => (p.id === editingPromotion.id ? { ...formData, id: p.id } : p))
      )
    } else {
      const newPromotion = { ...formData, id: Date.now().toString() }
      setPromotions([...promotions, newPromotion])
    }
    handleCloseDialog()
  }

  const handleDelete = (id) => {
    setPromotions(promotions.filter((p) => p.id !== id))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  // Lọc danh sách theo tên
  const filteredPromotions = promotions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Quản lý khuyến mãi</h1>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm khuyến mãi
          </Button>
        </div>

        <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Danh sách khuyến mãi</h2>

          {/* Input tìm kiếm */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên khuyến mãi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-purple-800 border-purple-700 text-white placeholder:text-white/50 w-full"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3 text-left text-sm font-semibold text-white">Tên khuyến mãi</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Mã code</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Phạm vi giảm giá</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Thời gian</th>
                  <th className="pb-3 text-left text-sm font-semibold text-white">Mô tả</th>
                  <th className="pb-3 text-center text-sm font-semibold text-white">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 text-white">{promotion.name}</td>
                    <td className="py-4">
                      <span className="rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
                        {promotion.code}
                      </span>
                    </td>
                    <td className="py-4 text-white">
                      {promotion.discountType === "percentage"
                        ? `${promotion.discountValue}%`
                        : `${promotion.discountValue.toLocaleString("vi-VN")}đ`}
                    </td>
                    <td className="py-4 text-white">
                      <div className="text-sm">
                        {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </div>
                      {isExpired(promotion.endDate) && (
                        <span className="mt-1 inline-block rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          Hết hạn
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-white max-w-xs">
                      <div className="line-clamp-2 text-sm text-white/80">{promotion.description}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleOpenDialog(promotion)}
                          size="sm"
                          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                        >
                          Sửa
                        </Button>
                        <Button
                          onClick={() => handleDelete(promotion.id)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 font-semibold"
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPromotions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-white/80">
                      Không tìm thấy khuyến mãi nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-purple-900 text-white border-purple-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Tên khuyến mãi
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên khuyến mãi"
                className="bg-purple-800 border-purple-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-white">
                Mã khuyến mãi
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: SUMMER2025"
                className="bg-purple-800 border-purple-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType" className="text-white">
                  Loại giảm giá
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger className="bg-purple-800 border-purple-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue" className="text-white">
                  Giá trị giảm
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: Number(e.target.value),
                    })
                  }
                  placeholder={formData.discountType === "percentage" ? "10" : "50000"}
                  className="bg-purple-800 border-purple-700 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-white">
                  Ngày bắt đầu
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-purple-800 border-purple-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-white">
                  Ngày kết thúc
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-purple-800 border-purple-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Mô tả
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về khuyến mãi và game áp dụng..."
                rows={4}
                className="bg-purple-800 border-purple-700 text-white placeholder:text-white/50 resize-none w-full p-2 rounded"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCloseDialog}
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
