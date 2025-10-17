import React, { useState, useRef, useEffect } from 'react';
import UsersTable from '../components/admin/users/UsersTable';
import PublishersTable from '../components/admin/users/PublishersTable';
import EmailModal from '../components/admin/users/EmailModal';
import { SearchIcon } from 'lucide-react';


// --- Main App Component ---
export default function Users() {
  const [activeTab, setActiveTab] = useState('user');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const [users, setUsers] = useState([
    { id: 'U-10111', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', date: '20-10-2024', status: 'Active' },
    { id: 'U-10112', name: 'Trần Thị B', email: 'tranthib@gmail.com', date: '21-10-2024', status: 'Active' },
    { id: 'U-10113', name: 'Lê Văn C', email: 'levanc@gmail.com', date: '22-10-2024', status: 'Blocked' },
  ]);
  
  const [publishers, setPublishers] = useState([
    { id: 'P-10111', name: 'GameDev Studio X', email: 'contact@x.com', date: '20-10-2024', games: 12, status: 'Active' },
    { id: 'P-10112', name: 'Indie Creators', email: 'support@indie.com', date: '19-10-2024', games: 5, status: 'Blocked' },
    { id: 'P-10113', name: 'AAA Games Inc.', email: 'press@aaa.com', date: '18-10-2024', games: 25, status: 'Pending review' },
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
  

  const handleUserStatusToggle = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active' } : user
    ));
  };
  
  const handlePublisherStatusToggle = (pubId) => {
      setPublishers(publishers.map(pub =>
          pub.id === pubId ? { ...pub, status: pub.status === 'Active' ? 'Blocked' : 'Active' } : pub
      ));
  };

  const handleGenerateEmail = async (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
    setIsLoading(true);
    setGeneratedEmail('');
    setCopySuccess('');

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    let prompt = '';
    const isUser = account.id.startsWith('U-');

    if (isUser) {
        prompt = account.status === 'Active'
          ? `Write a friendly and welcoming email in Vietnamese to a new user named ${account.name} on our platform, GameHub. Briefly mention that they can explore a wide variety of games and connect with other gamers. Keep it short and engaging. Start with "Chào ${account.name}," and end with "Chúc bạn có những giờ phút chơi game vui vẻ,\nĐội ngũ GameHub".`
          : `Write a professional and courteous email in Vietnamese to a user named ${account.name} informing them that their account on GameHub has been temporarily blocked due to a violation of our community guidelines. Mention that they can contact support at contact@gamehub.vn for more details. Keep it concise. Start with "Chào ${account.name}," and end with "Trân trọng,\nĐội ngũ GameHub".`;
    } else { // Publisher
        switch(account.status) {
            case 'Active':
                prompt = `Write a professional email in Vietnamese to our partner, ${account.name}, on GameHub. Thank them for their partnership and mention we are excited to see their upcoming games on our platform. Keep it concise and professional. Start with "Kính gửi ${account.name}," and end with "Trân trọng,\nĐội ngũ GameHub".`;
                break;
            case 'Blocked':
                prompt = `Write a professional email in Vietnamese to our partner, ${account.name}, informing them that their publisher account on GameHub has been temporarily suspended due to a violation of our terms of service. Mention that they should contact our partnership team at partners@gamehub.vn for more details. Start with "Kính gửi ${account.name}," and end with "Trân trọng,\nĐội ngũ GameHub".`;
                break;
            case 'Pending review':
                prompt = `Write a professional email in Vietnamese to a new publisher applicant, ${account.name}, on GameHub. Inform them that we have received their application and it is currently under review. Mention that the review process may take a few business days and we will notify them of the outcome via email. Start with "Kính gửi ${account.name}," and end with "Trân trọng,\nĐội ngũ GameHub".`;
                break;
            default:
                prompt = `Create a generic email for ${account.name}.`
        }
    }


    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API call failed: ${response.status}`);
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Không thể tạo email. Vui lòng thử lại.';
      setGeneratedEmail(text);
    } catch (error) {
      console.error("Error calling API:", error);
      setGeneratedEmail('Đã xảy ra lỗi khi kết nối.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail).then(() => {
        setCopySuccess('Đã sao chép!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Sao chép thất bại!');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };


  return (
    <div className=" min-h-screen text-gray-300 font-sans">
        <div className="flex-1">

          {/* --- Main Content --- */}
          <main className="">
              <h1 className="text-3xl font-bold text-white mb-6">Admin quản lý tài khoản</h1>
              
              <div className="relative flex border-b border-purple-500/50 mb-6">
                <button 
                  ref={userTabRef}
                  onClick={() => setActiveTab('user')}
                  className={`py-2 px-6 text-lg font-semibold transition-colors duration-300 ${activeTab === 'user' ? 'text-white' : 'text-gray-400'}`}
                >
                  Người dùng (User)
                </button>
                <button 
                  ref={publisherTabRef}
                  onClick={() => setActiveTab('publisher')}
                  className={`py-2 px-6 text-lg font-semibold transition-colors duration-300 ${activeTab === 'publisher' ? 'text-white' : 'text-gray-400'}`}
                >
                  Nhà phát hành (Publisher)
                </button>
                <div 
                   className="absolute bottom-[-1px] h-0.5 bg-pink-500 transition-all duration-300 ease-in-out"
                   style={underlineStyle}
                ></div>
              </div>

              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Tìm theo ID, Tên, Email..."
                  className="w-full bg-[#3D1778]/80 border border-purple-500/50 rounded-lg py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"/>
              </div>

              {activeTab === 'user' ? (
                <UsersTable users={users} onStatusToggle={handleUserStatusToggle} onGenerateEmail={handleGenerateEmail} />
              ) : (
                <PublishersTable publishers={publishers} onStatusToggle={handlePublisherStatusToggle} onGenerateEmail={handleGenerateEmail} />
              )}
          </main>
      </div>
      
      <EmailModal
        isOpen={isModalOpen}
        account={selectedAccount}
        generatedEmail={generatedEmail}
        isLoading={isLoading}
        copySuccess={copySuccess}
        onClose={() => setIsModalOpen(false)}
        onCopy={copyToClipboard}
      />

      

        <style>{`
          @keyframes scale-in {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
          }
        `}</style>

    </div>
  );
}

