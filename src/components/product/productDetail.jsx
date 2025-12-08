// pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Download, ShoppingBag, Gift, CheckCircle } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import searchApi from "../../api/searchApi";
import { toast } from "sonner";
import { useCart } from "../../store/CartContext";
import { useUser } from "../../store/UserContext";
import { api } from "../../api/authApi";
import GameReviews from "../review/GameReview";
import SystemCompatibilityChecker from "../SystemCompatibilityChecker";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart(); // ✅ Chỉ lấy addToCart và cart
  const { user, accessToken } = useUser();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwned, setIsOwnedState] = useState(false);
  const [isInCart, setIsInCart] = useState(false); // ✅ State để kiểm tra trong giỏ hàng

  // UI
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const response = await api.get(`/api/games/${id}`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });

        const gameData = response.data;
        setGame(gameData);

        const owned = gameData.isOwned === true;
        setIsOwnedState(owned);

        // ✅ Kiểm tra xem game đã có trong giỏ hàng chưa (dùng cart từ Context)
        // const inCart =
        //   cart?.items?.some((item) => item.gameId === gameData.id) || false;
        // setIsInCart(inCart);

        // if (owned && activeTab !== "download") {
        //   setActiveTab("download");
        // }
      } catch (error) {
        console.error("Lỗi tải chi tiết game:", error);
        setGame(null);
        setIsOwnedState(false);
        setIsInCart(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    // 🔥 LISTEN EVENT: Khi thanh toán thành công, refetch dữ liệu
    const handlePurchaseSuccess = () => {
      console.log("🎉 Phát hiện mua hàng thành công, refetch dữ liệu...");
      fetchDetail();
    };

    window.addEventListener('purchasedGamesUpdated', handlePurchaseSuccess);

    // Cleanup listener
    return () => {
      window.removeEventListener('purchasedGamesUpdated', handlePurchaseSuccess);
    };
  }, [id, accessToken]); // ✅ Thêm cart vào dependency

  // Effect riêng chỉ để theo dõi sự thay đổi của cart
  useEffect(() => {
    if (!game || !cart?.items) {
      setIsInCart(false);
      return;
    }

    const inCart = cart.items.some((item) => item.gameId === game.id);
    setIsInCart(inCart);
  }, [cart, game]); // Chỉ chạy khi cart hoặc game thay đổi

  // ✅ Effect riêng để theo dõi cart thay đổi và cập nhật isInCart
  useEffect(() => {
    if (game && cart) {
      const inCart =
        cart.items?.some((item) => item.gameId === game.id) || false;
      setIsInCart(inCart);
    }
  }, [cart, game]);

  // 🔥 AUTO SWITCH TAB khi isOwned thay đổi
  useEffect(() => {
    if (isOwned) {
      // Tự động chuyển sang tab "download" khi game đã được mua
      setActiveTab("download");
    }
  }, [isOwned]);

  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";
  const slides = game
    ? [
        { id: 1, image: game.thumbnail },
        { id: 2, image: game.thumbnail },
        { id: 3, image: game.thumbnail },
      ]
    : [];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // ✅ Hàm xử lý thêm vào giỏ hàng với các kiểm tra
  const handleAddToCart = async () => {
    if (!user || !accessToken) {
      toast.warning("Vui lòng đăng nhập để mua game.");
      navigate("/login");
      return;
    }

    // ✅ Kiểm tra nếu game đã được sở hữu
    if (isOwned) {
      toast.error("Game đã được mua! Bạn không thể thêm vào giỏ hàng.");
      return;
    }

    // ✅ Kiểm tra nếu game đã có trong giỏ hàng
    if (isInCart) {
      toast.error("Game này đã có trong giỏ hàng rồi! Bạn không thể thêm thêm lần nữa.");
      return;
    }

    try {
      // ✅ Gọi addToCart từ Context (chỉ cần gameId và token)
      const updatedCart = await addToCart(game.id, user, accessToken);
      if (updatedCart) {
        // ✅ Không cần navigate ngay, để người dùng quyết định
        toast.success("Đã thêm vào giỏ hàng!");
        setIsInCart(true); // ✅ Cập nhật state
        // Người dùng có thể tiếp tục mua sắm hoặc vào giỏ hàng
      }
    } catch (error) {
      console.error("Thêm game vào giỏ hàng thất bại:", error);
      // Lỗi đã được xử lý trong CartContext
    }
  };

  // ✅ Hàm xử lý Mua ngay
  const handleBuyNow = async () => {
    if (!user || !accessToken) {
      toast.warning("Vui lòng đăng nhập để mua game.");
      navigate("/login");
      return;
    }

    // ✅ Kiểm tra nếu game đã được sở hữu
    if (isOwned) {
      toast.error("Game đã được mua! Bạn không thể mua lại.");
      return;
    }

    if (game.price === 0) {
      // Game miễn phí
      try {
        await api.post(
          "/api/orders/free",
          { gameId: game.id },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        toast.success("Đã thêm vào thư viện của bạn!");
        setIsOwnedState(true);
        // 🔥 TRIGGER REFETCH trong PurchasedProducts
        window.dispatchEvent(new Event("purchasedGamesUpdated"));
      } catch (error) {
        console.error("Lỗi mua game miễn phí:", error);
        toast.error("Lỗi mua game miễn phí");
      }
    } else {
      // Game trả phí -> thêm vào giỏ hàng và chuyển đến trang giỏ hàng
      try {
        const updatedCart = await addToCart(game.id, user, accessToken);
        if (updatedCart) {
          toast.success("Đã thêm vào giỏ hàng!");
          setIsInCart(true);
          navigate("/cart"); // ✅ Chuyển đến giỏ hàng ngay
        }
      } catch (error) {
        console.error("Thêm game vào giỏ hàng thất bại:", error);
      }
    }
  };

  // ✅ Hàm chuyển đến giỏ hàng
  const handleGoToCart = () => {
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 flex justify-center items-center text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Đang tải dữ liệu...
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 flex justify-center items-center text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Đang tải dữ liệu...
      </div>
    );

  if (!game)
    return (
      <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">
        Không tìm thấy thông tin game.{" "}
        <Link to="/products" className="ml-2 text-pink-400 underline">
          Quay lại
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-6">{game.name}</h1>

            <div className="relative bg-purple-950 rounded-xl overflow-hidden mb-6 shadow-lg h-[400px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={slides[currentSlide]?.image || fallbackImage}
                  alt={`Screenshot ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
              </AnimatePresence>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-purple-700 mb-6">
              <div className="flex gap-4 flex-wrap">
                {["about", "requirements", "reviews", "download"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 font-semibold rounded-t-md transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-pink-500 text-white shadow-md"
                        : "text-purple-300 hover:text-white hover:bg-purple-700/50"
                    }`}
                  >
                    {tab === "about"
                      ? "Giới thiệu"
                      : tab === "requirements"
                      ? "Cấu hình"
                      : tab === "reviews"
                      ? `Đánh giá (${game.reviewCount || 0})`
                      : "Tải xuống"}
                  </button>
                ))}
              </div>
            </div>

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
                    <p>{game.description || "Chưa có mô tả chi tiết."}</p>
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
                      <div className="bg-purple-900/50 p-6 rounded-xl border border-purple-700">
                        <ul className="space-y-3 text-sm text-purple-200">
                          <li>
                            <strong className="text-white">Hệ điều hành:</strong>{" "}
                            {game.os || "Windows 10"}
                          </li>
                          <li>
                            <strong className="text-white">CPU:</strong>{" "}
                            {game.cpu || "Core i3"}
                          </li>
                          <li>
                            <strong className="text-white">RAM:</strong>{" "}
                            {game.ram || "8 GB"}
                          </li>
                          <li>
                            <strong className="text-white">Card đồ họa:</strong>{" "}
                            {game.gpu || "GTX 1050"}
                          </li>
                          <li>
                            <strong className="text-white">Dung lượng:</strong>{" "}
                            {game.storage || "50 GB"}
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* 🔥 Tích hợp DXDiag Compatibility Checker */}
                    <div className="pt-4 border-t border-purple-700">
                      <SystemCompatibilityChecker 
                        gameId={game.id} 
                        gameName={game.name}
                      />
                    </div>
                  </motion.div>
                )}
                {/* 🔥 KHỐI ĐÁNH GIÁ MỚI - Tích hợp GameReviews */}
                {" "}
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                   {" "}
                    <GameReviews
                      gameId={game.id}
                      isOwned={isOwned}
                      accessToken={accessToken}
                      userId={user?.id} // Truyền thông tin user nếu cần
                    />
                   {" "}
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
                          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-10 py-5 rounded-full transition-all transform hover:scale-105 shadow-2xl"
                          download
                        >
                          Download Full Speed
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-purple-950/50 p-6 rounded-xl border border-purple-700 space-y-3 text-sm text-purple-200">
              <div className="flex justify-between">
                <span>Nhà phát hành:</span>{" "}
                <span className="font-semibold text-white">
                  {game.publisherName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ngày phát hành:</span>{" "}
                <span className="font-semibold text-white">
                  {game.releaseDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thể loại:</span>{" "}
                <span className="font-semibold text-white">
                  {game.categoryName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giá:</span>{" "}
                <span className="font-semibold text-white">
                  {game.price > 0
                    ? `${game.price.toLocaleString()} GCoin`
                    : "Miễn Phí"}
                </span>
              </div>
            </div>

            {/* ✅ Hiển thị trạng thái game */}
            {/* ✅ Hiển thị trạng thái game - Phiên bản đẹp, hiện đại & chuyên nghiệp */}
            <div className="space-y-4 pt-6 border-t border-purple-700/50">
              {/* Đã sở hữu - Xanh lá sang trọng */}
              {isOwned ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600/20 via-emerald-500/20 to-teal-600/20 border border-emerald-500/40 backdrop-blur-sm p-6 text-center shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">🎮✅</div>
                    <p className="text-emerald-300 text-lg font-bold tracking-wide">
                      Bạn đã sở hữu trò chơi này
                    </p>
                    <p className="text-emerald-400 text-sm mt-1 opacity-90">
                      Game đã có trong thư viện của bạn
                    </p>
                    <button
                      onClick={() => setActiveTab("download")}
                      className="mt-5 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Download className="w-5 h-5" />
                      Tải xuống ngay
                    </button>
                  </div>
                </motion.div>
              ) : isInCart ? (
                /* Đang trong giỏ hàng - Vàng cam nổi bật */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-500/20 to-yellow-600/20 border border-amber-500/50 backdrop-blur-sm p-6 text-center shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">🛒✨</div>
                    <p className="text-amber-300 text-lg font-bold tracking-wide">
                      Đã có trong giỏ hàng
                    </p>
                    <p className="text-amber-400 text-sm mt-1 opacity-90">
                      Sẵn sàng thanh toán khi bạn muốn
                    </p>
                    <div className="flex gap-3 mt-5 justify-center">
                      <button
                        onClick={handleGoToCart}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Xem giỏ hàng
                      </button>
                      {/* <button
                        onClick={handleAddToCart}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/50 rounded-full backdrop-blur-sm transition-all duration-300"
                      >
                        Thêm lần nữa
                      </button> */}
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* Nút hành động chính */}
              <div className="space-y-3">
                <button
                  onClick={isOwned ? () => setActiveTab("download") : handleBuyNow}
                  className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isOwned}
                >
                  {isOwned ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Đã sở hữu
                    </>
                  ) : game.price === 0 ? (
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

                {!isOwned && !isInCart && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-purple-500/50 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Thêm vào giỏ hàng
                  </button>
                )}

                <button className="w-full bg-transparent hover:bg-white/10 text-purple-300 hover:text-white font-semibold py-4 rounded-2xl border border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3 group">
                  <Heart className="w-5 h-5 group-hover:fill-pink-500 group-hover:text-pink-500 transition-all" />
                  Thêm vào danh sách yêu thích
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
