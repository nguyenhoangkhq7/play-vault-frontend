// pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Download, ShoppingBag, Gift, CheckCircle, 
  ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Loader2, 
  Play, Gamepad2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "../../store/CartContext";
import { useUser } from "../../store/UserContext";

// 🔥 Import cả 2 API
import { api } from "../../api/authApi"; 
import adminGamesApi from "../../api/adminGames"; 

import GameReviews from "../review/GameReview";
import SystemCompatibilityChecker from "../SystemCompatibilityChecker";
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

  // --- 1. HÀM HELPER XỬ LÝ MEDIA ---
  const getVideoInfo = (url) => {
    if (!url) return { type: null, src: null };
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(youtubeRegex);
    if (ytMatch && ytMatch[1]) {
      return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}`, original: url };
    }
    if (url.match(/\.(mp4|webm|ogg)$/i) || !url.startsWith('http')) {
        const src = url.startsWith('http') ? url : `http://localhost:8080/uploads/${url}`;
        return { type: 'file', src: src };
    }
    return { type: 'iframe', src: url };
  };

  const getImageUrl = (imgData) => {
    if (!imgData) return "https://via.placeholder.com/600x400?text=No+Image";
    const url = typeof imgData === 'object' ? imgData.url : imgData;
    if (url.startsWith("http")) return url;
    return `http://localhost:8080/uploads/${url}`; 
  };

  // --- 2. FETCH DATA (KẾT HỢP 2 API) ---
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);

        // BƯỚC 1: Gọi API User để lấy isOwned (Quan trọng nhất)
        const userApiPromise = api.get(`/api/games/${id}`, {
             headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        // BƯỚC 2: Gọi API Admin để lấy Trailer (Bắt lỗi riêng để không chặn trang web nếu API này lỗi)
        const adminApiPromise = adminGamesApi.getGameDetail(id).catch(err => {
            console.warn("Không lấy được trailer từ Admin API:", err);
            return null; // Trả về null nếu lỗi để code không crash
        });

        // Chạy song song 2 request cho nhanh
        const [userRes, adminRes] = await Promise.all([userApiPromise, adminApiPromise]);
        
        const userData = userRes.data || userRes;
        const adminData = adminRes ? (adminRes.data || adminRes) : {};

        console.log("🔥 User Data (Ownership):", userData);
        console.log("🔥 Admin Data (Trailer):", adminData);

        // BƯỚC 3: Gộp dữ liệu (Ưu tiên User Data, bổ sung Trailer từ Admin Data)
        const mergedGameData = {
            ...userData,
            // Lấy trailer từ Admin API đắp vào
            trailerUrl: adminData.trailerUrl || adminData.videoUrl || userData.trailerUrl || "",
            // Lấy thêm các info khác nếu User API thiếu (ví dụ ageRating)
            ageRating: userData.ageRating || adminData.ageRating || "12"
        };
        
        setGame(mergedGameData);
        setIsOwnedState(userData.isOwned === true);

      } catch (error) {
        console.error("Lỗi tải chi tiết game:", error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    const handlePurchaseSuccess = () => {
      fetchDetail();
    };

    window.addEventListener('purchasedGamesUpdated', handlePurchaseSuccess);
    return () => {
      window.removeEventListener('purchasedGamesUpdated', handlePurchaseSuccess);
    };
  }, [id, accessToken]);

  // --- 3. CHECK WISHLIST ---
  useEffect(() => {
    let isMounted = true;
    const checkFavoriteStatus = async () => {
      if (user && accessToken && game?.id) {
        try {
          const myWishlist = await getWishlist();
          if (isMounted && Array.isArray(myWishlist)) {
            const found = myWishlist.some(item => {
               const itemId = item.gameId || (item.game && item.game.id);
               return String(itemId) === String(game.id);
            });
            setIsFavorite(found);
          }
        } catch (error) {
          console.error("Lỗi check wishlist:", error);
        }
      }
    };
    checkFavoriteStatus();
    return () => { isMounted = false; };
  }, [user, game, accessToken]);

  // --- 4. CHECK CART ---
  useEffect(() => {
    if (game && cart && Array.isArray(cart.items)) {
      const inCart = cart.items.some((item) => {
        const itemGameId = item.gameId || item.game?.id;
        return String(itemGameId) === String(game.id);
      });
      setIsInCart(inCart);
    }
  }, [cart, game]);

  // Auto switch tab
  useEffect(() => {
    if (isOwned) {
      setActiveTab("download");
    }
  }, [isOwned]);

  // --- VARIABLES ---
  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";
  
  const slides = game
    ? [
        { id: 0, image: getImageUrl(game.thumbnail) },
        ...(game.previewImages || []).map((img, idx) => ({ id: idx + 1, image: getImageUrl(img) }))
      ]
    : [];
  const displaySlides = slides.length > 0 ? slides : [{ id: 1, image: fallbackImage }];

  const gbi = game?.gameBasicInfo || game?.gameBasicInfos || game?.basicInfo || game;
  const controllerSupport = game?.controllerSupport || gbi?.controllerSupport || "Có";
  
  // 🔥 Lấy Trailer từ biến đã merge (ưu tiên Admin API)
  const rawVideoUrl = game?.trailerUrl || game?.videoUrl || "";
  const videoData = getVideoInfo(rawVideoUrl);
  
  const ageRating = game?.ageRating || game?.requiredAge || "12";

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);

  // --- HANDLERS (Giữ nguyên) ---
  const handleAddToCart = async () => {
    if (!user || !accessToken) {
      toast.warning("Vui lòng đăng nhập để mua game.");
      navigate("/login");
      return;
    }
    if (isOwned) {
      toast.error("Game đã được mua!");
      return;
    }
    if (isInCart) {
      toast.error("Game này đã có trong giỏ hàng rồi!");
      return;
    }

    try {
      const updatedCart = await addToCart(game.id, user, accessToken);
      if (updatedCart) {
        toast.success("Đã thêm vào giỏ hàng!");
        setIsInCart(true);
      }
    } catch (error) {
      console.error("Thêm game thất bại:", error);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !accessToken) {
      toast.warning("Vui lòng đăng nhập để mua game.");
      navigate("/login");
      return;
    }
    if (isOwned) {
      toast.error("Game đã được mua!");
      return;
    }

    if (game.price === 0) {
      try {
        await api.post("/api/orders/free", { gameId: game.id }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        toast.success("Đã thêm vào thư viện của bạn!");
        setIsOwnedState(true);
        window.dispatchEvent(new Event("purchasedGamesUpdated"));
      } catch (error) {
        console.error("Lỗi mua game miễn phí:", error);
        toast.error("Lỗi xử lý yêu cầu.");
      }
    } else {
      try {
        const updatedCart = await addToCart(game.id, user, accessToken);
        if (updatedCart) {
          toast.success("Đã thêm vào giỏ hàng!");
          setIsInCart(true);
          navigate("/cart");
        }
      } catch (error) {
        console.error("Lỗi handleBuyNow:", error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
        toast.warning("Vui lòng đăng nhập.");
        navigate("/login");
        return;
    }
    try {
        if (isFavorite) {
            await updateWishlist(game.id);
            setIsFavorite(false);
            toast.info("Đã xóa khỏi yêu thích 💔");
        } else {
            try {
                await createWishlist(game.id);
                setIsFavorite(true);
                toast.success("Đã thêm vào yêu thích ❤️");
            } catch (err) {
                setIsFavorite(true);
                toast.success("Đã có trong danh sách yêu thích");
            }
        }
    } catch (error) {
        toast.error("Lỗi cập nhật yêu thích");
    }
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 flex justify-center items-center text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Đang tải dữ liệu...
      </div>
    );

  if (!game)
    return (
      <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">
        Không tìm thấy thông tin game. <Link to="/products" className="ml-2 text-pink-400 underline">Quay lại</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- CỘT TRÁI (CONTENT) --- */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-6">{game.name}</h1>

            <div className="relative bg-purple-950 rounded-xl overflow-hidden mb-6 shadow-lg h-[400px] group">
              <div className="absolute top-4 right-4 z-20 bg-red-600/90 border-2 border-white text-white font-extrabold w-12 h-12 flex items-center justify-center rounded-lg shadow-lg text-lg backdrop-blur-sm pointer-events-none">
                 {ageRating}+
              </div>

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={displaySlides[currentSlide]?.image || fallbackImage}
                  alt={`Screenshot ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
              </AnimatePresence>
              
              {displaySlides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100">
                        <ChevronRight size={24} />
                    </button>
                </>
              )}
            </div>

            {/* TABS */}
            <div className="border-b border-purple-700 mb-6">
              <div className="flex gap-4 flex-wrap">
                {[
                    { id: "about", label: "Giới thiệu" },
                    { id: "requirements", label: "Cấu hình" },
                    { id: "reviews", label: `Đánh giá (${game.reviewCount || 0})` },
                    { id: "trailer", label: "Trailer", icon: <Play className="w-4 h-4 inline mb-1 mr-1"/> },
                    { id: "download", label: "Tải xuống" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 font-semibold rounded-t-md transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-pink-500 text-white shadow-md"
                        : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                {activeTab === "about" && (
                  <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-purple-100 leading-relaxed whitespace-pre-line">
                    <h3 className="text-2xl font-bold text-white mb-4">Về trò chơi này</h3>
                    <p>{game.description || "Chưa có mô tả chi tiết."}</p>
                  </motion.div>
                )}

                {activeTab === "requirements" && (
                  <motion.div key="requirements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">Cấu hình yêu cầu</h3>
                      <div className="bg-purple-900/50 p-6 rounded-xl border border-purple-700">
                        <ul className="space-y-3 text-sm text-purple-200">
                          <li><strong className="text-white">Hệ điều hành:</strong> {game.os || "Windows 10"}</li>
                          <li><strong className="text-white">CPU:</strong> {game.cpu || "Core i3"}</li>
                          <li><strong className="text-white">RAM:</strong> {game.ram || "8 GB"}</li>
                          <li><strong className="text-white">Card đồ họa:</strong> {game.gpu || "GTX 1050"}</li>
                          <li><strong className="text-white">Dung lượng:</strong> {game.storage || "50 GB"}</li>
                          <li className="flex items-center gap-2 pt-2 border-t border-purple-800 mt-2">
                             <Gamepad2 className="w-4 h-4 text-purple-400" />
                             <strong className="text-white">Hỗ trợ tay cầm:</strong> 
                             <span className="text-emerald-400 font-medium">{controllerSupport}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-purple-700">
                      <SystemCompatibilityChecker gameId={game.id} gameName={game.name} />
                    </div>
                  </motion.div>
                )}
                
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
                            </>
                        ) : (
                            <div className="bg-purple-900/20 p-8 text-center rounded-xl border border-dashed border-purple-700 text-purple-300">
                                <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Chưa có trailer cho game này.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GameReviews gameId={game.id} isOwned={isOwned} accessToken={accessToken} userId={user?.id} />
                  </motion.div>
                )}

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
                        <a href={game.filePath} target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-10 py-5 rounded-full transition-all transform hover:scale-105 shadow-2xl" download>
                          <Download className="inline-block w-6 h-6 mr-2" /> Download Full Speed
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-purple-950/50 p-6 rounded-xl border border-purple-700 space-y-3 text-sm text-purple-200">
              <div className="flex justify-between">
                <span>Nhà phát hành:</span> <span className="font-semibold text-white">{game.publisherName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày phát hành:</span> <span className="font-semibold text-white">{game.releaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Thể loại:</span> <span className="font-semibold text-white">{game.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span>Giá:</span> <span className="font-bold text-lg text-pink-400">{game.price > 0 ? `${game.price.toLocaleString()} GCoin` : "Miễn Phí"}</span>
              </div>
              
              <div className="pt-4 mt-2 border-t border-purple-700/50">
                <p className="text-purple-300 text-xs leading-relaxed italic line-clamp-4">
                    {game.shortDescription || (game.description ? game.description.substring(0, 150) + "..." : "Trải nghiệm ngay tựa game hấp dẫn này.")}
                </p>
              </div>
            </div>

            {/* Trạng thái Game */}
            <div className="space-y-4 pt-6 border-t border-purple-700/50">
              {isOwned ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600/20 via-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/60 backdrop-blur-sm p-6 text-center shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">🎮✅</div>
                    <p className="text-emerald-300 text-lg font-bold tracking-wide">Bạn đã sở hữu</p>
                    <p className="text-emerald-400 text-sm mt-1 opacity-90">Game đã có trong thư viện của bạn</p>
                  </div>
                </motion.div>
              ) : isInCart ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-500/20 to-yellow-600/20 border-2 border-amber-500/60 backdrop-blur-sm p-6 text-center shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">🛒✨</div>
                    <p className="text-amber-300 text-lg font-bold tracking-wide">Đã có trong giỏ hàng</p>
                    <p className="text-amber-400 text-sm mt-1 opacity-90">Sẵn sàng thanh toán khi bạn muốn</p>
                  </div>
                </motion.div>
              ) : null}

              {/* Nút hành động */}
              <div className="space-y-3">
                {!isOwned && !isInCart && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    {game.price === 0 ? (
                      <>
                        <Gift className="w-6 h-6" />
                        Nhận miễn phí ngay
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-6 h-6" />
                        {`Mua ngay • ${game.price.toLocaleString()} đ`}
                      </>
                    )}
                  </button>
                )}

                {isOwned && (
                  <button
                    onClick={() => setActiveTab("download")}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <Download className="w-6 h-6" />
                    Tải xuống ngay
                  </button>
                )}

                {!isOwned && !isInCart && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border-2 border-purple-400/60 text-white font-semibold text-lg py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group hover:border-purple-300/80"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Thêm vào giỏ hàng
                  </button>
                )}

                {!isOwned && isInCart && (
                  <button
                    onClick={handleGoToCart}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-lg py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Xem giỏ hàng
                  </button>
                )}

                {/* Nút Yêu Thích */}
                <button 
                  onClick={handleToggleFavorite}
                  className={`w-full bg-transparent font-semibold text-lg py-3 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 group
                    ${isFavorite 
                      ? "border-pink-500 text-pink-400 hover:border-pink-400" 
                      : "border-purple-500/60 text-purple-300 hover:text-pink-400 hover:border-pink-500/80"
                    }
                  `}
                >
                  <Heart className={`w-6 h-6 transition-all ${isFavorite ? "fill-pink-500 text-pink-500" : ""}`} />
                  {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}