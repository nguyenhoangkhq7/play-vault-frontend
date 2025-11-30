"use client"

import { X, Table, FileSpreadsheet, Check, Download, AlertCircle } from "lucide-react"
import { useState } from "react"
import { downloadReport } from "../../api/report"

export default function ExportModal({ onClose, dateRangeInfo }) {
  // State quản lý lựa chọn
  const [format, setFormat] = useState("excel") // Mặc định là excel
  const [options, setOptions] = useState({
    details: true,
    compare: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleExport = async () => {
    try {
      setLoading(true)
      setError("")
      
      // CHỈ CẦN GỌI HÀM NÀY, KHÔNG CẦN XỬ LÝ BLOB NỮA
      // Vì bên trong report.js đã gọi api.downloadFile của bạn rồi
      await downloadReport(
          dateRangeInfo.from, 
          dateRangeInfo.to, 
          format, 
          options.compare
      );
      
      onClose(); 
    } catch (err) {
      console.error(err);
      setError("Xuất báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl shadow-2xl border border-purple-600/50 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-600/30">
          <h3 className="text-xl font-bold text-white">Xuất báo cáo</h3>
          <button onClick={onClose} className="text-pink-300 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Info Box */}
          <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-500/20">
            <div className="text-sm text-pink-200 mb-1">Khoảng thời gian</div>
            <div className="font-bold text-white text-lg">{dateRangeInfo.label}</div>
            <div className="text-xs text-purple-300 mt-1">
              Từ: {dateRangeInfo.from} • Đến: {dateRangeInfo.to}
            </div>
          </div>

          {/* Format Selection - Đã xóa PDF */}
          <div>
            <label className="block text-sm font-medium text-pink-200 mb-3">Chọn định dạng xuất</label>
            <div className="grid grid-cols-1 gap-3">
              
              {/* Excel Option */}
              <div 
                onClick={() => setFormat("excel")}
                className={`relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  format === "excel" 
                    ? "bg-pink-600/20 border-pink-500 ring-1 ring-pink-500" 
                    : "bg-purple-950/40 border-purple-600/30 hover:bg-purple-900/40"
                }`}
              >
                <div className="p-2 bg-green-500/20 rounded-lg">
                    <Table className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-white">Excel (.xlsx)</div>
                    <div className="text-xs text-pink-200">Bảng tính chuẩn, hỗ trợ công thức và định dạng</div>
                </div>
                {format === "excel" && <Check className="h-5 w-5 text-pink-400" />}
              </div>

              {/* CSV Option */}
              <div 
                onClick={() => setFormat("csv")}
                className={`relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  format === "csv" 
                    ? "bg-pink-600/20 border-pink-500 ring-1 ring-pink-500" 
                    : "bg-purple-950/40 border-purple-600/30 hover:bg-purple-900/40"
                }`}
              >
                 <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-white">CSV (.csv)</div>
                    <div className="text-xs text-pink-200">Dữ liệu thô tách bởi dấu phẩy, dung lượng nhẹ</div>
                </div>
                {format === "csv" && <Check className="h-5 w-5 text-pink-400" />}
              </div>
            </div>
          </div>

          {/* Options - Đã xóa biểu đồ */}
          <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-600/20">
             <label className="block text-sm font-medium text-pink-200 mb-3">Tùy chọn xuất</label>
             <div className="space-y-3">
                
                {/* Checkbox Details */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        options.details ? 'bg-pink-600 border-pink-600' : 'border-purple-400 group-hover:border-pink-500'
                    }`}>
                        {options.details && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-white">Bao gồm dữ liệu chi tiết</span>
                    <input type="checkbox" className="hidden" checked={options.details} onChange={() => setOptions({...options, details: !options.details})} />
                </label>

                {/* Checkbox Compare */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        options.compare ? 'bg-pink-600 border-pink-600' : 'border-purple-400 group-hover:border-pink-500'
                    }`}>
                        {options.compare && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-white">Bao gồm so sánh với kỳ trước</span>
                    <input type="checkbox" className="hidden" checked={options.compare} onChange={() => setOptions({...options, compare: !options.compare})} />
                </label>
             </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                <AlertCircle className="h-4 w-4" />
                {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-600/30 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-purple-950/60 hover:bg-purple-950 text-white rounded-lg font-medium transition-colors border border-purple-600/30"
          >
            Hủy
          </button>
          <button 
            onClick={handleExport}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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