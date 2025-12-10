import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
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
          filters.keyword, // Lưu ý: Chỗ này logic cũ của bạn để là filters.invoiceCode, mình giữ nguyên hoặc đổi thành keyword tùy API của bạn
          filters.status
        );

        // Map dữ liệu từ API (InvoiceTableDto)
        const contentArray = data?.content || [];
        const normalized = contentArray.map((inv) => ({
          id: inv.id,
          invoiceCode: inv.invoiceCode, // INV-00001
          // Đã bỏ orderCode ở đây
          customerName: inv.customerName,
          issueDate: inv.issueDate,
          totalAmount: inv.totalAmount,
          status: inv.status, // PAID, UNPAID, CANCELLED
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
        style:
          "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
      },
      UNPAID: {
        text: "Chưa thanh toán",
        style:
          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
      },
      CANCELLED: {
        text: "Đã hủy",
        style:
          "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
      },
    };
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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 p-6 space-y-8 text-white">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Quản Lý Hóa Đơn
          </h1>
          <p className="text-purple-200/80 mt-1">
            Theo dõi lịch sử giao dịch và xuất hóa đơn.
          </p>
        </div>
      </div>

      {/* --- Filter Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-purple-900/50 p-4 rounded-xl border border-purple-700/60 backdrop-blur-sm shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-200/70" />
          <Input
            placeholder="Tìm theo Mã hóa đơn (số ID) hoặc Tên khách hàng..."
            className="pl-10 bg-purple-950/70 border-purple-700/60 text-white placeholder:text-purple-200/60 focus-visible:ring-pink-500"
            value={filters.keyword}
            onChange={handleSearchChange}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full md:w-auto min-w-[180px] justify-between border-purple-700/60 bg-purple-950 text-white hover:bg-purple-800 hover:text-white"
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
          <DropdownMenuContent
            align="end"
            className="bg-purple-900 border-purple-700/60 text-white"
          >
            {["ALL", "PAID", "UNPAID", "CANCELLED"].map((st) => (
              <DropdownMenuItem
                key={st}
                onClick={() => handleStatusChange(st)}
                className="hover:bg-purple-800 focus:bg-purple-800 cursor-pointer"
              >
                {st === "ALL" ? "Tất cả trạng thái" : getStatusBadge(st)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- Data Table --- */}
      <div className="rounded-xl border border-purple-700/60 bg-purple-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-purple-700/60 bg-purple-900/80">
                <th className="p-4 text-purple-200/80 font-semibold uppercase text-xs tracking-wider">
                  Mã HĐ
                </th>
                <th className="p-4 text-purple-200/80 font-semibold uppercase text-xs tracking-wider">
                  Khách hàng
                </th>
                {/* Đã xóa thẻ th Mã Đơn ở đây */}
                <th className="p-4 text-purple-200/80 font-semibold uppercase text-xs tracking-wider">
                  Ngày xuất
                </th>
                <th className="p-4 text-purple-200/80 font-semibold uppercase text-xs tracking-wider text-center">
                  Phương thức
                </th>
                <th className="p-4 text-purple-200/80 font-semibold uppercase text-xs tracking-wider text-right">
                  Tổng tiền
                </th>
                <th className="p-4 text-purple-200/80 font-semibold uppercase text-xs tracking-wider text-center">
                  Trạng thái
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-800/60">
              {loading ? (
                <tr>
                  {/* Cập nhật colSpan từ 8 -> 7 vì đã xóa 1 cột */}
                  <td
                    colSpan={7}
                    className="p-8 text-center text-purple-200/80"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full"></span>
                      Đang tải dữ liệu hóa đơn...
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  {/* Cập nhật colSpan từ 8 -> 7 */}
                  <td
                    colSpan={7}
                    className="p-8 text-center text-purple-200/80"
                  >
                    Không tìm thấy hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="group hover:bg-purple-800/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-purple-300">
                      {inv.id}
                    </td>
                    <td className="p-4 font-medium text-white">
                      {inv.customerName}
                    </td>

                    {/* Đã xóa thẻ td hiển thị orderCode ở đây */}

                    <td className="p-4 text-purple-200/80">{inv.issueDate}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-white">
                        {inv.paymentMethod ? (
                          <>
                            <CreditCard className="w-3 h-3" />
                            <span>{inv.paymentMethod}</span>
                          </>
                        ) : (
                          <span className="text-purple-200/70 italic">
                            Chưa có
                          </span>
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
        <div className="text-sm text-purple-200/80">
          Hiển thị <strong className="text-white">{invoices.length}</strong> /{" "}
          <strong className="text-white">{pagination.totalElements}</strong> hóa
          đơn
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={pagination.first || loading}
            className="border-purple-700/60 bg-purple-900 text-white hover:bg-purple-800 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
          </Button>
          <div className="text-sm font-medium px-2 text-white">
            Trang {filters.page + 1} / {pagination.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={pagination.last || loading}
            className="border-purple-700/60 bg-purple-900 text-white hover:bg-purple-800 hover:text-white disabled:opacity-50"
          >
            Sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoices;
