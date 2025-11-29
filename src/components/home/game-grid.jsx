import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Star, Loader2 } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
// THÊM getTopNGame và API_BASE_URL (Giả định bạn có import này)
import { getTopNGame } from "../../api/games.js";
import { API_BASE_URL } from "../../config/api.js";
// import { getGames } from "../../api/games.js" // KHÔNG CẦN
// import { getCommentsByGameId } from "../../api/comments.js" // KHÔNG CẦN

// Component GameCard (Giữ nguyên)
const GameCard = ({ game }) => {
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.stopPropagation(); // Ngăn chặn click lan truyền
    if (!game?.id) return;
    // alert(`Bạn đã chọn mua ${game.title}!`)
    navigate(`/product/${game.id}`);
  };

  return (
    <div
      className="relative group overflow-hidden rounded-xl bg-black/20 hover:bg-black/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
      onClick={() => navigate(`/product/${game.id}`)} // Bấm vào card điều hướng
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-t-xl">
        <LazyLoadImage
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute right-3 top-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-medium">
            {game.rating}/5
          </span>
          <span className="text-gray-400 text-xs">({game.commentCount})</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold line-clamp-2 mb-2 h-12">
          {game.title}
        </h3>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-white font-bold">{game.originalPrice}</span>
            {game.price != game.originalPrice && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 text-xs line-through">
                  {game.price}
                </span>
                <span className="text-green-500 text-xs">
                  -{game.discount || ""}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleBuyNow}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-300"
          >
            Mua Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GameGrid() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);

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
          const formattedPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(priceValue);
          const formattedOriginalPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(originalPriceValue);

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
        {visibleGames.map((game) => (
          <GameCard key={game.id} game={game} />
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
