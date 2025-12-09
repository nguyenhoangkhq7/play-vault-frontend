import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  Star,
  Award,
  Users,
  Gamepad2,
  Monitor,
  Smartphone,
  Loader2,
} from "lucide-react";
import { getTopNGame } from "../../api/games.js";
import { useUser } from "../../store/UserContext.jsx";
import { useCart } from "../../store/CartContext.jsx";

export default function GameDetail() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const navigate = useNavigate();
  const { user, accessToken } = useUser();
  const { cart, addToCart, removeFromCart, refreshCart } = useCart();

  // Fetch game có rating cao nhất
  useEffect(() => {
    const fetchTopGame = async () => {
      try {
        setLoading(true);
        const data = await getTopNGame(1); // backend trả LIST
        const g = data[0];

        if (g) {
          setGame({
            id: g.id,
            title: g.gameBasicInfos.name,
            subtitle: g.gameBasicInfos.shortDescription,
            rating: g.avgRating,
            commentCount: g.reviewCount,

            developer: g.publisherName || "Unknown Developer",
            publisher: g.publisherName || "Unknown Publisher",

            genres: g.categoryName ? [g.categoryName] : [],

            platforms: g.platforms || [],

            price: g.gameBasicInfos.price,
            originalPrice: `${new Intl.NumberFormat("vi-VN").format(
              g.gameBasicInfos.price
            )} GCoin`,
            formattedPrice: `${new Intl.NumberFormat("vi-VN").format(
              g.gameBasicInfos.price - g.discount
            )} GCoin`,

            // players: "Single-player",

            //Nếu lưu local dùng này
            // image: g.gameBasicInfos.thumbnail
            //   ? `${API_BASE_URL}${g.gameBasicInfos.thumbnail}`
            //   : "/images/game.jpg",

            image: g.gameBasicInfos.thumbnail
              ? g.gameBasicInfos.thumbnail
              : "/images/game.jpg",

            //Lưu local dùng này
            // screenshots:
            //   g.previewImages && g.previewImages.length > 0
            //     ? g.previewImages.map(img => `${API_BASE_URL}${img}`)
            //     : ["/images/game.jpg", "/images/game.jpg", "/images/game.jpg"],

            screenshots:
              g.previewImages && g.previewImages.length > 0
                ? g.previewImages.map((img) => img)
                : ["/images/game.jpg", "/images/game.jpg", "/images/game.jpg"],

            description: g.gameBasicInfos.description,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching top game:", err);
        setError("Không thể tải game top 1");
        setLoading(false);
      }
    };

    fetchTopGame();
    console.log(user);
  }, []);

// Check if game is in cart - sử dụng cart từ CartContext
  useEffect(() => {
    if (cart && game?.id) {
      const inCart =
        cart.items?.some((item) => item.gameId === game.id) || false;
      setIsInCart(inCart);
    } else {
      setIsInCart(false);
    }
  }, [cart, game]);

  useEffect(() => {
    if (accessToken && user?.customerId) {
      refreshCart(accessToken)
    }
  }, [])

  // Hàm xử lý khi nhấn "Mua Ngay"
  const handleBuyNow = async () => {
    if (!user || !user.customerId) {
      alert("Vui lòng đăng nhập để mua game!");
      navigate("/login");
      return;
    }
    // ... (Logic Buy Now giữ nguyên)
    if (!game?.id) {
      console.error("Invalid game ID for Buy Now:", game);
      alert("Không thể thực hiện mua hàng. Dữ liệu game không hợp lệ.");
      return;
    }
    console.log(`Buy Now: ${game.title} (ID: ${game.id})`);
    navigate(`/product/${game.id}`);
  };

  // Hàm xử lý khi nhấn "Thêm Vào Giỏ" hoặc "Xóa Khỏi Giỏ"
  const handleAddToCart = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm game vào giỏ hàng!");
      navigate("/login");
      return;
    }

    if (!game?.id) {
      console.error("Invalid game ID for cart action:", game);
      alert("Không thể thực hiện hành động. Dữ liệu game không hợp lệ.");
      return;
    }

    setCartLoading(true);
    try {
      if (isInCart) {
        // Tìm cartItemId để xóa
        const cartItem = cart?.items?.find((item) => item.gameId === game.id);
        if (cartItem) {
          await removeFromCart(cartItem.cartItemId, accessToken);
          console.log(`Removed from cart: ${game.title} (ID: ${game.id})`);
        }
      } else {
        await addToCart(game.id, user, accessToken);
        console.log(
          `Added to cart: ${game.title} (ID: ${game.id}, Price: ${game.price})`
        );
      }
    } catch (err) {
      console.error(
        `Error ${isInCart ? "removing from" : "adding to"} cart:`,
        err
      );
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-12 bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <div className="text-white">Đang tải thông tin game...</div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="my-12 bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-white text-center p-6">
          <div className="text-xl font-semibold mb-2">
            Không thể tải dữ liệu
          </div>
          <div className="text-gray-400">
            {error || "Không tìm thấy game. Vui lòng thử lại sau."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">Game Thịnh Hành Nhất</h2>
      <div className="mb-12 mt-5 bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="relative h-[300px] md:h-[250px] lg:h-[300px]">
          <LazyLoadImage
            src={game.image}
            alt={game.title}
            width={800}
            height={300}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {game.title}
            </h2>
            <p className="text-gray-300 text-base">{game.subtitle}</p>
          </div>
          <div className="absolute top-4 right-4 flex items-center space-x-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg shadow-purple-900/20">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold text-base">
                {game.rating}/5
              </span>
              <span className="text-gray-400 text-xs">
                ({game.commentCount})
              </span>
            </div>
            {game.rating >= 4.5 && (
              <>
                <span className="text-white text-xs font-medium">
                  Mostly Positive
                </span>
                <div className="h-3 w-px bg-white/30"></div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-xs font-medium">
                    Top Rated
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-5">
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm">{game.developer}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full">
              <div className="flex space-x-1">
                {game.platforms.map((platform, index) => {
                  let Icon = Monitor;
                  if (
                    platform.toLowerCase().includes("playstation") ||
                    platform.toLowerCase().includes("xbox")
                  ) {
                    Icon = Gamepad2;
                  }
                  if (platform.toLowerCase().includes("mobile")) {
                    Icon = Smartphone;
                  }
                  return (
                    <div
                      key={index}
                      className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center"
                      title={platform}
                    >
                      <Icon className="w-3 h-3 text-purple-400" />
                    </div>
                  );
                })}
              </div>
              <span className="text-white text-sm">
                {game.platforms.join(", ")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {game.genres.map((genre, idx) => (
              <span
                key={idx}
                className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white text-xs px-3 py-1 rounded-full border border-pink-500/30"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">
            {game.description}
          </p>

          <div className="flex space-x-3 mb-6">
            {game.screenshots.map((screenshot, index) => (
              <div
                key={index}
                className="w-1/3 rounded-lg overflow-hidden h-[100px] shadow-lg shadow-purple-900/10"
              >
                <LazyLoadImage
                  src={screenshot || "/placeholder.svg"}
                  alt={`${game.title} screenshot ${index + 1}`}
                  width={300}
                  height={100}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">
                {game.formattedPrice}
              </span>
              {game.originalPrice !== game.formattedPrice && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm line-through">
                    {game.originalPrice}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBuyNow}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105 duration-200"
              >
                Mua Ngay
              </button>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`${
                  isInCart
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-white/10 hover:bg-white/20"
                } text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all transform hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {cartLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isInCart ? (
                  "Xóa Khỏi Giỏ"
                ) : (
                  "Thêm Vào Giỏ"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
