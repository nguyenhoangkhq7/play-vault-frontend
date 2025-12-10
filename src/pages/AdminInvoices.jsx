import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  FileDown,
  CreditCard,
  Filter,
  Mail, // Icon email
} from "lucide-react";
import { toast } from "sonner";

import { fetchAdminInvoices } from "../api/invoice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    invoiceCode: "",
    status: "ALL",
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);

        const data = await fetchAdminInvoices(
          filters.page,
          filters.size,
          filters.invoiceCode,
          filters.status
        );

        const contentArray = data?.content || [];
        const normalized = contentArray.map((inv) => ({
          id: inv.id,
          invoiceCode: inv.invoiceCode,
          customerName: inv.customerName,
          email: inv.email, // <-- Lấy Email từ API
          issueDate: inv.issueDate,
          totalAmount: inv.totalAmount,
          status: inv.status,
          paymentMethod: inv.paymentMethod,
        }));

        setInvoices(normalized);
        setPagination({
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || normalized.length,
          first: data.first,
          last: data.last,
        });
      } catch (error) {
        console.error("Lỗi tải hóa đơn:", error);
        toast.error("Không thể tải danh sách hóa đơn");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadInvoices, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const getStatusBadge = (status) => {
    const map = {
      PAID: { text: "Đã thanh toán", style: "bg-green-500/20 text-green-400 border-green-500/30" },
      UNPAID: { text: "Chưa thanh toán", style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      CANCELLED: { text: "Đã hủy", style: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const { text, style } = map[status] || map.UNPAID;
    return <Badge className={`${style} px-3 py-1 border shadow-sm`}>{text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-8 text-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Quản Lý Hóa Đơn
          </h1>
          <p className="text-slate-400 mt-1">Theo dõi lịch sử thanh toán.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <FileDown className="w-4 h-4 mr-2" /> Xuất báo cáo
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200/70" />
          <Input
            placeholder="Tìm theo Mã HĐ, Tên hoặc Email..."
            className="pl-10 bg-slate-950 border-slate-800 text-slate-200"
            value={filters.invoiceCode}
            onChange={(e) => setFilters(prev => ({ ...prev, invoiceCode: e.target.value, page: 0 }))}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[180px] justify-between border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-900">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-400" />
                <span>{filters.status === "ALL" ? "Tất cả trạng thái" : filters.status}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
            {["ALL", "PAID", "UNPAID", "CANCELLED"].map((st) => (
              <DropdownMenuItem key={st} onClick={() => setFilters(prev => ({ ...prev, status: st, page: 0 }))}>
                {st === "ALL" ? "Tất cả" : getStatusBadge(st)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 text-slate-400 font-semibold">Mã HĐ</th>
                <th className="p-4 text-slate-400 font-semibold">Khách hàng</th>
                <th className="p-4 text-slate-400 font-semibold">Email</th> {/* Cột mới */}
                <th className="p-4 text-slate-400 font-semibold">Ngày xuất</th>
                <th className="p-4 text-slate-400 font-semibold text-center">PTTT</th>
                <th className="p-4 text-slate-400 font-semibold text-right">Tổng tiền</th>
                <th className="p-4 text-slate-400 font-semibold text-center">Trạng thái</th>
                <th className="p-4 text-center text-slate-400 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400">Không có dữ liệu.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-purple-300">{inv.id}</td>
                    <td className="p-4 font-medium text-white">{inv.customerName}</td>
                    <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {inv.email}
                        </div>
                    </td>
                    <td className="p-4 text-slate-400">{inv.issueDate}</td>
                    <td className="p-4 text-center text-slate-300">
                      {inv.paymentMethod ? (
                          <div className="flex items-center justify-center gap-1">
                              <CreditCard className="w-3 h-3" /> {inv.paymentMethod}
                          </div>
                      ) : "-"}
                    </td>
                    <td className="p-4 font-semibold text-emerald-400 text-right">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-4 text-center">{getStatusBadge(inv.status)}</td>
                    <td className="p-4 text-center">
                      <button className="p-2 hover:bg-purple-500/20 rounded-lg text-slate-400 hover:text-purple-300">
                          <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination (Giữ nguyên như cũ) */}
      <div className="flex justify-between items-center px-2">
        <div className="text-sm text-slate-400">
            Hiển thị <strong>{invoices.length}</strong> / <strong>{pagination.totalElements}</strong> hóa đơn
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => pagination.first || setFilters(prev => ({ ...prev, page: filters.page - 1 }))} disabled={pagination.first}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => pagination.last || setFilters(prev => ({ ...prev, page: filters.page + 1 }))} disabled={pagination.last}>
                Sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoices;
