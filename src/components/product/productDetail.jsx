// pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Download, ShoppingBag, Gift, CheckCircle, 
  ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Loader2, Play, Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "../../store/CartContext";
import { useUser } from "../../store/UserContext";
import { api } from "../../api/authApi"; // API thường (để mua hàng)
import adminGamesApi from "../../api/adminGames"; // API Admin (để lấy chi tiết full)
import GameReviews from "../review/GameReview";
import SystemCompatibilityChecker from "../SystemCompatibilityChecker";

// Import API Wishlist
import { getWishlist, createWishlist, updateWishlist } from "../../api/wishlist";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user, accessToken } = useUser();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwned, setIsOwnedState] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // UI
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  // --- 1. HÀM XỬ LÝ VIDEO ---
  const getVideoInfo = (url) => {
    if (!url) return { type: null, src: null };

    // A. Link YouTube (Regex mạnh bắt mọi dạng link)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(youtubeRegex);

    if (ytMatch && ytMatch[1]) {
      return { 
        type: 'youtube', 
        src: `https://www.youtube.com/embed/${ytMatch[1]}`,
        original: url 
      };
    }

    // B. File Upload (mp4, webm...)
    if (url.match(/\.(mp4|webm|ogg)$/i) || !url.startsWith('http')) {
        const src = url.startsWith('http') ? url : `http://localhost:8080/uploads/${url}`;
        return { type: 'file', src: src };
    }

    // C. Mặc định
    return { type: 'iframe', src: url };
  };

  // --- 2. HÀM XỬ LÝ ẢNH ---
  const getImageUrl = (imgData) => {
    if (!imgData) return "https://via.placeholder.com/600x400?text=No+Image";
    let url = typeof imgData === 'object' ? imgData.url : imgData;
    if (!url) return "https://via.placeholder.com/600x400?text=No+Image";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `http://localhost:8080/uploads/${url}`; 
  };

  // --- 3. FETCH DATA ---
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Dùng API Admin để lấy full thông tin (bao gồm trailer, tuổi...)
        const response = await adminGamesApi.getGameDetail(id);
        const data = response.data || response;
        
        console.log("🔥 Game Data:", data); // Log kiểm tra
        setGame(data);
        setIsOwnedState(data.isOwned === true);
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    const handlePurchaseSuccess = () => fetchDetail();
    window.addEventListener('purchasedGamesUpdated', handlePurchaseSuccess);
    return () => window.removeEventListener('purchasedGamesUpdated', handlePurchaseSuccess);
  }, [id]);

  // Check Cart Status
  useEffect(() => {
    if (game && cart?.items) {
      setIsInCart(cart.items.some((item) => item.gameId === game.id));
    }
  }, [cart, game]);

  // Check Wishlist Status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // Chỉ check khi đã có user và game id
      if (user && game?.id) {
        try {
          // 1. Lấy danh sách wishlist
          const myWishlist = await getWishlist();
          
          // 2. Log ra để kiểm tra cấu trúc (Quan trọng!)
          console.log("Danh sách yêu thích:", myWishlist);
          console.log("ID Game hiện tại:", game.id);

          // 3. Kiểm tra kỹ lưỡng mọi trường hợp
          const found = Array.isArray(myWishlist) && myWishlist.some(item => {
              // Case A: item có chứa object game
              if (item.game && item.game.id === game.id) return true;
              // Case B: item có trường gameId trực tiếp
              if (item.gameId === game.id) return true;
              // Case C: item chính là gameId (nếu API trả về mảng ID)
              if (item === game.id) return true;
              
              return false;
          });

          console.log("Kết quả check favorite:", found);
          setIsFavorite(found); // Set state đúng
        } catch (error) {
          console.error("Lỗi wishlist:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [user, game]); // Chạy lại khi game load xong
  // Auto switch tab if owned
  useEffect(() => {
    if (isOwned) setActiveTab("download");
  }, [isOwned]);

  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";

  // --- MAPPING VARIABLES ---
  const gbi = game?.gameBasicInfo || game?.gameBasicInfos || game?.basicInfo || game;

  const controllerSupport = game?.controllerSupport || gbi?.controllerSupport || "Có";
  // Lấy Trailer (Ưu tiên các trường từ Admin API)
  const rawVideoUrl = game?.trailerUrl || game?.videoUrl || gbi?.trailerUrl || gbi?.videoUrl || "";
  const videoData = getVideoInfo(rawVideoUrl);

  // Lấy Tuổi Yêu Cầu
  const ageRating = game?.requiredAge || game?.ageRating || gbi?.requiredAge || gbi?.ageRating || "12";

  const title = gbi?.name || game?.name || "No Title";
  const publisher = gbi?.publisherName || gbi?.publisher?.studioName || "Unknown Publisher";
  const description = gbi?.description || game?.description || "Chưa có mô tả.";
  const price = gbi?.price ?? game?.price ?? 0;
  
  const slides = game
    ? [{ id: 0, image: getImageUrl(gbi?.thumbnail || game?.thumbnail) }, ...(game?.previewImages || []).map((img, index) => ({ id: index + 1, image: getImageUrl(img) }))]
    : [];
  const displaySlides = slides.length > 0 ? slides : [{ id: 1, image: fallbackImage }];

  const genres = Array.isArray(gbi?.category) ? gbi.category : [gbi?.categoryName || gbi?.category || "General"];
  const reqs = gbi?.systemRequirement || game?.systemRequirements || {};

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);

  // --- HANDLERS ---
  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    if (isOwned) return toast.error("Bạn đã sở hữu game này!");
    if (isInCart && !window.confirm("Game đã có trong giỏ. Thêm lần nữa?")) return;

    const updated = await addToCart(game.id, user, accessToken);
    if (updated) { toast.success("Đã thêm vào giỏ hàng!"); setIsInCart(true); }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    if (isOwned) return toast.error("Bạn đã sở hữu game này!");

    if (price === 0) {
      try {
        await api.post("/api/orders/free", { gameId: game.id }, { headers: { Authorization: `Bearer ${accessToken}` } });
        toast.success("Đã nhận game miễn phí!");
        setIsOwnedState(true);
        window.dispatchEvent(new Event("purchasedGamesUpdated"));
      } catch { toast.error("Lỗi nhận game miễn phí"); }
    } else {
      const updated = await addToCart(game.id, user, accessToken);
      if (updated) { setIsInCart(true); navigate("/cart"); }
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return navigate("/login");
    
    try {
        if (isFavorite) {
            // Đang thích -> Muốn xóa
            await updateWishlist(game.id);
            setIsFavorite(false);
            toast.info("Đã xóa khỏi yêu thích 💔");
        } else {
            // Chưa thích -> Muốn thêm
            try {
                await createWishlist(game.id);
                setIsFavorite(true);
                toast.success("Đã thêm vào yêu thích ❤️");
            } catch (addError) {
                // Nếu lỗi do đã tồn tại (Backend trả về 409 hoặc 500)
                // Thì ta coi như là đã thích rồi -> chuyển state thành true
                console.warn("Lỗi thêm wishlist (có thể do đã tồn tại):", addError);
                setIsFavorite(true); 
                toast.success("Đã có trong danh sách yêu thích");
            }
        }
    } catch (error) {
        toast.error("Lỗi cập nhật yêu thích");
    }
  };

  const handleGoToCart = () => navigate("/cart");

  if (loading) return <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white"><Loader2 className="animate-spin mr-2" /> Đang tải...</div>;
  if (!game) return <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">Không tìm thấy game.</div>;

  const canPurchase = !user || user.role === "CUSTOMER"; 

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-6">{title}</h1>

            {/* Slide Ảnh */}
            <div className="relative bg-purple-950 rounded-xl overflow-hidden mb-6 shadow-lg h-[400px] group">
              {/* Rating Age Badge */}
              {ageRating && (
                <div className="absolute top-4 right-4 z-20 bg-red-600/90 border-2 border-white text-white font-extrabold w-12 h-12 flex items-center justify-center rounded-lg shadow-lg text-lg backdrop-blur-sm pointer-events-none">
                  {ageRating}+
                </div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={displaySlides[currentSlide]?.image}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
              </AnimatePresence>
              
              {displaySlides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-white/20 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-white/20 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
                </>
              )}
            </div>

            {/* --- THANH TAB --- */}
            <div className="border-b border-purple-700 mb-6">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setActiveTab("about")} className={`px-5 py-3 font-semibold rounded-t-md transition-all ${activeTab === "about" ? "bg-pink-500 text-white shadow-md" : "text-purple-300 hover:text-white hover:bg-purple-700/50"}`}>Giới thiệu</button>
                <button onClick={() => setActiveTab("requirements")} className={`px-5 py-3 font-semibold rounded-t-md transition-all ${activeTab === "requirements" ? "bg-pink-500 text-white shadow-md" : "text-purple-300 hover:text-white hover:bg-purple-700/50"}`}>Cấu hình</button>
                <button onClick={() => setActiveTab("reviews")} className={`px-5 py-3 font-semibold rounded-t-md transition-all ${activeTab === "reviews" ? "bg-pink-500 text-white shadow-md" : "text-purple-300 hover:text-white hover:bg-purple-700/50"}`}>Đánh giá ({game.reviewCount || 0})</button>
                <button onClick={() => setActiveTab("trailer")} className={`px-5 py-3 font-semibold rounded-t-md transition-all flex items-center gap-2 ${activeTab === "trailer" ? "bg-pink-500 text-white shadow-md" : "text-purple-300 hover:text-white hover:bg-purple-700/50"}`}><Play className="w-4 h-4" /> Trailer</button>
                <button onClick={() => setActiveTab("download")} className={`px-5 py-3 font-semibold rounded-t-md transition-all ${activeTab === "download" ? "bg-pink-500 text-white shadow-md" : "text-purple-300 hover:text-white hover:bg-purple-700/50"}`}>Tải xuống</button>
              </div>
            </div>

            {/* NỘI DUNG TAB */}
            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                {activeTab === "about" && (
                  <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-purple-100 leading-relaxed whitespace-pre-line">
                    <h3 className="text-2xl font-bold text-white mb-4">Về trò chơi này</h3>
                    <p>{description}</p>
                  </motion.div>
                )}
                
                {activeTab === "requirements" && (
                  <motion.div key="requirements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Cấu hình yêu cầu</h3>
                      <div className="bg-purple-950/50 p-6 rounded-xl border border-purple-700 text-sm text-purple-200">
                        <ul className="space-y-3">
                          <li><strong className="text-white">OS:</strong> {game.os || reqs.os || "Windows 10"}</li>
                          <li><strong className="text-white">CPU:</strong> {game.cpu || reqs.processor || reqs.cpu || "Core i3"}</li>
                          <li><strong className="text-white">RAM:</strong> {game.ram || reqs.memory || reqs.ram || "8 GB"}</li>
                          <li><strong className="text-white">GPU:</strong> {game.gpu || reqs.graphics || reqs.gpu || "GTX 1050"}</li>
                          <li><strong className="text-white">Dung lượng:</strong> {game.storage || reqs.storage || "50 GB"}</li>
                          <li className="flex items-center gap-2 pt-2 border-t border-purple-800 mt-2">
                              <Gamepad2 className="w-4 h-4 text-purple-400" />
                              <strong className="text-white">Hỗ trợ tay cầm:</strong> 
                              <span className="text-emerald-400 font-medium">{controllerSupport}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-purple-700">
                      <SystemCompatibilityChecker gameId={game.id} gameName={title} />
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GameReviews gameId={game.id} isOwned={isOwned} accessToken={accessToken} userId={user?.id} />
                  </motion.div>
                )}

                {/* TAB TRAILER */}
                {activeTab === "trailer" && (
                    <motion.div key="trailer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-4">Trailer Game</h3>
                        {videoData.src ? (
                            <>
                                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-purple-700 shadow-2xl">
                                    {videoData.type === 'youtube' ? (
                                        <iframe src={videoData.src} title="Game Trailer" allowFullScreen className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
                                    ) : videoData.type === 'file' ? (
                                        <video src={videoData.src} controls className="w-full h-full object-contain" poster={getImageUrl(gbi?.thumbnail || game.thumbnail)}>Trình duyệt không hỗ trợ thẻ video.</video>
                                    ) : (
                                        <iframe src={videoData.src} className="w-full h-full" allowFullScreen />
                                    )}
                                </div>
                                {videoData.type === 'youtube' && (
                                    <p className="text-right text-sm text-purple-400 italic">
                                        <a href={videoData.original} target="_blank" rel="noreferrer" className="hover:text-white underline">Xem trên YouTube &rarr;</a>
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="bg-purple-900/20 p-8 text-center rounded-xl border border-dashed border-purple-700 text-purple-300">
                                <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Chưa có trailer cho game này.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB DOWNLOAD */}
                {activeTab === "download" && (
                  <motion.div key="download" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    {!isOwned ? (
                      <div className="text-center py-10 text-purple-200">
                        <p className="text-xl font-bold text-white mb-4">Bạn chưa sở hữu game này</p>
                        <p className="text-sm text-purple-300 mb-6">Vui lòng mua game để tải xuống</p>
                        <button onClick={handleBuyNow} className="bg-purple-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-purple-600 transition">Mua ngay để tải xuống</button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-2xl p-8 text-center">
                        <p className="text-green-400 text-lg mb-6">Chúc mừng! Bạn đã sở hữu game này</p>
                        <a href={game.filePath} target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-10 py-5 rounded-full transition-all hover:scale-105 shadow-2xl" download>
                          <Download className="inline-block w-6 h-6 mr-2" /> Download Full Speed
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CỘT PHẢI: SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-purple-950/50 p-6 rounded-xl border border-purple-700 space-y-3 text-sm text-purple-200">
              <div className="flex justify-between"><span>Nhà phát hành:</span> <span className="font-semibold text-white">{publisher}</span></div>
              <div className="flex justify-between"><span>Ngày phát hành:</span> <span className="font-semibold text-white">{game.releaseDate || "N/A"}</span></div>
              <div className="flex justify-between"><span>Thể loại:</span> <span className="font-semibold text-white">{game.categoryName || genres[0] || "General"}</span></div>
              <div className="flex justify-between items-center"><span>Giá:</span> <span className="font-bold text-2xl text-pink-400">{price > 0 ? `${price.toLocaleString()} GCoin` : "Miễn Phí"}</span></div>
              <div className="pt-4 mt-2 border-t border-purple-700/50"><p className="text-purple-300 text-sm leading-relaxed italic line-clamp-4">{game.shortDescription || (description ? description.substring(0, 150) + "..." : "Trải nghiệm ngay tựa game hấp dẫn này.")}</p></div>
            </div>

            <div className="space-y-4 pt-6 border-t border-purple-700/50">
              {isOwned ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 p-6 text-center shadow-xl">
                    <div className="text-4xl mb-3">🎮✅</div>
                    <p className="text-emerald-300 text-lg font-bold">Đã sở hữu</p>
                    <button onClick={() => setActiveTab("download")} className="mt-5 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full shadow-lg w-full flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Tải xuống ngay</button>
                </motion.div>
              ) : (
                canPurchase && (
                    <>
                        {isInCart && <div className="rounded-2xl bg-amber-600/20 border border-amber-500/50 p-4 text-center mb-3"><p className="text-amber-300 font-bold mb-2">🛒 Đã có trong giỏ hàng</p><button onClick={handleGoToCart} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-full text-sm">Xem giỏ hàng</button></div>}
                        <button onClick={handleBuyNow} className="w-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-lg py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3">{price === 0 ? <><Gift /> Nhận miễn phí</> : <><ShoppingBag /> Mua ngay</>}</button>
                        <button onClick={handleAddToCart} className="w-full bg-white/10 hover:bg-white/20 border border-purple-500/50 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3"><ShoppingCart /> {isInCart ? "Thêm lần nữa" : "Thêm vào giỏ hàng"}</button>
                    </>
                )
              )}
              
              {/* NÚT YÊU THÍCH - ĐÃ GẮN HÀM XỬ LÝ */}
              {canPurchase && (
                  <button 
                    onClick={handleToggleFavorite}
                    className={`w-full bg-transparent hover:bg-white/10 font-semibold py-4 rounded-2xl border border-purple-500/50 flex items-center justify-center gap-3 group transition-all ${isFavorite ? "text-pink-500 border-pink-500" : "text-purple-300 hover:text-white"}`}
                  >
                      <Heart className={`transition-all ${isFavorite ? "fill-pink-500 text-pink-500" : "group-hover:text-pink-500 group-hover:fill-pink-500"}`} /> 
                      {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                  </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}