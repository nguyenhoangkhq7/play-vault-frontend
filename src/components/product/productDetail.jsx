// pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Download,
  ShoppingBag,
  Gift,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  Loader2,
  Play,
  Gamepad2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "../../store/CartContext";
import { useUser } from "../../store/UserContext";
import { api } from "../../api/authApi";
import adminGamesApi from "../../api/adminGames";
import GameReviews from "../review/GameReview";
import SystemCompatibilityChecker from "../SystemCompatibilityChecker";
import {
  getWishlist,
  createWishlist,
  updateWishlist,
} from "../../api/wishlist";

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

  // UI State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  // --- 1. UTILS ---
  const getVideoInfo = (url) => {
    if (!url) return { type: null, src: null };
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(youtubeRegex);
    if (ytMatch && ytMatch[1]) {
      return {
        type: "youtube",
        src: `https://www.youtube.com/embed/${ytMatch[1]}`,
        original: url,
      };
    }
    if (url.match(/\.(mp4|webm|ogg)$/i) || !url.startsWith("http")) {
      const src = url.startsWith("http")
        ? url
        : `http://localhost:8080/uploads/${url}`;
      return { type: "file", src: src };
    }
    return { type: "iframe", src: url };
  };

  const getImageUrl = (imgData) => {
    if (!imgData) return "https://via.placeholder.com/600x400?text=No+Image";
    let url = typeof imgData === "object" ? imgData.url : imgData;
    if (!url) return "https://via.placeholder.com/600x400?text=No+Image";
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `http://localhost:8080/uploads/${url}`;
  };

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await adminGamesApi.getGameDetail(id);
        const data = response.data || response;
        console.log("🎮 Game data from API:", data);
        console.log("💰 Price:", data.price);
        console.log("🏷️ Discount:", data.discount);
        console.log("🔍 All keys:", Object.keys(data));
        console.log("🔍 Has promotion?", data.promotion);
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
    window.addEventListener("purchasedGamesUpdated", handlePurchaseSuccess);
    return () =>
      window.removeEventListener(
        "purchasedGamesUpdated",
        handlePurchaseSuccess
      );
  }, [id]);

  // Check Cart
  useEffect(() => {
    if (game && cart?.items) {
      setIsInCart(cart.items.some((item) => item.gameId === game.id));
    }
  }, [cart, game]);

  // Check Wishlist
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && game?.id) {
        try {
          const myWishlist = await getWishlist();
          const found =
            Array.isArray(myWishlist) &&
            myWishlist.some((item) => {
              if (item.game && item.game.id === game.id) return true;
              if (item.gameId === game.id) return true;
              if (item === game.id) return true;
              return false;
            });
          setIsFavorite(found);
        } catch (error) {
          console.error("Lỗi wishlist:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [user, game]);

  // Auto switch tab
  useEffect(() => {
    if (isOwned) setActiveTab("download");
  }, [isOwned]);

  // --- 3. LOGIC HANDLERS ---

  // Khai báo biến cần thiết trước khi dùng trong handler
  const gbi =
    game?.gameBasicInfo || game?.gameBasicInfos || game?.basicInfo || game;
  const price = gbi?.price ?? game?.price ?? 0;
  const discount = game?.discount ?? 0; // Lấy discount từ API response
  
  // Debug log
  console.log("📊 Render values:", { price, discount, hasDiscount: discount > 0 });

  // --- HANDLE WISHLIST ---
  const handleToggleFavorite = async () => {
    if (!user) return navigate("/login");

    try {
      if (isFavorite) {
        // Nếu API update dùng để xóa
        await updateWishlist(game.id);
        setIsFavorite(false);
        toast.info("Đã xóa khỏi yêu thích 💔");
      } else {
        // Thêm mới
        await createWishlist(game.id);
        setIsFavorite(true);
        toast.success("Đã thêm vào yêu thích ❤️");
      }
    } catch (error) {
      // Xử lý trường hợp API trả lỗi nhưng thực tế là đã có trong DB (optional)
      console.error("Lỗi wishlist:", error);
      toast.error("Không thể cập nhật trạng thái yêu thích");
    }
  };

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    if (isOwned) return toast.error("Bạn đã sở hữu game này!");

    // Nếu đã có trong giỏ hàng thì cảnh báo
    if (isInCart) {
      toast.info("Game này đã có trong giỏ hàng rồi.");
      return;
    }

    const updated = await addToCart(game.id, user, accessToken);
    if (updated) {
      toast.success("Đã thêm vào giỏ hàng!");
      setIsInCart(true);
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    if (isOwned) return toast.error("Bạn đã sở hữu game này!");

    if (price === 0) {
      try {
        await api.post(
          "/api/orders/free",
          { gameId: game.id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        toast.success("Đã nhận game miễn phí!");
        setIsOwnedState(true);
        window.dispatchEvent(new Event("purchasedGamesUpdated"));
      } catch {
        toast.error("Lỗi nhận game miễn phí");
      }
    } else {
      // Nếu chưa có trong giỏ thì thêm vào, sau đó chuyển hướng
      if (!isInCart) {
        await addToCart(game.id, user, accessToken);
      }
      navigate("/cart");
    }
  };

  const handleGoToCart = () => navigate("/cart");

  // --- RENDERING ---
  if (loading)
    return (
      <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">
        <Loader2 className="animate-spin mr-2" /> Đang tải...
      </div>
    );
  if (!game)
    return (
      <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">
        Không tìm thấy game.
      </div>
    );

  // --- 4. PREPARE DISPLAY VARIABLES (SỬA LỖI UNDEFINED) ---
  const title = gbi?.title || game.title || "Unknown Title";
  const description = gbi?.description || game.description || "Chưa có mô tả.";
  const publisher = game.publisherName || "Unknown Publisher";
  const controllerSupport =
    game.controllerSupport || gbi?.controllerSupport || "Có";
  const rawVideoUrl =
    game.trailerUrl || game.videoUrl || gbi?.trailerUrl || gbi?.videoUrl || "";
  const videoData = getVideoInfo(rawVideoUrl);
  const ageRating =
    game.requiredAge ||
    game.ageRating ||
    gbi?.requiredAge ||
    gbi?.ageRating ||
    "12";
  const reqs = game.minSystemRequirements || {};
  const genres = game.categories
    ? game.categories.map((c) => c.name)
    : ["Action"];
  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";

  // Tạo danh sách ảnh cho slide
  const displaySlides = [
    { image: getImageUrl(gbi?.thumbnail || game.thumbnail) },
    ...(game.images || []).map((img) => ({ image: getImageUrl(img) })),
  ];

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + displaySlides.length) % displaySlides.length
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: Media & Nội dung */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-6">{title}</h1>

            {/* Slide Ảnh */}
            <div className="relative bg-purple-950 rounded-xl overflow-hidden mb-6 shadow-lg h-[400px] group">
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
              </AnimatePresence>

              {displaySlides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-white/20 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-white/20 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* THANH TAB */}
            <div className="border-b border-purple-700 mb-6">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`px-5 py-3 font-semibold rounded-t-md transition-all ${
                    activeTab === "about"
                      ? "bg-pink-500 text-white shadow-md"
                      : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                  }`}
                >
                  Giới thiệu
                </button>
                <button
                  onClick={() => setActiveTab("requirements")}
                  className={`px-5 py-3 font-semibold rounded-t-md transition-all ${
                    activeTab === "requirements"
                      ? "bg-pink-500 text-white shadow-md"
                      : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                  }`}
                >
                  Cấu hình
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-5 py-3 font-semibold rounded-t-md transition-all ${
                    activeTab === "reviews"
                      ? "bg-pink-500 text-white shadow-md"
                      : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                  }`}
                >
                  Đánh giá ({game.reviewCount || 0})
                </button>
                <button
                  onClick={() => setActiveTab("trailer")}
                  className={`px-5 py-3 font-semibold rounded-t-md transition-all flex items-center gap-2 ${
                    activeTab === "trailer"
                      ? "bg-pink-500 text-white shadow-md"
                      : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                  }`}
                >
                  <Play className="w-4 h-4" /> Trailer
                </button>
                <button
                  onClick={() => setActiveTab("download")}
                  className={`px-5 py-3 font-semibold rounded-t-md transition-all ${
                    activeTab === "download"
                      ? "bg-pink-500 text-white shadow-md"
                      : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                  }`}
                >
                  Tải xuống
                </button>
              </div>
            </div>

            {/* NỘI DUNG TAB */}
            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                {activeTab === "about" && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-purple-100 leading-relaxed whitespace-pre-line"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Về trò chơi này
                    </h3>
                    <p>{description}</p>
                  </motion.div>
                )}

                {activeTab === "requirements" && (
                  <motion.div
                    key="requirements"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Cấu hình yêu cầu
                      </h3>
                      <div className="bg-purple-950/50 p-6 rounded-xl border border-purple-700 text-sm text-purple-200">
                        <ul className="space-y-3">
                          <li>
                            <strong className="text-white">OS:</strong>{" "}
                            {game.os || reqs.os || "Windows 10"}
                          </li>
                          <li>
                            <strong className="text-white">CPU:</strong>{" "}
                            {game.cpu ||
                              reqs.processor ||
                              reqs.cpu ||
                              "Core i3"}
                          </li>
                          <li>
                            <strong className="text-white">RAM:</strong>{" "}
                            {game.ram || reqs.memory || reqs.ram || "8 GB"}
                          </li>
                          <li>
                            <strong className="text-white">GPU:</strong>{" "}
                            {game.gpu ||
                              reqs.graphics ||
                              reqs.gpu ||
                              "GTX 1050"}
                          </li>
                          <li>
                            <strong className="text-white">Dung lượng:</strong>{" "}
                            {game.storage || reqs.storage || "50 GB"}
                          </li>
                          <li className="flex items-center gap-2 pt-2 border-t border-purple-800 mt-2">
                            <Gamepad2 className="w-4 h-4 text-purple-400" />
                            <strong className="text-white">
                              Hỗ trợ tay cầm:
                            </strong>
                            <span className="text-emerald-400 font-medium">
                              {controllerSupport}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-purple-700">
                      <SystemCompatibilityChecker
                        gameId={game.id}
                        gameName={title}
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GameReviews
                      gameId={game.id}
                      isOwned={isOwned}
                      accessToken={accessToken}
                      userId={user?.id}
                    />
                  </motion.div>
                )}

                {activeTab === "trailer" && (
                  <motion.div
                    key="trailer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Trailer Game
                    </h3>
                    {videoData.src ? (
                      <>
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-purple-700 shadow-2xl">
                          {videoData.type === "youtube" ? (
                            <iframe
                              src={videoData.src}
                              title="Game Trailer"
                              allowFullScreen
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          ) : videoData.type === "file" ? (
                            <video
                              src={videoData.src}
                              controls
                              className="w-full h-full object-contain"
                              poster={getImageUrl(
                                gbi?.thumbnail || game.thumbnail
                              )}
                            >
                              Trình duyệt không hỗ trợ thẻ video.
                            </video>
                          ) : (
                            <iframe
                              src={videoData.src}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          )}
                        </div>
                        {videoData.type === "youtube" && (
                          <p className="text-right text-sm text-purple-400 italic">
                            <a
                              href={videoData.original}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-white underline"
                            >
                              Xem trên YouTube &rarr;
                            </a>
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

                {activeTab === "download" && (
                  <motion.div
                    key="download"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {!isOwned ? (
                      <div className="text-center py-10 text-purple-200">
                        <p className="text-xl font-bold text-white mb-4">
                          Bạn chưa sở hữu game này
                        </p>
                        <p className="text-sm text-purple-300 mb-6">
                          Vui lòng mua game để tải xuống
                        </p>
                        <button
                          onClick={handleBuyNow}
                          className="bg-purple-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-purple-600 transition"
                        >
                          Mua ngay để tải xuống
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-2xl p-8 text-center">
                        <p className="text-green-400 text-lg mb-6">
                          Chúc mừng! Bạn đã sở hữu game này
                        </p>
                        <a
                          href={game.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-10 py-5 rounded-full transition-all hover:scale-105 shadow-2xl"
                          download
                        >
                          <Download className="inline-block w-6 h-6 mr-2" />{" "}
                          Download Full Speed
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CỘT PHẢI: SIDEBAR THÔNG TIN & NÚT MUA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-purple-950/50 p-6 rounded-xl border border-purple-700 space-y-3 text-sm text-purple-200">
              <div className="flex justify-between">
                <span>Nhà phát hành:</span>{" "}
                <span className="font-semibold text-white">{publisher}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày phát hành:</span>{" "}
                <span className="font-semibold text-white">
                  {game.releaseDate || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thể loại:</span>{" "}
                <span className="font-semibold text-white">
                  {game.categoryName || genres[0] || "General"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Giá:</span>{" "}
                <div className="text-right">
                  {discount > 0 ? (
                    <div className="space-y-1">
                      {/* Giá sau giảm */}
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-2xl text-pink-400">
                          {(price - discount).toLocaleString()} GCoin
                        </span>
                        {/* Badge giảm giá */}
                        <span className="bg-pink-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                          -{discount.toLocaleString()}
                        </span>
                      </div>
                      {/* Giá gốc gạch ngang */}
                      <div className="text-gray-400 text-sm line-through">
                        {price.toLocaleString()} GCoin
                      </div>
                    </div>
                  ) : (
                    <span className="font-bold text-2xl text-pink-400">
                      {price > 0 ? `${price.toLocaleString()} GCoin` : "Miễn Phí"}
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-purple-700/50">
                <p className="text-purple-300 text-sm leading-relaxed italic line-clamp-4">
                  {game.shortDescription ||
                    (description
                      ? description.substring(0, 150) + "..."
                      : "Trải nghiệm ngay tựa game hấp dẫn này.")}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-purple-700/50">
              {/* STATUS BOX: Đã sở hữu hoặc Đã trong giỏ */}
              {isOwned ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 p-6 text-center shadow-xl"
                >
                  <div className="text-4xl mb-3">🎮✅</div>
                  <p className="text-emerald-300 text-lg font-bold">
                    Đã sở hữu
                  </p>
                  <button
                    onClick={() => setActiveTab("download")}
                    className="mt-5 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full shadow-lg w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Tải xuống ngay
                  </button>
                </motion.div>
              ) : isInCart ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-500/20 to-yellow-600/20 border border-amber-500/50 backdrop-blur-sm p-6 text-center shadow-xl"
                >
                  <div className="text-4xl mb-3">🛒✨</div>
                  <p className="text-amber-300 text-lg font-bold tracking-wide">
                    Đã có trong giỏ hàng
                  </p>
                  <p className="text-amber-400 text-sm mt-1 opacity-90">
                    Sẵn sàng thanh toán
                  </p>
                  <div className="flex gap-3 mt-5 justify-center">
                    <button
                      onClick={handleGoToCart}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" /> Xem giỏ hàng
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {/* ACTION BUTTONS (Chỉ hiện khi chưa sở hữu) */}
              {!isOwned && (
                <div className="space-y-3">
                  {/* Nút Mua Ngay */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    {price === 0 ? (
                      <>
                        <Gift className="w-6 h-6" /> Nhận miễn phí ngay
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-6 h-6" /> Mua ngay
                      </>
                    )}
                  </button>

                  {/* Nút Thêm Vào Giỏ (Chỉ hiện nếu chưa có trong giỏ) */}
                  {!isInCart && price > 0 && (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-purple-500/50 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Thêm vào giỏ hàng
                    </button>
                  )}
                  {/* Nút Yêu Thích - Đặt trong Sidebar, bên dưới các nút Mua/Giỏ hàng */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`w-full mt-3 border font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group ${
                      isFavorite
                        ? "border-pink-500 text-pink-400 bg-pink-500/10"
                        : "border-purple-600/50 text-purple-300 hover:text-white hover:border-pink-500 hover:bg-pink-500/10"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isFavorite
                          ? "fill-current scale-110"
                          : "group-hover:text-pink-500"
                      }`}
                    />
                    {isFavorite ? "Đã yêu thích" : "Thêm vào yêu thích"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
