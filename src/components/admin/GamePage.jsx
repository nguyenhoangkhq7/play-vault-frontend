import React, { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom"; 
import { Search, ChevronDown, TrendingUp, Package, X, Loader2, ChevronLeft, ChevronRight, DollarSign, ArrowUpDown, Download } from "lucide-react";
import adminGamesApi from "../../api/adminGames"; 
import { useNavigate } from "react-router-dom";

// =================================================================================
// I. REUSABLE UI COMPONENTS
// =================================================================================

const Button = ({ children, variant, size, className, onClick, disabled, type="button" }) => (
  <button onClick={onClick} disabled={disabled} type={type} className={`rounded-md font-medium transition-colors duration-200 text-sm whitespace-nowrap flex items-center justify-center ${className} ${variant === 'ghost' ? 'hover:bg-purple-700/40 text-purple-200' : ''} ${variant === 'outline' ? 'border border-purple-500/30 hover:bg-purple-700/40 bg-purple-700/20 text-white hover:text-white' : ''} ${variant === 'primary' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/50' : ''} ${size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm'} ${size === 'icon' ? 'h-8 w-8 p-0' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button>
);

const Input = ({ placeholder, className, value, onChange }) => (
  <input type="text" placeholder={placeholder} value={value} onChange={onChange} className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none bg-purple-700/30 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400/50 focus:bg-purple-700/40 ${className}`} />
);

// --- PORTAL DROPDOWN COMPONENTS ---
const DropdownContext = React.createContext(null);

const DropdownMenu = ({ children }) => {
    const triggerRef = useRef(null);
    return (
        <DropdownContext.Provider value={triggerRef}>
            <div className="relative inline-block align-middle">{children}</div>
        </DropdownContext.Provider>
    );
};

const DropdownMenuTriggerBase = ({ children, onClick }) => {
    const triggerRef = useContext(DropdownContext);
    return (
        <div ref={triggerRef} onClick={onClick} className="cursor-pointer inline-flex items-center justify-center">
            {children}
        </div>
    );
};

const DropdownMenuContent = ({ children, align, className, show, onClose }) => {
    const triggerRef = useContext(DropdownContext);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (show && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 5,
                left: align === 'end' ? rect.right + window.scrollX : rect.left + window.scrollX
            });
        }
    }, [show, align, triggerRef]);

    if (!show) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9998]" onClick={onClose}></div>
            <div 
                style={{ 
                    position: 'absolute', 
                    top: coords.top, 
                    left: coords.left,
                    transform: align === 'end' ? 'translateX(-100%)' : 'none',
                    minWidth: '12rem'
                }}
                className={`z-[9999] rounded-md shadow-2xl bg-purple-900 border border-purple-600/80 p-1 animate-in fade-in zoom-in-95 ${className}`}
            >
                {children}
            </div>
        </>,
        document.body
    );
};

const DropdownMenuItem = ({ children, className, onClick }) => (
  <div onClick={onClick} className={`p-2 rounded-md transition-colors duration-150 text-white cursor-pointer flex items-center hover:bg-purple-700/50 ${className}`}>
    {children}
  </div>
);

const Footer = () => (
  <footer className="bg-purple-800/40 border-t border-purple-700/50 text-center py-4 text-purple-300 text-sm flex-shrink-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      &copy; {new Date().getFullYear()} PlayVault. Game Management System.
    </div>
  </footer>
);

// =================================================================================
// II. MAIN PAGE COMPONENT
// =================================================================================

