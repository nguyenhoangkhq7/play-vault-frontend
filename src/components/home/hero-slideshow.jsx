import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ChevronLeft, ChevronRight, Star, Award } from "lucide-react";
import { getGames, getTopNGame } from "../../api/games.js";
import { getCommentsByGameId } from "../../api/comments.js";

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Khởi tạo useNavigate


  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        setLoading(true);

        const topGames = await getTopNGame(4); // 🔥 Gọi API có sẵn

        const processedGames = topGames.map((game) => ({
          id: game.id,
          title: game.gameBasicInfos?.name,
          subtitle: game.categoryName
            ? `${game.categoryName} Game`
            : "Epic Game",
          description: game.gameBasicInfos?.description
            ? game.gameBasicInfos.description.length > 150
              ? game.gameBasicInfos.description.substring(0, 150) + "..."
              : game.gameBasicInfos.description
            : "An exciting gaming experience",
          image: game.gameBasicInfos?.thumbnail || "http://localhost:8080/images/game.jpg",
          // image: "http://localhost:8080/images/game.jpg",
          rating: game.avgRating || 0,
          commentCount: game.reviewCount || 0,
          price: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(game.gameBasicInfos?.price || 0),
          originalPrice: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format((game.gameBasicInfos?.price || 0) - (game.discount || 0)),
          isNew: false,
          badge: game.gameBasicInfos?.publisherName || "Featured",
          genres: [game.categoryName || "Unknown"],
          publisherId: game.publisherId || "Unknown Publisher",
          discount: game.discount || 0
        }));

        setSlides(processedGames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top games:", error);
        setLoading(false);
      }
    };

    fetchTopGames();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    let interval;
    if (isAutoPlaying && slides.length > 0) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  // Hàm xử lý khi nhấn "Xem Chi Tiết"
  const handleViewDetails = (gameId) => {
    navigate(`/product/${gameId}`); // Điều hướng đến trang chi tiết
  };

  // Hàm xử lý khi nhấn "Mua Ngay"
  const handleBuyNow = (gameId, gameTitle) => {
    alert(`Bạn đã chọn mua ${gameTitle}!`);
    navigate(`/product/${gameId}`); // Điều hướng đến trang chi tiết (hoặc có thể đến trang thanh toán)
  };

  if (loading) {
    return (
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
        <div className="text-white text-xl">Không thể tải dữ liệu game</div>
      </div>
    );
  }

  return (
    <div
      className="relative h-[500px] rounded-2xl overflow-hidden mb-12 group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              index === currentSlide
                ? "opacity-100 translate-x-0 z-10"
                : index < currentSlide
                ? "opacity-0 -translate-x-full z-0"
                : "opacity-0 translate-x-full z-0"
            }`}
          >
            <LazyLoadImage
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
              <div className="flex items-center space-x-3 mb-4">
                {slide.isNew && (
                  <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                    NEW
                  </span>
                )}
                {slide.badge && (
                  <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-xs font-medium">
                      {slide.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-xs font-medium">
                    {slide.rating}/5
                  </span>
                  <span className="text-gray-400 text-xs ml-1">
                    ({slide.commentCount})
                  </span>
                </div>
              </div>

              <h2 className="text-5xl font-bold text-white mb-2">
                {slide.title}
              </h2>
              <p className="text-gray-300 text-xl mb-2">{slide.subtitle}</p>
              <p className="text-gray-400 mb-6 max-w-2xl line-clamp-2">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {slide.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* giá */}

              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="text-white text-2xl font-bold">
                    {slide.originalPrice}
                  </span>
                  {slide.discount>0 && (
                    <div className="flex items-center space-x shore-2">
                      <span className="text-gray-400 text-sm line-through">
                        {slide.price}
                      </span>
                      <span className="text-green-500 text-sm font-medium">
                        -{slide.discount}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBuyNow(slide.id, slide.title)}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 duration-200"
                >
                  Mua Ngay
                </button>

                <button
                  onClick={() => handleViewDetails(slide.id)}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 duration-200"
                >
                  Xem Chi Tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 right-8 flex items-center space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/40"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-6 right-8 z-20">
        <div
          className={`w-12 h-1 bg-white/20 rounded-full overflow-hidden ${
            isAutoPlaying ? "" : "hidden"
          }`}
        >
          <div
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{
              width: isAutoPlaying ? "100%" : "0%",
              animation: isAutoPlaying ? "progress 5s linear infinite" : "none",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
