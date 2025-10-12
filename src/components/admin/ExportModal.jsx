"use client"

import { X, FileText, FileSpreadsheet, FileJson, Download, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function ExportModal({ onClose, dateRangeInfo }) {
  const [selectedFormat, setSelectedFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const formats = [
    {
      id: "pdf",
      name: "PDF",
      description: "Định dạng tài liệu di động, phù hợp để in và chia sẻ",
      icon: FileText,
      color: "from-red-500 to-rose-600",
    },
    {
      id: "excel",
      name: "Excel",
      description: "Bảng tính Excel, dễ dàng phân tích và chỉnh sửa",
      icon: FileSpreadsheet,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "csv",
      name: "CSV",
      description: "Dữ liệu thô, tương thích với nhiều công cụ",
      icon: FileJson,
      color: "from-blue-500 to-cyan-600",
    },
  ]

  const handleExport = () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      setExportComplete(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    }, 2000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl shadow-2xl border border-purple-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-700">
          <h2 className="text-2xl font-bold text-white">Xuất báo cáo</h2>
          <button
            onClick={onClose}
            className="text-pink-300 hover:text-pink-400 transition-colors p-2 hover:bg-purple-800/50 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-purple-800/50 p-4 rounded-lg border border-purple-700/50 space-y-2">
            <p className="text-pink-200 text-sm mb-1">Khoảng thời gian</p>
            <p className="text-white font-semibold text-lg">{dateRangeInfo.label}</p>
            <div className="flex items-center gap-2 text-sm text-pink-300">
              <span>Từ: {formatDate(dateRangeInfo.from)}</span>
              <span>•</span>
              <span>Đến: {formatDate(dateRangeInfo.to)}</span>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-white font-semibold mb-3">Chọn định dạng xuất</h3>
            <div className="space-y-3">
              {formats.map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === format.id
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-purple-700/50 bg-purple-800/30 hover:border-purple-600"
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${format.color} p-3 rounded-lg shadow-lg flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-semibold mb-1">{format.name}</h4>
                      <p className="text-pink-200 text-sm">{format.description}</p>
                    </div>
                    {selectedFormat === format.id && <CheckCircle className="h-6 w-6 text-pink-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-purple-800/50 p-4 rounded-lg border border-purple-700/50 space-y-3">
            <h3 className="text-white font-semibold mb-2">Tùy chọn xuất</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-pink-500" />
              <span className="text-pink-200 text-sm">Bao gồm biểu đồ và đồ thị</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-pink-500" />
              <span className="text-pink-200 text-sm">Bao gồm dữ liệu chi tiết</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-pink-500" />
              <span className="text-pink-200 text-sm">Bao gồm so sánh với kỳ trước</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-700">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-purple-600 text-pink-300 hover:bg-purple-800/50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || exportComplete}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Đang xuất...
              </>
            ) : exportComplete ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Hoàn thành!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Xuất báo cáo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
