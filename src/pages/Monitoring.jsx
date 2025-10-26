import React, { useState } from 'react';
import StatCard from '../components/admin/monitoring/StatCard';
import OrdersTable from '../components/admin/monitoring/OrdersTable';
import OrderModal from '../components/admin/monitoring/OrderModal';
import SearchFilterBar from '../components/admin/monitoring/SearchFilterBar';
import { CheckCircleIcon, ClockIcon, DollarSignIcon } from 'lucide-react';

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders, setOrders] = useState([
    { id: 'ORD-2024-001', customerName: 'Lê Văn C', customerEmail: 'levanc@email.com', amount: '2.100.000 đ', bankTransactionId: 'TCB-20240115-001', time: '2024-01-15 12:00:00', status: 'Đã xác nhận' },
    { id: 'ORD-2024-002', customerName: 'Nguyễn Thị A', customerEmail: 'nguyena@email.com', amount: '850.000 đ', bankTransactionId: 'VCB-20240115-002', time: '2024-01-15 11:30:00', status: 'Chờ xác nhận' },
    { id: 'ORD-2024-003', customerName: 'Trần Văn B', customerEmail: 'tranb@email.com', amount: '1.250.000 đ', bankTransactionId: 'ACB-20240114-005', time: '2024-01-14 18:00:00', status: 'Đã xác nhận' },
    { id: 'ORD-2024-004', customerName: 'Phạm Hữu D', customerEmail: 'phamhd@email.com', amount: '4.200.000 đ', bankTransactionId: 'TCB-20240114-004', time: '2024-01-14 15:45:00', status: 'Chờ xác nhận' },
    { id: 'ORD-2024-005', customerName: 'Vũ Thị E', customerEmail: 'vuthie@email.com', amount: '350.000 đ', bankTransactionId: 'BIDV-20240113-007', time: '2024-01-13 10:20:00', status: 'Đã hủy' },
  ]);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    handleCloseModal();
  };

  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const match = s === '' || Object.values(o).some(v => String(v).toLowerCase().includes(s));
    const matchFilter = filter === 'Tất cả' || o.status === filter;
    return match && matchFilter;
  });

  const pending = orders.filter(o => o.status === 'Chờ xác nhận').length;
  const confirmed = orders.filter(o => o.status === 'Đã xác nhận').length;
  const cancelled = orders.filter(o => o.status === 'Đã hủy').length;
  const total = orders.length;
  const totalValue = orders.filter(o => o.status === 'Đã xác nhận')
    .reduce((sum, o) => sum + parseFloat(o.amount.replace(/\./g, '').replace(' đ', '')), 0);

  return (
    <div className="min-h-screen text-gray-300 font-sans">
      <main className="mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Xử lý sự cố đơn hàng</h1>
          <p className="text-purple-300">Quản lý và cập nhật trạng thái đơn hàng có vấn đề về thanh toán</p>
        </div>

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

        <OrdersTable orders={filteredOrders} handleOpenModal={handleOpenModal} />

        {isModalOpen && (
          <OrderModal order={selectedOrder} onClose={handleCloseModal} onUpdate={handleUpdateOrderStatus} />
        )}
      </main>
    </div>
  );
}
