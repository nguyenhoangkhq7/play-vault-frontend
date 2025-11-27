// pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import searchApi from "../../api/searchApi"; 
import { toast } from "sonner";
import { useCart } from "../../store/CartContext";
import { useUser } from "../../store/UserContext";
import { api } from "../../api/authApi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Chỉ lấy addToCart
  const { user, accessToken } = useUser(); // User từ UserContext

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwned, setIsOwnedState] = useState(false);

  // UI
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const response = await api.get(`/api/games/${id}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      });

      const gameData = response.data;
      setGame(gameData);

      const owned = gameData.isOwned === true;
      setIsOwnedState(owned);

      // Chỉ tự chuyển sang tab download khi người dùng vừa mua xong
      if (owned && activeTab !== "download") {
        setActiveTab("download");
      }

    } catch (error) {
      console.error("Lỗi tải chi tiết game:", error);
      setGame(null);
      setIsOwnedState(false);
    } finally {
      setLoading(false);
    }
  };

  fetchDetail();

// Dùng pathname để đảm bảo reload khi điều hướng từ trang khác trở lại
}, [location.pathname, accessToken]);
 // user không cần nữa vì accessToken đã đủ

  // Loại bỏ useEffect kiểm tra searchParams vì redirect không còn dùng ?tab=download

  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";
  const slides = game ? [
    { id: 1, image: game.thumbnail },
    { id: 2, image: game.thumbnail },
    { id: 3, image: game.thumbnail },
  ] : [];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleAddToCart = async () => {
  if (!user || !accessToken) {
    toast.warning("Vui lòng đăng nhập để mua game.");
    navigate("/login");
    return;
  }

  try {
    const updatedCart = await addToCart(game.id, accessToken); // nếu addToCart cần token
    if (updatedCart) {
      toast.success("Đã thêm vào giỏ hàng!");
      navigate("/cart");
    }
  } catch (error) {
    console.error("Thêm game vào giỏ hàng thất bại:", error);
    toast.error("Thêm game vào giỏ hàng thất bại");
  }
};

// Mua ngay
const handleBuyNow = async () => {
  if (!user || !accessToken) {
    toast.warning("Vui lòng đăng nhập để mua game.");
    navigate("/login");
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
      window.dispatchEvent(new Event('purchasedGamesUpdated'));
    } catch (error) {
      console.error("Lỗi mua game miễn phí:", error);
      toast.error("Lỗi mua game miễn phí");
    }
  } else {
    // Game trả phí -> thêm vào giỏ hàng
    await handleAddToCart();
  }
};

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 flex justify-center items-center text-white">
      <Loader2 className="animate-spin w-8 h-8 mr-2" /> Đang tải dữ liệu...
    </div>
  );

  if (!game) return (
    <div className="min-h-screen bg-purple-900 flex justify-center items-center text-white">
      Không tìm thấy thông tin game. <Link to="/products" className="ml-2 text-pink-400 underline">Quay lại</Link>
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
                  onError={(e) => e.currentTarget.src = fallbackImage}
                />
              </AnimatePresence>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-purple-700 mb-6">
              <div className="flex gap-4 flex-wrap">
                {["about","requirements","reviews","download"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 font-semibold rounded-t-md transition-all duration-300 ${activeTab===tab?"bg-pink-500 text-white shadow-md":"text-purple-300 hover:text-white hover:bg-purple-700/50"}`}
                  >
                    {tab==="about"?"Giới thiệu":tab==="requirements"?"Cấu hình":tab==="reviews"?`Đánh giá (${game.reviewCount||0})`:"Tải xuống"}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                {activeTab==="about" && (
                  <motion.div key="about" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-purple-100 leading-relaxed whitespace-pre-line">
                    <h3 className="text-2xl font-bold text-white mb-4">Về trò chơi này</h3>
                    <p>{game.description||"Chưa có mô tả chi tiết."}</p>
                  </motion.div>
                )}
                {activeTab==="requirements" && (
                  <motion.div key="requirements" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <h3 className="text-2xl font-bold text-white mb-4">Cấu hình yêu cầu</h3>
                    <div className="bg-purple-900/50 p-6 rounded-xl border border-purple-700">
                      <ul className="space-y-3 text-sm text-purple-200">
                        <li><strong className="text-white">Hệ điều hành:</strong> {game.os || 'Windows 10'}</li>
                        <li><strong className="text-white">CPU:</strong> {game.cpu || 'Core i3'}</li>
                        <li><strong className="text-white">RAM:</strong> {game.ram || '8 GB'}</li>
                        <li><strong className="text-white">Card đồ họa:</strong> {game.gpu || 'GTX 1050'}</li>
                        <li><strong className="text-white">Dung lượng:</strong> {game.storage || '50 GB'}</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
                {activeTab==="download" && (
                  <motion.div key="download" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
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
              <div className="flex justify-between"><span>Nhà phát hành:</span> <span className="font-semibold text-white">{game.publisherName || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Ngày phát hành:</span> <span className="font-semibold text-white">{game.releaseDate}</span></div>
              <div className="flex justify-between"><span>Thể loại:</span> <span className="font-semibold text-white">{game.categoryName}</span></div>
              <div className="flex justify-between"><span>Giá:</span> <span className="font-semibold text-white">{game.price>0?`${game.price.toLocaleString()} đ`:'Miễn Phí'}</span></div>
            </div>
            <div className="space-y-3 pt-4 border-t border-purple-700">
              <button onClick={handleAddToCart} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2"><ShoppingCart size={20}/> Mua Ngay</button> 
              <button className="w-full bg-transparent hover:bg-purple-800 text-white font-semibold py-3 rounded-lg border border-purple-600 transition flex items-center justify-center gap-2"><Heart size={20}/> Yêu Thích</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
