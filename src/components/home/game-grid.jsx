import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, Star, Loader2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
// THÊM getTopNGame và API_BASE_URL (Giả định bạn có import này)
import { getTopNGame } from "../../api/games.js";
import { API_BASE_URL } from "../../config/api.js";
import { getWishlist, createWishlist, updateWishlist } from "../../api/wishlist.js";

const fallbackImage = "https://via.placeholder.com/300x224.png?text=No+Image";

// Component GameCard - Style giống product.jsx
const GameCard = ({ game, idx, onFavoriteToggle, isInWishlist, isWishlistLoading }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3, delay: idx * 0.05 }} 
      className="group/card h-full"
    >
      <div className="relative overflow-hidden rounded-xl border border-purple-800/50 bg-purple-900/50 hover:border-purple-700 transition backdrop-blur-xl h-full flex flex-col hover:shadow-2xl hover:shadow-pink-500/10">
        <div className="relative overflow-hidden bg-slate-950 h-48 sm:h-56">
          <Link to={`/product/${game.id}`}>
            <img 
              src={game.image} 
              alt={game.title} 
              className="w-full h-full object-cover group-hover/card:scale-110 transition duration-500" 
              onError={(e) => (e.currentTarget.src = fallbackImage)} 
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition" />
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteToggle(game.id, game.title);
            }}
            disabled={isWishlistLoading}
            className={`absolute top-3 right-3 p-2 rounded-full transition ${
              isInWishlist 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50' 
                : 'bg-slate-900/80 hover:bg-pink-500/20 text-slate-300 hover:text-pink-400 border border-transparent hover:border-pink-500/50'
            }`}
          >
            <Heart size={18} className={isInWishlist ? 'fill-current' : ''} />
          </motion.button>
        </div>

        <div className="flex-1 p-4 flex flex-col space-y-3">
          <h4 className="text-white font-semibold text-base line-clamp-2 group-hover/card:text-pink-400 transition min-h-[3rem]">
            <Link to={`/product/${game.id}`}>{game.title}</Link>
          </h4>
          
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < Math.floor(game.rating || 0) ? "currentColor" : "none"} 
                  className={i < Math.floor(game.rating || 0) ? "" : "text-slate-700"} 
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">
              {game.rating ? `(${game.rating})` : '(Chưa có)'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
            <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {game.originalPrice === "0 GCoin" ? 'Free' : game.originalPrice}
            </span>
            <Link to={`/product/${game.id}`}>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                className="px-4 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/50 text-pink-300 text-xs font-bold cursor-pointer"
              >
                Xem
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function GameGrid() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [user, setUser] = useState(null);
  const [wishlistGameIds, setWishlistGameIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoggedIn = () => {
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking user login:", err);
        setUser(null);
      }
    };

    checkLoggedIn();
  }, []);

  // Hàm refresh wishlist
  const refreshWishlist = async () => {
    if (!user) return;
    try {
      const data = await getWishlist();
      console.log("Wishlist data:", data);
      if (Array.isArray(data)) {
        const gameIds = data.map(item => item.id || item.gameId || item.game_id);
        setWishlistGameIds(gameIds.filter(id => id !== undefined && id !== null));
      } else {
        setWishlistGameIds([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  // Fetch wishlist data khi user thay đổi
  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlistGameIds([]);
    }
  }, [user]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      refreshWishlist();
    };
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [user]);

  // Lấy danh sách game có rating cao
  useEffect(() => {
    const fetchTopGamesForGrid = async () => {
      try {
        setLoading(true);

        // 🎯 Lấy 8 game có rating cao nhất cho lưới hiển thị
        const topGamesData = await getTopNGame(8);

        if (topGamesData.length === 0) {
          setGames([]);
          setLoading(false);
          return;
        }

        // Ánh xạ dữ liệu từ backend sang định dạng component GameCard
        const processedGames = topGamesData.map((g, index) => {
          const priceValue = g.gameBasicInfos?.price || 0;
          // Giả định giá gốc (hoặc có thể lấy từ trường khác nếu API có)
          const originalPriceValue = priceValue - (g.discount || 0);

          // Định dạng tiền tệ
          const formattedPrice = `${new Intl.NumberFormat("vi-VN").format(priceValue)} GCoin`;
          const formattedOriginalPrice = `${new Intl.NumberFormat("vi-VN").format(originalPriceValue)} GCoin`;

          return {
            id: g.id,
            title: g.gameBasicInfos?.name || "Untitled Game",

            // Xây dựng URL hình ảnh
            image: g.gameBasicInfos?.thumbnail
              ? `${g.gameBasicInfos.thumbnail}`
              : "/placeholder.svg?height=200&width=300",

            price: formattedPrice,
            originalPrice: formattedOriginalPrice,
            discount: g.discount || 0,

            // Lấy rating và review count trực tiếp
            rating: (g.avgRating || 0).toFixed(1),
            commentCount: g.reviewCount || 0,

            // Logic ẩn/hiện (4 game đầu luôn hiện, các game sau cần click "Xem thêm")
            showWhenExpanded: index >= 4,
          };
        });

        setGames(processedGames);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching top games for grid:", err);
        setError("Không thể tải dữ liệu game. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchTopGamesForGrid();
  }, []); // Dependencies là mảng rỗng

  // Hàm toggle yêu thích
  const handleFavoriteToggle = async (gameId, gameName) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm game vào danh sách yêu thích!");
      navigate("/login");
      return;
    }

    setWishlistLoading(prev => ({ ...prev, [gameId]: true }));
    const isCurrentlyFavorite = wishlistGameIds.includes(gameId);

    try {
      console.log("Toggle favorite:", { gameId, gameName, isCurrentlyFavorite });

      if (isCurrentlyFavorite) {
        // Xóa game khỏi wishlist
        await updateWishlist(gameId);
      } else {
        // Thêm game vào wishlist
        await createWishlist(gameId);
      }

      // Refresh wishlist sau khi thay đổi
      await refreshWishlist();
      
      if (isCurrentlyFavorite) {
        toast.success(`${gameName} đã bị xóa khỏi yêu thích!`);
      } else {
        toast.success(`${gameName} đã được thêm vào yêu thích!`);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
      toast.error(errorMsg);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [gameId]: false }));
    }
  };

  // Kiểm tra game có trong wishlist không
  const isGameInWishlist = (gameId) => {
    return wishlistGameIds.includes(gameId);
  };

  const visibleGames = showMore
    ? games
    : games.filter((game) => !game.showWhenExpanded);

  if (loading) {
    return (
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Game nổi bật</h2>
        </div>

        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <div className="text-white">Đang tải danh sách game...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || games.length === 0) {
    return (
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Game nổi bật</h2>
        </div>

        <div className="bg-black/20 rounded-xl p-8 text-center">
          <div className="text-white text-lg mb-2">
            {error || "Không có game nào được tìm thấy"}
          </div>
          <div className="text-gray-400">
            Vui lòng thử lại sau hoặc kiểm tra kết nối đến API.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
          Game Được Đánh Giá Cao Nhất
        </h2>
        <button className="text-purple-300 hover:text-white transition-colors">
          Xem tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleGames.map((game, idx) => (
          <GameCard 
            key={game.id} 
            game={game} 
            idx={idx}
            onFavoriteToggle={handleFavoriteToggle}
            isInWishlist={isGameInWishlist(game.id)}
            isWishlistLoading={wishlistLoading[game.id] || false}
          />
        ))}
      </div>

      {games.length > 4 && (
        <div className="flex justify-center mt-8">
          <button
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 text-white px-5 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 duration-300"
            onClick={() => setShowMore(!showMore)}
          >
            <span>{showMore ? "Hiển thị ít hơn" : "Hiển thị thêm"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
