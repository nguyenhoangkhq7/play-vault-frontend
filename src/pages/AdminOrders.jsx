import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronLeft, ChevronRight, 
  MoreVertical, Eye, CheckCircle, XCircle 
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { toast } from 'sonner';

import { fetchAdminOrders } from '../api/order'; 

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter và phân trang
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    keyword: '',
    status: 'ALL'
  });

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true
  });

  useEffect(() => {
    console.log('⚡ [useEffect] filters changed:', filters);
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('🔄 [fetchOrders] Starting fetch with filters:', filters);
        
        const data = await fetchAdminOrders(
          filters.page,
          filters.size,
          filters.keyword,
          filters.status
        );

        console.log('✅ [fetchOrders] API response received:', data);

        // Chuẩn hóa dữ liệu
        const contentArray = data.content || [];
        console.log('📦 [fetchOrders] Content array:', contentArray);
        console.log('📦 [fetchOrders] Content length:', contentArray.length);

        const normalized = contentArray.map((o, i) => {
          const item = {
            id: o.id || i,
            orderCode: o.orderCode || `ORD-${i}`,
            customerName: o.customerName || o.name || 'N/A',
            email: o.email || 'N/A',
            gameCount: o.gameCount || o.itemCount || 0,
            total: o.total || 0,
            createdAt: o.createdAt || new Date().toISOString(),
            status: o.status || 'PENDING'
          };
          console.log(`📝 [fetchOrders] Normalized item ${i}:`, item);
          return item;
        });

        console.log('✨ [fetchOrders] Final normalized array:', normalized);

        setOrders(normalized);
        console.log('🎯 [fetchOrders] setOrders called with:', normalized);
        
        setPagination({
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || normalized.length,
          first: data.page === 0,
          last: data.page >= (data.totalPages || 1) - 1
        });
      } catch (error) {
        console.error("❌ [fetchOrders] Error:", error);
        console.error("❌ [fetchOrders] Error message:", error.message);
        console.error("❌ [fetchOrders] Error stack:", error.stack);
        toast.error(error.message || "Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      console.log('⏱️ [useEffect] Calling fetchOrders after 300ms');
      fetchOrders();
    }, 300);
    
    return () => {
      console.log('🗑️ [useEffect] Cleanup - clearing timeout');
      clearTimeout(timer);
    };
  }, [filters]);

  useEffect(() => {
    console.log('📊 [useEffect orders] Orders state updated:', orders);
    console.log('📊 [useEffect orders] Orders count:', orders.length);
  }, [orders]);

  // --- Hàm tiện ích ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusBadge = (status) => {
    const map = {
      COMPLETED: { text: 'Hoàn tất', style: 'bg-green-100 text-green-800 border-green-200' },
      PAID: { text: 'Đã thanh toán', style: 'bg-blue-100 text-blue-800 border-blue-200' },
      PROCESSING: { text: 'Đang xử lý', style: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      PENDING: { text: 'Chờ thanh toán', style: 'bg-orange-100 text-orange-800 border-orange-200' },
      CANCELLED: { text: 'Đã hủy', style: 'bg-red-100 text-red-800 border-red-200' },
      FAILED: { text: 'Thất bại', style: 'bg-red-100 text-red-800 border-red-200' },
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

  // --- Render ---
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Đơn hàng</h1>
            <p className="text-muted-foreground mt-2">
              Theo dõi và xử lý các giao dịch mua game
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">Xuất báo cáo</Button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách hoặc email..."
              className="pl-9 bg-background"
              value={filters.keyword}
              onChange={handleSearchChange}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[140px] justify-between">
                <Filter className="h-4 w-4" />
                <span>
                  {filters.status === 'ALL' ? 'Tất cả trạng thái' : filters.status}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'CANCELLED'].map((st) => (
                <DropdownMenuItem key={st} onClick={() => handleStatusChange(st)}>
                  {st === 'ALL' ? 'Tất cả' : getStatusBadge(st)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto bg-[#3D1778] p-4 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-purple-400 bg-purple-900/40">
                <th className="p-3 text-white font-semibold">Mã ĐH</th>
                <th className="p-3 text-white font-semibold">Người mua</th>
                <th className="p-3 text-white font-semibold">Email</th>
                <th className="p-3 text-center text-white font-semibold">SL Game</th>
                <th className="p-3 text-white font-semibold">Tổng tiền</th>
                <th className="p-3 text-white font-semibold">Ngày tạo</th>
                <th className="p-3 text-white font-semibold">Trạng thái</th>
                <th className="p-3 text-center text-white font-semibold">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-white">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-white">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-purple-700/50 hover:bg-purple-800/30 transition-colors">
                    <td className="p-3 text-white font-medium">{o.orderCode}</td>
                    <td className="p-3 text-white">{o.customerName}</td>
                    <td className="p-3 text-gray-300">{o.email}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block bg-purple-700 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        {o.gameCount}
                      </span>
                    </td>
                    <td className="p-3 text-green-400 font-semibold">{formatCurrency(o.total)}</td>
                    <td className="p-3 text-gray-300">
                      {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3">{getStatusBadge(o.status)}</td>
                    <td className="p-3 text-center">
                      <button
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                        onClick={() => console.log('Xem chi tiết:', o)}
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

        {/* Phân trang */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Hiển thị <strong>{orders.length}</strong> /{' '}
            <strong>{pagination.totalElements}</strong> đơn hàng
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={pagination.first || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
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
    </AdminLayout>
  );
};

export default AdminOrders;
