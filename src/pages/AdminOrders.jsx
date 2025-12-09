import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Filter, Search } from "lucide-react";
import { toast } from "sonner";

import { fetchAdminOrders } from "../api/order";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters and pagination
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
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const data = await fetchAdminOrders(
          filters.page,
          filters.size,
          filters.keyword,
          filters.status
        );

        const contentArray = data?.content || [];

        const normalized = contentArray.map((o, i) => ({
          id: o.id || i,
          orderCode: o.orderCode || `ORD-${i}`,
          customerName: o.customerName || o.name || "N/A",
          email: o.email || "N/A",
          gameCount: o.gameCount || o.itemCount || 0,
          total: o.total || 0,
          createdAt: o.createdAt || new Date().toISOString(),
          status: o.status || "PENDING",
        }));

        setOrders(normalized);
        setPagination({
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || normalized.length,
          first: data.page === 0,
          last: data.page >= (data.totalPages || 1) - 1,
        });
      } catch (error) {
        console.error("[fetchOrders] Error:", error);
        toast.error(error.message || "Khong the tai danh sach don hang");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchOrders, 300);
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
      COMPLETED: {
        text: "Hoan tat",
        style: "bg-green-100 text-green-800 border-green-200",
      },
      PAID: {
        text: "Da thanh toan",
        style: "bg-blue-100 text-blue-800 border-blue-200",
      },
      PROCESSING: {
        text: "Dang xu ly",
        style: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      PENDING: {
        text: "Cho thanh toan",
        style: "bg-orange-100 text-orange-800 border-orange-200",
      },
      CANCELLED: {
        text: "Da huy",
        style: "bg-red-100 text-red-800 border-red-200",
      },
      FAILED: {
        text: "That bai",
        style: "bg-red-100 text-red-800 border-red-200",
      },
    };
    const { text, style } = map[status] || map.PENDING;
    return <Badge className={`${style} px-3 py-1`}>{text}</Badge>;
  };

  // --- Event handlers ---
  const handleSearchChange = (e) =>
    setFilters((prev) => ({ ...prev, keyword: e.target.value, page: 0 }));

  const handleStatusChange = (status) =>
    setFilters((prev) => ({ ...prev, status, page: 0 }));

  const handlePageChange = (newPage) =>
    newPage >= 0 &&
    newPage < pagination.totalPages &&
    setFilters((prev) => ({ ...prev, page: newPage }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quan ly Don hang</h1>
          <p className="text-muted-foreground mt-2">
            Theo doi va xu ly cac giao dich mua game
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">Xuat bao cao</Button>
      </div>

      {/* Bo loc va tim kiem */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tim theo ma don, ten khach hoac email..."
            className="pl-9 bg-background"
            value={filters.keyword}
            onChange={handleSearchChange}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[140px] justify-between">
              <Filter className="h-4 w-4" />
              <span>{filters.status === "ALL" ? "Tat ca trang thai" : filters.status}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["ALL", "COMPLETED", "PROCESSING", "PENDING", "CANCELLED"].map((st) => (
              <DropdownMenuItem key={st} onClick={() => handleStatusChange(st)}>
                {st === "ALL" ? "Tat ca" : getStatusBadge(st)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bang du lieu */}
      <div className="overflow-x-auto bg-[#3D1778] p-4 rounded-xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-purple-400 bg-purple-900/40">
              <th className="p-3 text-white font-semibold">Ma DH</th>
              <th className="p-3 text-white font-semibold">Nguoi mua</th>
              <th className="p-3 text-white font-semibold">Email</th>
              <th className="p-3 text-center text-white font-semibold">SL Game</th>
              <th className="p-3 text-white font-semibold">Tong tien</th>
              <th className="p-3 text-white font-semibold">Ngay tao</th>
              <th className="p-3 text-white font-semibold">Trang thai</th>
              <th className="p-3 text-center text-white font-semibold">Thao tac</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-white">
                  Dang tai du lieu...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-white">
                  Khong tim thay don hang nao.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-purple-700/50 hover:bg-purple-800/30 transition-colors"
                >
                  <td className="p-3 text-white font-medium">{o.orderCode}</td>
                  <td className="p-3 text-white">{o.customerName}</td>
                  <td className="p-3 text-gray-300">{o.email}</td>
                  <td className="p-3 text-center">
                    <span className="inline-block bg-purple-700 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                      {o.gameCount}
                    </span>
                  </td>
                  <td className="p-3 text-green-400 font-semibold">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="p-3 text-gray-300">
                    {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3">{getStatusBadge(o.status)}</td>
                  <td className="p-3 text-center">
                    <button
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                      onClick={() => console.log("Xem chi tiet:", o)}
                    >
                      <Eye className="w-4 h-4 inline mr-1" /> Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phan trang */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Hien thi <strong>{orders.length}</strong> /{" "}
          <strong>{pagination.totalElements}</strong> don hang
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={pagination.first || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Truoc
          </Button>
          <div className="text-sm font-medium">
            Trang {filters.page + 1} / {pagination.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={pagination.last || loading}
          >
            Sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
