import React, { useState, useEffect } from 'react';
import StatCard from '../components/admin/monitoring/StatCard';
import OrdersTable from '../components/admin/monitoring/OrdersTable';
import OrderModal from '../components/admin/monitoring/OrderModal';
import SearchFilterBar from '../components/admin/monitoring/SearchFilterBar';
import { CheckCircleIcon, ClockIcon, DollarSignIcon } from 'lucide-react';
import { getReports, processReport } from '../api/report';
import { useUser } from '../store/UserContext';

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { setAccessToken } = useUser();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getReports({}, setAccessToken);
        const reports = response.content || [];
        const mappedOrders = reports.map(report => ({
          id: `ORD-${report.reportId}`,
          customerName: report.customerName,
          customerEmail: report.customerEmail,
          amount: `${report.amount.toLocaleString('vi-VN')} đ`,
          bankTransactionId: report.transactionCode,
          time: report.createdAt,
          status: report.status === 'PENDING' ? 'Chờ xác nhận' : report.status === 'RESOLVED' ? 'Đã xác nhận' : 'Đã hủy',
          description: report.description
        }));
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [setAccessToken]);

  // === Order Modal ===
  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, adminNote) => {
    const reportId = orderId.split('-')[1];
    const approved = newStatus === 'Đã xác nhận';
    setUpdatingOrder(true);
    try {
      await processReport(reportId, approved, adminNote, setAccessToken);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSuccessMessage(`Đơn hàng ${orderId} đã được ${newStatus.toLowerCase()} thành công!`);
      handleCloseOrderModal();
      // Auto hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrder(false);
    }
  };

  // === Filtered Orders ===
  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const match = s === '' || Object.values(o).some(v => String(v).toLowerCase().includes(s));
    const matchFilter = filter === 'Tất cả' || o.status === filter;
    return match && matchFilter;
  });

  const totalValue = orders
    .filter(o => o.status === 'Đã xác nhận')
    .reduce((sum, o) => sum + parseFloat(o.amount.replace(/\./g, '').replace(' đ', '')), 0);

  if (loading) {
    return (
      <div className="min-h-screen text-gray-300 font-sans flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const pending = orders.filter(o => o.status === 'Chờ xác nhận').length;
  const confirmed = orders.filter(o => o.status === 'Đã xác nhận').length;
  const cancelled = orders.filter(o => o.status === 'Đã hủy').length;
  const total = orders.length;

  return (
    <div className="min-h-screen text-gray-300 font-sans">
      <main className="mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Xử lý sự cố đơn hàng</h1>
          <p className="text-purple-300">Quản lý và cập nhật trạng thái đơn hàng có vấn đề về thanh toán</p>
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 font-medium">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Chờ xác nhận" value={pending} icon={ClockIcon}/>
          <StatCard title="Đã xác nhận" value={confirmed} icon={CheckCircleIcon}/>
          <StatCard title="Tổng giá trị" value={`${totalValue.toLocaleString('vi-VN')} đ`} icon={DollarSignIcon}/>
        </div>

        <SearchFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          counts={{ all: total, pending, confirmed, cancelled }}
        />
        <OrdersTable orders={filteredOrders} handleOpenModal={handleOpenOrderModal} />
        {isOrderModalOpen && (
          <OrderModal 
            order={selectedOrder} 
            onClose={handleCloseOrderModal} 
            onUpdate={handleUpdateOrderStatus}
            updating={updatingOrder}
          />
        )}

      </main>
    </div>
  );
}
