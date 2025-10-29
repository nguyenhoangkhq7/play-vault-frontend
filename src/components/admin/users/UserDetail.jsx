import React from 'react';
import { ArrowLeft, User, Building, Mail, Calendar, Gamepad2, ShieldOff, FileText } from 'lucide-react';

export default function UserDetail({ account, onBack }) {
  const isUser = account.id.startsWith('U-');
  account= { id: 'P-10112', name: 'Indie Creators', email: 'support@indie.com', date: '19-10-2024', games: 5, status: 'Blocked', blockHistory: [{ date: '20-10-2024', reason: 'Chậm báo cáo doanh thu' }] }
  return (
    <div className="bg-gradient-to-br from-[#1a0f35] to-[#0f0b1a] p-6 rounded-2xl shadow-2xl border border-purple-500/30 animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-500/30">
        <button onClick={onBack} className="flex items-center text-purple-300 hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Quay lại danh sách
        </button>
        <span className={`px-4 py-1.5 rounded-full font-medium ${isUser ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'}`}>
          {isUser ? 'Người dùng' : 'Nhà phát hành'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
        <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mr-6 mb-4 md:mb-0">
          {isUser ? <User size={40} className="text-white" /> : <Building size={40} className="text-white" />}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">{account.name}</h2>
          <p className="text-lg text-gray-400">{account.id}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
          account.status === 'Active' ? 'bg-green-500/20 text-green-300' :
          account.status === 'Pending review' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-red-500/20 text-red-300'
        }`}>{account.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#2a1a4f]/60 p-4 rounded-lg border border-purple-500/20">
          <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center"><Mail size={16} className="mr-2" /> Email</h4>
          <p className="text-white">{account.email}</p>
        </div>
        <div className="bg-[#2a1a4f]/60 p-4 rounded-lg border border-purple-500/20">
          <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center"><Calendar size={16} className="mr-2" /> Ngày tham gia</h4>
          <p className="text-white">{account.date}</p>
        </div>
        {!isUser && (
          <div className="bg-[#2a1a4f]/60 p-4 rounded-lg border border-purple-500/20">
            <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center"><Gamepad2 size={16} className="mr-2" /> Số game đã đăng</h4>
            <p className="text-white">{account.games}</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center"><ShieldOff size={20} className="mr-2" /> Lịch sử Chặn</h3>
        {account.blockHistory && account.blockHistory.length > 0 ? (
          <div className="bg-[#2a1a4f]/60 rounded-lg border border-purple-500/20 divide-y divide-purple-500/20">
            {account.blockHistory.slice().reverse().map((entry, index) => (
              <div key={index} className="p-4 flex flex-col md:flex-row justify-between">
                <div>
                  <p className="text-white font-medium flex items-center"><FileText size={16} className="mr-2" /> {entry.reason}</p>
                </div>
                <p className="text-gray-400 text-sm mt-2 md:mt-0">Ngày: {entry.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6 bg-[#2a1a4f]/60 rounded-lg border border-purple-500/20">Không có lịch sử chặn.</p>
        )}
      </div>
    </div>
  );
}
