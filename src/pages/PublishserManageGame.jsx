import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// [UPDATE] Thêm icon Eye
import { Pencil, Search, X, Wallet, Download, Star, MessageSquare, Eye } from "lucide-react";
import publisherApi from "../api/publisherApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PublisherManageGame() {
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.publisherId || user.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const PUBLISHER_ID = getUserFromStorage();
  const navigate = useNavigate();

  // --- STATE ---
  const [games, setGames] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    price: "",
    shortDescription: "",
    description: "",
    categoryId: 1,
    trailerUrl: "",
    isFree: false,
  });

  // --- HELPERS ---
  const formatGCoin = (num) => {
    const formattedNum = new Intl.NumberFormat("vi-VN").format(num || 0);
    return `${formattedNum} GCoin`;
  };

  const formatNumber = (num) => new Intl.NumberFormat("vi-VN").format(num || 0);

  const getGameInfo = (game, field) => {
    const info = game.gameBasicInfo || game.gameBasicInfos || game;
    return info[field];
  };

  const getGameName = (game) => getGameInfo(game, "name") || game.name || "Chưa có tên";
  const getGamePrice = (game) => {
    const price = getGameInfo(game, "price");
    return price !== undefined ? price : game.price || 0;
  };

  // --- RENDER STATUS ---
  const renderGameStatus = (game) => {
    const status = game.status || getGameInfo(game, "status") || "PENDING";
    switch (status) {
      case "APPROVED":
      case "PUBLISHED":
        return <span className="text-green-400/90 bg-green-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">Đã xuất bản</span>;
      case "PENDING":
      case "REVIEWING":
        return <span className="text-yellow-400/90 bg-yellow-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">Đang duyệt</span>;
      case "REJECTED":
        return <span className="text-red-400/90 bg-red-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">Bị từ chối</span>;
      default:
        return <span className="text-gray-400/90 bg-gray-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">{status}</span>;
    }
  };

  // --- FETCH DATA ---
  useEffect(() => {
    if (!PUBLISHER_ID) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, gamesRes, catsRes] = await Promise.all([
          publisherApi.getDashboardStats(PUBLISHER_ID),
          publisherApi.getGames(PUBLISHER_ID),
          publisherApi.getCategories().catch(() => []),
        ]);

        setDashboardStats(statsRes);
        setGames(gamesRes);
        setCategories(catsRes);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [PUBLISHER_ID]);

  // --- HANDLERS ---
  
  // [NEW] Hàm chuyển hướng sang trang chi tiết
  const handleViewDetail = (gameId) => {
    navigate(`/product/${gameId}`); 
  };

  const openEditModal = (game) => {
    const info = game.gameBasicInfo || game.gameBasicInfos || game;
    let catId = 1;
    if (game.categoryId) catId = game.categoryId;
    else if (info.category && info.category.id) catId = info.category.id;
    else if (info.categoryId) catId = info.categoryId;

    setEditForm({
      id: game.id,
      name: info.name || "",
      price: info.price !== undefined ? info.price : 0,
      shortDescription: info.shortDescription || "",
      description: info.description || "",
      categoryId: catId,
      trailerUrl: info.trailerUrl || "",
      isFree: info.price === 0,
    });
    setShowModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.warning("Tên game không được bỏ trống");
      return;
    }
    try {
      const payload = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        shortDescription: editForm.shortDescription,
        description: editForm.description,
        categoryId: parseInt(editForm.categoryId),
        trailerUrl: editForm.trailerUrl,
        isFree: editForm.isFree,
      };
      await publisherApi.updateGame(PUBLISHER_ID, editForm.id, payload);
      toast.success("Cập nhật thành công!");
      setShowModal(false);
      const updatedGames = await publisherApi.getGames(PUBLISHER_ID);
      setGames(updatedGames);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Cập nhật thất bại.");
    }
  };

  const filteredGames = games.filter((game) => {
    if (!searchTerm.trim()) return true;
    const gameName = getGameName(game).toLowerCase();
    return gameName.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="text-white p-10 text-center bg-purple-950 h-screen pt-20 text-lg">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen text-white font-sans bg-gradient-to-br from-purple-800 via-purple-700 to-purple-950">

      {/* HEADER */}
      <header className="sticky top-0 z-40 h-16 lg:h-20 flex items-center border-b border-purple-500/40 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 shadow-md">
        <div className="w-full max-w-[1400px] mx-auto px-6 flex justify-between items-center gap-4">
          <h1 className="font-bold text-xl lg:text-2xl shrink-0">Publisher – Quản lý game</h1>
          <div className="flex-1 max-w-md relative hidden md:block">
             <span className="absolute inset-y-0 left-3 flex items-center text-purple-300"> <Search size={20} /> </span>
             <input type="text" placeholder="Tìm kiếm game của bạn..." className="w-full pl-10 pr-4 py-2.5 rounded-full bg-purple-900/50 border border-purple-500/30 text-white placeholder-purple-300/70 outline-none focus:border-pink-500/50 focus:bg-purple-900/80 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full max-w-[1400px] mx-auto px-6 pt-8 pb-16">
        
        {/* THANH TIÊU ĐỀ & NÚT THÊM GAME */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold">Tổng quan & Quản lý</h2>
          <button onClick={() => navigate("/publisher/upload")} className="rounded-xl px-5 py-3 text-base font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg hover:brightness-110 transition-all flex items-center">
            <i className="bi bi-plus-lg mr-2 text-lg" /> Đăng tải game mới
          </button>
        </div>

        {/* MOBILE SEARCH */}
        <div className="mb-6 relative md:hidden">
             <span className="absolute inset-y-0 left-3 flex items-center text-purple-300"> <Search size={20} /> </span>
             <input type="text" placeholder="Tìm kiếm game..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/50 border border-purple-500/30 text-white placeholder-purple-300/70 outline-none focus:border-pink-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* --- GRID LAYOUT CHÍNH (2 CỘT) --- */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI (LỚN): DANH SÁCH GAME */}
          <div className="flex-1 w-full flex flex-col gap-8 order-2 lg:order-1">
            
            <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-xl font-bold">Danh sách game ({filteredGames.length})</h5>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredGames.map((game) => (
                  <div key={game.id} className="rounded-2xl border border-purple-500/40 bg-purple-900/40 p-5 shadow-lg hover:-translate-y-1 transition-all group">
                    <div className="flex items-start mb-4">
                      {/* [UPDATE] Thêm onClick cho ảnh */}
                      <img 
                        src={getGameInfo(game, "thumbnail") || "https://placehold.co/100x75"} 
                        alt={getGameName(game)} 
                        className="h-[75px] w-[100px] rounded-lg mr-4 object-cover shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => handleViewDetail(game.id)}
                      />
                      <div className="flex-1">
                        {/* [UPDATE] Thêm onClick cho tên game */}
                        <h6 
                            className="text-base lg:text-lg font-bold leading-tight line-clamp-2 mb-1 cursor-pointer hover:text-pink-400 transition-colors"
                            onClick={() => handleViewDetail(game.id)}
                        >
                            {getGameName(game)}
                        </h6>
                        <small className="text-sm text-purple-200/80 block">Giá: <span className="text-pink-300 font-semibold">{getGamePrice(game) === 0 ? "Miễn phí" : formatGCoin(getGamePrice(game))}</span></small>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {renderGameStatus(game)}
                      <div className="flex items-center gap-3">
                        {/* [UPDATE] Nút Xem chi tiết (Mắt) */}
                        <button 
                            onClick={() => handleViewDetail(game.id)} 
                            className="h-9 w-9 rounded-lg border border-white/30 bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors" 
                            title="Xem trang chi tiết"
                        >
                            <Eye size={18} />
                        </button>

                        <button 
                            onClick={() => openEditModal(game)} 
                            className="h-9 w-9 rounded-lg border border-white/30 bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors" 
                            title="Chỉnh sửa"
                        >
                            <Pencil size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredGames.length === 0 && <div className="col-span-full text-center p-8 text-white/60 text-lg italic border border-dashed border-purple-500/30 rounded-xl">{searchTerm ? "Không tìm thấy game nào phù hợp." : "Chưa có game nào."}</div>}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (NHỎ): THỐNG KÊ TỔNG HỢP - STICKY */}
          <div className="w-full lg:w-[400px] shrink-0 order-1 lg:order-2">
            <div className="sticky top-24 space-y-6">
                <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 p-6 shadow-xl backdrop-blur-xl">
                    <h5 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Wallet className="text-pink-400" /> Thống kê hiệu suất
                    </h5>
                    
                    <div className="flex flex-col gap-4">
                        {/* Box Doanh thu tháng */}
                        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/60 p-5 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={48} /></div>
                            <p className="text-sm text-purple-300 font-medium mb-1">Doanh thu tháng này</p>
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                                {formatGCoin(dashboardStats?.monthlyRevenue)}
                            </h3>
                        </div>

                        {/* Box Tổng doanh thu */}
                        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/60 p-5 shadow-lg relative overflow-hidden group">
                            <p className="text-sm text-purple-300 font-medium mb-1">Tổng doanh thu</p>
                            <h3 className="text-3xl font-bold text-white">
                                {formatGCoin(dashboardStats?.totalRevenue)}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {/* Box Lượt tải */}
                            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4 text-center hover:bg-purple-900/50 transition-colors">
                                <Download className="mx-auto mb-2 text-pink-400" size={24} />
                                <h4 className="text-xl font-bold text-white">{formatNumber(dashboardStats?.monthlyDownloads)}</h4>
                                <p className="text-xs text-purple-300">Lượt tải tháng</p>
                            </div>

                            {/* Box Đánh giá TB */}
                            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4 text-center hover:bg-purple-900/50 transition-colors">
                                <Star className="mx-auto mb-2 text-yellow-400" size={24} />
                                <h4 className="text-xl font-bold text-white flex items-center justify-center gap-1">
                                    {dashboardStats?.averageRating || 0}
                                </h4>
                                <p className="text-xs text-purple-300">Điểm đánh giá</p>
                            </div>

                            {/* Box Tổng đánh giá */}
                            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-4 text-center col-span-2 hover:bg-purple-900/50 transition-colors flex items-center justify-between px-6">
                                <div className="text-left">
                                    <h4 className="text-xl font-bold text-white">{formatNumber(dashboardStats?.totalRatings)}</h4>
                                    <p className="text-xs text-purple-300">Tổng lượt đánh giá</p>
                                </div>
                                <MessageSquare className="text-purple-400" size={28} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- MODAL (PORTAL) --- */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-400/40 bg-[#1a0b2e] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6">
              <h5 className="text-2xl font-bold text-white">Cập nhật thông tin game</h5>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="mt-4">
              <form className="grid gap-6 text-white text-base md:grid-cols-2">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Tên game</label>
                  <input className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all" type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Giá (GCoin)</label>
                  <input className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" type="number" value={editForm.price} disabled={editForm.isFree} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Mô tả ngắn</label>
                  <textarea rows={4} className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all resize-none" value={editForm.shortDescription} onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })} />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Thể loại</label>
                  <select className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all appearance-none" value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}>
                    {categories.length > 0 ? ( categories.map(c => ( <option key={c.id} className="bg-purple-900" value={c.id}>{c.name}</option> )) ) : ( <> <option className="bg-purple-900" value="1">Hành động</option> <option className="bg-purple-900" value="2">Nhập vai</option> </> )}
                  </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-semibold mb-2 text-purple-200">Trailer (Youtube URL)</label>
                    <input className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all" value={editForm.trailerUrl} onChange={(e) => setEditForm({ ...editForm, trailerUrl: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 pt-2 p-4 rounded-xl bg-purple-900/30 border border-purple-500/20">
                  <input id="editFree" type="checkbox" className="h-5 w-5 rounded border-purple-500/50 bg-purple-900/50 text-pink-600 focus:ring-pink-500/40 transition-all" checked={editForm.isFree} onChange={(e) => setEditForm({ ...editForm, isFree: e.target.checked, price: e.target.checked ? 0 : editForm.price })} />
                  <label htmlFor="editFree" className="text-base font-medium text-white cursor-pointer select-none">Đặt làm game Miễn phí</label>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-white/30 px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-all">Hủy bỏ</button>
              <button onClick={saveEdit} className="rounded-xl px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg hover:shadow-pink-500/30 hover:brightness-110 transition-all">Lưu thay đổi</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}