import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  FileDown,
  CreditCard,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// Import API mới
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

  // Filters chỉ cần keyword vì API tìm chung
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    keyword: "",
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

        // Map dữ liệu từ API (InvoiceTableDto)
        const contentArray = data?.content || [];
        const normalized = contentArray.map((inv) => ({
          id: inv.id,
          invoiceCode: inv.invoiceCode,     // INV-00001
          orderCode: inv.orderCode,         // ORD-001
          customerName: inv.customerName,
          issueDate: inv.issueDate,
          totalAmount: inv.totalAmount,
          status: inv.status,               // PAID, UNPAID, CANCELLED
          paymentMethod: inv.paymentMethod, // ZALOPAY, MOMO...
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

  // --- Helpers ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const getStatusBadge = (status) => {
    const map = {
      PAID: {
        text: "Đã thanh toán",
        style: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
      },
      UNPAID: {
        text: "Chưa thanh toán",
        style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
      },
      CANCELLED: {
        text: "Đã hủy",
        style: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
      },
    };
    // Mặc định là UNPAID nếu status lạ
    const { text, style } = map[status] || map.UNPAID;
    
    return (
      <Badge className={`${style} px-3 py-1 border shadow-sm transition-all`}>
        {text}
      </Badge>
    );
  };

  // --- Event handlers ---
  const handleSearchChange = (e) =>
    setFilters((prev) => ({ ...prev, keyword: e.target.value, page: 0 }));

  const handleStatusChange = (status) =>
    setFilters((prev) => ({ ...prev, status, page: 0 }));

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-8 text-slate-50">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản Lý Hóa Đơn
          </h1>
          <p className="text-slate-400 mt-1">
            Theo dõi lịch sử giao dịch và xuất hóa đơn.
          </p>
        </div>
      </div>

      {/* --- Filter Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo Mã hóa đơn (số ID) hoặc Tên khách hàng..."
            className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-purple-500"
            value={filters.keyword}
            onChange={handleSearchChange}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full md:w-auto min-w-[180px] justify-between border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-900 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-400" />
                <span>
                  {filters.status === "ALL"
                    ? "Tất cả trạng thái"
                    : filters.status}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
            {["ALL", "PAID", "UNPAID", "CANCELLED"].map(
              (st) => (
                <DropdownMenuItem
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
                >
                  {st === "ALL" ? "Tất cả trạng thái" : getStatusBadge(st)}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- Data Table --- */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  Mã HĐ
                </th>
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  Khách hàng
                </th>
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  Mã Đơn
                </th>
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  Ngày xuất
                </th>
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider text-center">
                  Phương thức
                </th>
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider text-right">
                  Tổng tiền
                </th>
                <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider text-center">
                  Trạng thái
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                       <span className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full"></span>
                       Đang tải dữ liệu hóa đơn...
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Không tìm thấy hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="group hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-purple-300">
                      {inv.id}
                    </td>
                    <td className="p-4 font-medium text-white">
                      {inv.customerName}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                        <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            {inv.orderCode}
                        </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {inv.issueDate}
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-300">
                            {inv.paymentMethod ? (
                                <>
                                    <CreditCard className="w-3 h-3" />
                                    <span>{inv.paymentMethod}</span>
                                </>
                            ) : (
                                <span className="text-slate-500 italic">Chưa có</span>
                            )}
                        </div>
                    </td>
                    <td className="p-4 font-semibold text-emerald-400 text-right">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-4 text-center">
                        {getStatusBadge(inv.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Pagination --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-slate-400">
          Hiển thị <strong className="text-white">{invoices.length}</strong> /{" "}
          <strong className="text-white">{pagination.totalElements}</strong> hóa đơn
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={pagination.first || loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
          </Button>
          <div className="text-sm font-medium px-2 text-slate-300">
            Trang {filters.page + 1} / {pagination.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={pagination.last || loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            Sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoices;