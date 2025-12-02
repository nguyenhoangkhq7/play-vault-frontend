import React, { useState, useEffect } from "react"; // Thêm React để dùng forwardRef
import {
  Search,
  ChevronDown,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Footer from "../home/footer";
import { useNavigate } from "react-router-dom";
import adminGamesApi from "../../api/adminGames"; 

// --- 1. TỰ ĐỊNH NGHĨA BUTTON ĐỂ TRÁNH LỖI REF ---
const Button = React.forwardRef(({ className, variant, size, children, ...props }, ref) => {
  // Base styles
  let classes = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  // Size styles (giản lược)
  if (size === "sm") classes += " h-9 rounded-md px-3";
  else classes += " h-10 px-4 py-2";

  // Custom className truyền vào
  if (className) classes += ` ${className}`;

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";
// -----------------------------------------------

export function ApprovalPage() {
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const statusParam = filter === "all" ? "all" : filter.toUpperCase();
      const response = await adminGamesApi.getSubmissions({
        searchQuery: searchQuery,
        status: statusParam, 
        page: 0,
        size: 50 
      });
      setGames(response.content || response.data?.content || []);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      setError("Không thể tải danh sách game.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      loadSubmissions();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, filter]);

  const getStatusConfig = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "pending":
        return { icon: Clock, label: "Chờ duyệt", color: "text-yellow-400", badgeColor: "bg-yellow-500/20 border border-yellow-500/30" };
      case "approved":
        return { icon: CheckCircle2, label: "Đã duyệt", color: "text-green-400", badgeColor: "bg-green-500/20 border border-green-500/30" };
      case "rejected":
        return { icon: XCircle, label: "Từ chối", color: "text-red-400", badgeColor: "bg-red-500/20 border border-red-500/30" };
      default:
        return { icon: Clock, label: status || "Không xác định", color: "text-gray-400", badgeColor: "bg-gray-500/20 border border-gray-500/30" };
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc muốn duyệt game này?")) return;
    try {
        await adminGamesApi.approveGame(id);
        alert("Duyệt thành công!");
        loadSubmissions(); 
    } catch (err) {
        alert("Lỗi khi duyệt game.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Nhập lý do từ chối:", "Nội dung chưa đạt yêu cầu");
    if (reason === null) return; 
    try {
        await adminGamesApi.rejectGame(id, reason);
        alert("Đã từ chối game.");
        loadSubmissions(); 
    } catch (err) {
        alert("Lỗi khi từ chối game.");
    }
  };

  const handleCardClick = (id) => {
    navigate(`/admin/games/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col">
      <main className="flex-1 overflow-visible"> 
        
        <header className="border-b border-purple-700/50 bg-purple-800/40 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-center items-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-lg">
              Quản lý duyệt game
            </h1>
          </div>
        </header>

        <div className="pl-4 pr-8 py-10">
          <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <Input
                placeholder="Tìm kiếm theo tên game hoặc nhà phát hành..."
                className="pl-12 bg-white/10 border-purple-700/30 text-white placeholder:text-purple-300 focus:border-purple-500/50 focus:bg-white/15 transition-colors w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown Filter - Dùng Button tự định nghĩa (đã có forwardRef) */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 whitespace-nowrap bg-purple-800/50 border-purple-700/50 text-white hover:bg-purple-800/70 hover:border-purple-600/50 min-w-[160px] justify-between">
                   <span>
                    {filter === "all" ? "Tất cả" : 
                     filter === "pending" ? "Chờ duyệt" : 
                     filter === "approved" ? "Đã duyệt" : "Từ chối"}
                   </span>
                   <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent
                align="end"
                className="w-48 bg-gray-900 border-purple-700/30 z-[9999]" 
                sideOffset={5}
              >
                {[
                  { id: "all", label: "Tất cả", color: "bg-purple-400" },
                  { id: "pending", label: "Chờ duyệt", color: "bg-yellow-400" },
                  { id: "approved", label: "Đã duyệt", color: "bg-green-400" },
                  { id: "rejected", label: "Từ chối", color: "bg-red-400" }
                ].map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className="text-white hover:bg-purple-800/50 cursor-pointer flex items-center py-2"
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${filter === item.id ? item.color : "bg-gray-600"}`} />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading ? (
             <div className="flex justify-center py-20 text-purple-300">
                <Loader2 className="w-10 h-10 animate-spin" />
             </div>
          ) : error ? (
             <div className="text-center py-20 text-red-300">{error}</div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {games.map((game) => {
                const statusConfig = getStatusConfig(game.status);
                const StatusIcon = statusConfig.icon;
                const priceDisplay = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(game.price || 0);
                const imageUrl = game.image || game.thumbnail || "https://via.placeholder.com/300x200?text=No+Image";

                return (
                  <div
                    key={game.id}
                    onClick={() => handleCardClick(game.id)}
                    className="bg-gray-900/80 border border-purple-700/30 rounded-xl overflow-hidden hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-900/50 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                  >
                    <div className="aspect-video bg-gray-800 overflow-hidden relative">
                      <img
                        src={imageUrl}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=Error"}
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white text-lg truncate pr-2 flex-1" title={game.name}>
                            {game.name}
                          </h3>
                      </div>
                      
                      <p className="text-sm text-purple-300 mb-3 truncate" title={game.publisher}>
                        Publisher: {game.publisher || "Unknown"}
                      </p>
                      <p className="text-xl font-bold text-purple-400 mb-3">
                        {priceDisplay}
                      </p>

                      <div className="mt-auto">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${statusConfig.badgeColor} w-fit`}>
                            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                            <span className={`text-sm font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>

                        {String(game.status).toUpperCase() === "PENDING" && (
                            <div
                            className="flex gap-3 pt-2 border-t border-purple-700/30"
                            onClick={(e) => e.stopPropagation()} 
                            >
                            <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors h-9"
                                onClick={() => handleApprove(game.id)}
                            >
                                <Check className="w-4 h-4 mr-1.5" /> Duyệt
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700/50 font-medium transition-colors h-9"
                                onClick={() => handleReject(game.id)}
                            >
                                <X className="w-4 h-4 mr-1.5" /> Từ chối
                            </Button>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-purple-300 bg-purple-900/20 rounded-xl border border-dashed border-purple-700/50">
              Không tìm thấy yêu cầu nào phù hợp.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ApprovalPage;