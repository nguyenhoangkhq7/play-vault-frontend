// ✅ Version đã sửa cú pháp, fix lỗi thừa dấu ngoặc, thiếu biến, lỗi không đóng hàm
// ĐÃ CHỈNH: fetchWishlist thừa dấu ngoặc, thiếu favoriteGamesResponse, thiếu setError
// GHI CHÚ: Cần thay favoriteGamesResponse bằng processedGames vì bạn không có API nào trả favoriteGamesResponse

import { useState, useEffect, useMemo } from "react";
import { Search, Grid, List, Heart, HeartOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/authApi.js";
import { toast } from "sonner";


  export default function FavoriteProducts() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterTag, setFilterTag] = useState("all");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Kiểm tra đăng nhập
  useEffect(() => {
    const checkUser = () => {
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (stored && token) setUser(JSON.parse(stored));
      else setUser(null);

      setLoading(false);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const response = await api.get("/api/wishlist", null);
      const wishlistGames = response.data?.games || response.data || [];

      const processedGames = wishlistGames.map((game) => ({
        id: game._id || game.id,
        name: game.name || "Unknown Game",
        price: game.price ? `${game.price.toLocaleString()}đ` : "Miễn phí",
        thumbnailImage:
          game.thumbnail ||
          "https://placehold.co/400x200/9333ea/ffffff?text=No+Image",
        tags: Array.isArray(game.tags) ? game.tags : [],
        publisher: game.publisher || game.details?.publisher || "Unknown",
      }));

      setGames(processedGames);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wishlist:", err);

      let errorMessage = "Đã xảy ra lỗi khi tải dữ liệu.";
      if (err.message.includes("DOCTYPE"))
        errorMessage = "Server trả dữ liệu không hợp lệ (backend có thể chưa chạy).";

      if (
        err.message.includes("ERR_CONNECTION_REFUSED") ||
        err.message.includes("Failed to fetch")
      ) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra backend.";
      }

      setError(errorMessage);
      setGames([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  // Xóa game khỏi wishlist
  const handleRemoveFromFavorites = async (gameId) => {
    if (!user) return toast.error("Vui lòng đăng nhập");

    setWishlistLoading(true);
    try {
      await api.delete(`/api/wishlist/${gameId}`, null);
      setGames((prev) => prev.filter((g) => g.id !== gameId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Filter + Sort
  const filteredGames = useMemo(() => {
    let filtered = games.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterTag !== "all")
      filtered = filtered.filter((g) => g.tags.includes(filterTag));

    if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "price") {
      filtered.sort((a, b) => {
        const pa = parseInt(a.price.replace(/\D/g, "")) || 0;
        const pb = parseInt(b.price.replace(/\D/g, "")) || 0;
        return pa - pb;
      });
    }

    return filtered;
  }, [games, searchQuery, filterTag, sortBy]);

  const allTags = [...new Set(games.flatMap((g) => g.tags))];

  const formatTag = (tag) => {
    const map = {
      "role-playing": "Nhập vai",
      action: "Hành động",
      adventure: "Phiêu lưu",
    };
    return map[tag] || tag;
  };

  // Loading UI
  if (loading)
    return (
      <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-800/50">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-purple-300 mt-4">Đang tải danh sách yêu thích...</p>
      </div>
    );

  // Not logged in
  if (!user)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-800/50 min-h-96 flex flex-col items-center justify-center"
      >
        <Heart className="h-16 w-16 text-pink-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">Chưa đăng nhập</h2>
        <p className="text-purple-300 mb-6">Đăng nhập để xem wishlist của bạn</p>
        <Button
          onClick={() => navigate("/login")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <LogIn className="mr-2 h-4 w-4" /> Đăng nhập ngay
        </Button>
      </motion.div>
    );

  return (
    <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 border border-purple-800/50 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-white">Game Yêu Thích</h1>
          </div>
          <p className="text-purple-300 mt-2">{filteredGames.length} game</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm game..."
            className="pl-10 bg-purple-800/50 border-purple-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="bg-purple-800/50 border-purple-700 text-white">
            <SelectValue placeholder="Thể loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thể loại</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {formatTag(tag)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-purple-800/50 border-purple-700 text-white">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Tên A → Z</SelectItem>
            <SelectItem value="price">Giá thấp → cao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-20 w-20 text-purple-500/30 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Chưa có game yêu thích
          </h3>
          <p className="text-purple-300 mb-6">
            Hãy thêm game từ trang chủ hoặc cửa hàng
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Khám phá ngay
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredGames.map((game) => (
            <motion.div
              key={game.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-purple-900/40 border border-purple-700/50 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300"
            >
              <div
                className="aspect-video bg-cover bg-center relative"
                style={{ backgroundImage: `url(${game.thumbnailImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-700 text-white"
                  onClick={() => handleRemoveFromFavorites(game.id)}
                  disabled={wishlistLoading}
                >
                  <HeartOff className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-white text-lg truncate">{game.name}</h3>
                <p className="text-purple-300 text-sm mt-1">{game.publisher}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-pink-400">{game.price}</span>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/product/${game.id}`)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}