import React, { useState, useRef, useEffect } from 'react';
import UsersTable from '../components/admin/users/UsersTable';
import PublishersTable from '../components/admin/users/PublishersTable';
import DetailModal from '../components/admin/users/DetailModal';

export default function Users() {
  const [activeTab, setActiveTab] = useState('user');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [users, setUsers] = useState([
    { id: 'U-10111', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', date: '20-10-2024', status: 'Active', blockHistory: [] },
    { id: 'U-10112', name: 'Trần Thị B', email: 'tranthib@gmail.com', date: '21-10-2024', status: 'Active', blockHistory: [] },
    { id: 'U-10113', name: 'Lê Văn C', email: 'levanc@gmail.com', date: '22-10-2024', status: 'Blocked', blockHistory: [{ date: '23-10-2024', reason: 'Vi phạm quy tắc cộng đồng' }] },
  ]);

  const [publishers, setPublishers] = useState([
    { id: 'P-10111', name: 'GameDev Studio X', email: 'contact@x.com', date: '20-10-2024', games: 12, status: 'Active', blockHistory: [] },
    { id: 'P-10112', name: 'Indie Creators', email: 'support@indie.com', date: '19-10-2024', games: 5, status: 'Blocked', blockHistory: [{ date: '20-10-2024', reason: 'Chậm báo cáo doanh thu' }] },
    { id: 'P-10113', name: 'AAA Games Inc.', email: 'press@aaa.com', date: '18-10-2024', games: 25, status: 'Pending review', blockHistory: [] },
  ]);

  const userTabRef = useRef(null);
  const publisherTabRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({});

  useEffect(() => {
    if (activeTab === 'user' && userTabRef.current) {
      setUnderlineStyle({
        left: userTabRef.current.offsetLeft,
        width: userTabRef.current.offsetWidth,
      });
    } else if (activeTab === 'publisher' && publisherTabRef.current) {
      setUnderlineStyle({
        left: publisherTabRef.current.offsetLeft,
        width: publisherTabRef.current.offsetWidth,
      });
    }
  }, [activeTab]);

  // Toggle status
  const handleUserStatusToggle = (userId, reason) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
        const newBlockHistory = [...user.blockHistory];
        if (newStatus === 'Blocked' && reason) {
          newBlockHistory.push({ date: new Date().toLocaleDateString('vi-VN'), reason });
        }
        return { ...user, status: newStatus, blockHistory: newBlockHistory };
      }
      return user;
    }));
  };

  const handlePublisherStatusToggle = (pubId) => {
    setPublishers(publishers.map(pub =>
      pub.id === pubId ? { ...pub, status: pub.status === 'Active' ? 'Blocked' : 'Active' } : pub
    ));
  };

  // VIEW DETAILS -> mở modal
  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen text-gray-300 font-sans">
      <main>
        <h1 className="text-3xl font-bold text-white mb-6">Admin quản lý tài khoản</h1>

        <div className="relative flex border-b border-purple-500/50 mb-6">
          <button ref={userTabRef} onClick={() => setActiveTab('user')}
            className={`py-2 px-6 text-lg font-semibold ${activeTab === 'user' ? 'text-white' : 'text-gray-400'}`}>
            Người dùng (User)
          </button>

          <button ref={publisherTabRef} onClick={() => setActiveTab('publisher')}
            className={`py-2 px-6 text-lg font-semibold ${activeTab === 'publisher' ? 'text-white' : 'text-gray-400'}`}>
            Nhà phát hành (Publisher)
          </button>

          <div className="absolute bottom-[-1px] h-0.5 bg-pink-500 transition-all duration-300 ease-in-out"
            style={underlineStyle}></div>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm theo ID, Tên, Email..."
            className="w-full bg-[#3D1778]/80 border border-purple-500/50 rounded-lg py-3 pl-4 pr-12 text-white"
          />
        </div>

        {activeTab === 'user' ? (
          <UsersTable
            users={users}
            onStatusToggle={handleUserStatusToggle}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <PublishersTable
            publishers={publishers}
            onStatusToggle={handlePublisherStatusToggle}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* MODAL */}
        <DetailModal
          isOpen={isModalOpen}
          account={selectedAccount}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
}