export function GamePage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalGamesCount, setTotalGamesCount] = useState(0);

  const [stats, setStats] = useState({ 
    totalGames: 0, 
    totalDownloads: 0, 
    totalRevenue: 0 
  });

  // STATE MỚI: Danh sách category lấy từ API
  const [categoryList, setCategoryList] = useState([]);

  const PAGE_SIZE = 10; 
  
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const SORT_OPTIONS = [
    { value: "default", label: "Mặc định" },
    { value: "revenue_desc", label: "Doanh thu cao nhất" },
    { value: "downloads_desc", label: "Lượt tải nhiều nhất" },
  ];

  const handleViewDetail = (game) => {
    navigate(`/admin/games/${game.id}`);
  };

  // Helper function: Format ngày tháng năm (dd-MM-yyyy)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
  };

  // 1. Load danh sách Category từ API
  const loadCategories = async () => {
    try {
        const response = await adminGamesApi.getCategories();
        setCategoryList(response.data || response); 
    } catch (err) {
        console.error("Lỗi tải danh sách thể loại:", err);
    }
  };

  const loadStats = async () => {
    try {
        const response = await adminGamesApi.getDashboardStats();
        setStats(response.data || response); 
    } catch (err) {
        console.error("Lỗi tải thống kê dashboard:", err);
    }
  };

  const loadGames = async (page = 0) => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const params = {
         page: page,
         size: PAGE_SIZE,
         searchQuery: searchQuery,
         categoryFilter: categoryFilter,
         sortBy: sortOption 
      };
      
      const response = await adminGamesApi.getApprovedGames(params); 
      
      const data = response.content || response.data?.content || [];
      const totalElements = response.totalElements || response.data?.totalElements || 0;
      const totalPagesData = response.totalPages || response.data?.totalPages || 0;

      setGames(data);
      setTotalGamesCount(totalElements);
      setTotalPages(totalPagesData);
      setCurrentPage(page);

    } catch (err) {
      setFetchError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      console.error("Lỗi tải game:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadStats();
    loadGames(0);
  }, []);

  useEffect(() => {
    loadGames(0);
  }, [categoryFilter, sortOption]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadGames(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const currentCategoryLabel = categoryFilter === "all" 
        ? "Tất cả Thể loại" 
        : (categoryList.find(c => c.name === categoryFilter)?.name || categoryFilter);

  const currentSortLabel = SORT_OPTIONS.find(s => s.value === sortOption)?.label || "Sắp xếp";

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr className="border-b border-purple-600/30"><td colSpan="9" className="py-12 text-center text-purple-300">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-purple-400" />Đang tải dữ liệu...
        </td></tr>
      );
    }
    if (fetchError) {
        return (<tr className="border-b border-purple-600/30"><td colSpan="9" className="py-12 text-center text-red-300">
            <X className="w-6 h-6 mx-auto mb-3" />{fetchError}
        </td></tr>);
    }
    if (games.length === 0) {
      return (<tr className="border-b border-purple-600/30"><td colSpan="9" className="py-12 text-center text-purple-300">
            Không tìm thấy game nào phù hợp.
      </td></tr>);
    }
    
    return games.map((game) => {
        const displayDownloads = game.downloads || 0;
        const displayRevenue = game.revenue !== undefined ? game.revenue : (game.price * displayDownloads);

        return (
          <tr key={game.id} className="border-b border-purple-600/30 hover:bg-purple-700/20 transition-colors duration-200">
            <td className="py-3 sm:py-4 px-3 sm:px-6">
              <img 
                src={game.image || "https://placehold.co/100x100/1e293b/a5b4fc?text=GAME"} 
                alt={game.name} 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1e293b/a5b4fc?text=N/A"; }} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-purple-500/30 flex-shrink-0"
              />
            </td>
            <td className="py-3 sm:py-4 px-3 sm:px-6"><p className="font-medium text-white text-sm truncate max-w-[150px]">{game.name}</p></td>
            <td className="py-3 sm:py-4 px-3 sm:px-6"><p className="text-xs sm:text-sm text-purple-200 truncate max-w-[100px]">{game.publisher || "Unknown"}</p></td>
            
            {/* Giá */}
            <td className="py-3 sm:py-4 px-3 sm:px-6"><p className="font-medium text-white text-sm whitespace-nowrap">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(game.price || 0)}
            </p></td>

            {/* Lượt tải */}
            <td className="py-3 sm:py-4 px-3 sm:px-6">
                <div className="flex items-center gap-1 text-purple-200">
                    <Download className="w-3 h-3" />
                    <span className="text-sm font-medium text-white">{new Intl.NumberFormat('vi-VN').format(displayDownloads)}</span>
                </div>
            </td>

            {/* Doanh thu */}
            <td className="py-3 sm:py-4 px-3 sm:px-6">
                <div className="flex items-center gap-1 text-green-400">
                    <span className="text-sm font-medium whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayRevenue)}
                    </span>
                </div>
            </td>

            {/* Ngày phát hành - Đã format */}
            <td className="py-3 sm:py-4 px-3 sm:px-6">
                <p className="text-xs sm:text-sm text-purple-200 whitespace-nowrap">
                    {formatDate(game.releaseDate)}
                </p>
            </td>

            <td className="py-3 sm:py-4 px-3 sm:px-6"><p className="text-xs sm:text-sm text-purple-200 truncate max-w-[100px]">{game.category || "Unknown"}</p></td>
            
            <td className="py-3 sm:py-4 px-3 sm:px-6 relative text-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mx-auto text-purple-300 hover:text-white"
                    onClick={() => handleViewDetail(game)}
                >
                    Xem chi tiết
                </Button>
            </td>
          </tr>
        );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col font-['Inter']">
      
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] p-4 rounded-lg bg-red-600 shadow-xl flex items-center gap-3 animate-in slide-in-from-top">
            <X className="w-5 h-5 text-white" />
            <span className="font-medium text-white text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2 text-white/80 hover:text-white p-1 h-auto"><X className="w-4 h-4"/></Button>
        </div>
      )}

      <header className="border-b border-purple-700/50 bg-purple-800/40 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-center items-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-lg">
            Quản lý Game 
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-white">Game Đã Duyệt</h2>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 flex-shrink-0">
            {/* Card 1 */}
            <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:bg-purple-600/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-purple-200 mb-2">Tổng số Game</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats.totalGames}</p>
                </div>
                <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg border border-purple-500/30 flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:bg-purple-600/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-purple-200 mb-2">Số lượt Tải</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {new Intl.NumberFormat('vi-VN').format(stats.totalDownloads)}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg border border-purple-500/30 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-purple-600/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 hover:bg-purple-600/50">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-purple-200 mb-2">Tổng Doanh Thu</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg border border-purple-500/30 flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 flex-shrink-0">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300 flex-shrink-0" />
              <Input placeholder="Tìm kiếm theo tên, publisher..." className="pl-10 bg-purple-700/30 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400/50 focus:bg-purple-700/40 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                
                {/* 1. Category Filter (DYNAMIC) */}
                <DropdownMenu>
                <DropdownMenuTriggerBase onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}>
                    <Button variant="outline" className="border-purple-500/30 hover:bg-purple-700/40 gap-2 bg-purple-700/20 text-white hover:text-white flex-shrink-0 text-sm w-full sm:w-auto justify-between">
                    {currentCategoryLabel} <ChevronDown className="w-4 h-4" />
                    </Button>
                </DropdownMenuTriggerBase>
                <DropdownMenuContent show={categoryDropdownOpen} onClose={() => setCategoryDropdownOpen(false)}>
                    {/* Luôn hiển thị option "Tất cả" */}
                    <DropdownMenuItem onClick={() => { setCategoryFilter("all"); setCategoryDropdownOpen(false); }} className="text-white hover:bg-purple-700/50 cursor-pointer font-bold">
                        Tất cả
                    </DropdownMenuItem>
                    
                    {/* Render danh sách thể loại từ API */}
                    {categoryList.map(category => (
                        <DropdownMenuItem 
                            key={category.id} 
                            onClick={() => { setCategoryFilter(category.name); setCategoryDropdownOpen(false); }} 
                            className="text-white hover:bg-purple-700/50 cursor-pointer"
                        >
                            {category.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. Sort Filter */}
                <DropdownMenu>
                <DropdownMenuTriggerBase onClick={() => setSortDropdownOpen(!sortDropdownOpen)}>
                    <Button variant="outline" className="border-purple-500/30 hover:bg-purple-700/40 gap-2 bg-purple-700/20 text-white hover:text-white flex-shrink-0 text-sm w-full sm:w-auto justify-between">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                    {currentSortLabel} <ChevronDown className="w-4 h-4" />
                    </Button>
                </DropdownMenuTriggerBase>
                <DropdownMenuContent show={sortDropdownOpen} onClose={() => setSortDropdownOpen(false)} align="end">
                    {SORT_OPTIONS.map(option => (
                    <DropdownMenuItem key={option.value} onClick={() => { setSortOption(option.value); setSortDropdownOpen(false); }} className="text-white hover:bg-purple-700/50 cursor-pointer">
                        {option.label}
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className="bg-purple-800/40 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr className="border-b border-purple-500/30 bg-purple-700/20 sticky top-0 backdrop-blur-md">
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Ảnh</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Tên Game</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Publisher</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Giá</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Lượt tải</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Doanh thu</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Ngày phát hành</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">Thể loại</th>
                    <th className="text-xs sm:text-sm font-semibold text-purple-100 py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-700/30">
                  {renderTableContent()}
                </tbody>
              </table>
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-purple-500/30 flex items-center justify-between bg-purple-700/20 flex-shrink-0 gap-2 flex-wrap">
              <p className="text-xs sm:text-sm text-purple-200">
                Trang <span className="font-medium text-white">{currentPage + 1}</span> / <span className="font-medium text-white">{totalPages > 0 ? totalPages : 1}</span> | 
                Tổng <span className="font-medium text-white">{totalGamesCount}</span> game
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadGames(currentPage - 1)} disabled={currentPage === 0 || loading} className="border-purple-500/30 hover:bg-purple-700/40 bg-purple-700/20 text-white hover:text-white text-xs px-2"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => loadGames(currentPage + 1)} disabled={currentPage >= totalPages - 1 || loading} className="border-purple-500/30 hover:bg-purple-700/40 bg-purple-700/20 text-white hover:text-white text-xs px-2"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default GamePage;