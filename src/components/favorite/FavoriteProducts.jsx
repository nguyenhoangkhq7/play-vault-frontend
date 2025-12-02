import { useState, useEffect, useMemo } from "react";
import { Search, Grid, List, Heart, HeartOff, LogIn, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/authApi.js"; // Sử dụng api instance chuẩn
import { toast } from "sonner"; // Sử dụng toast thay vì alert

export default function FavoriteProducts() {
  // --- STATE MANAGEMENT ---
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterTag, setFilterTag] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // Giữ lại tính năng lọc trạng thái của tanghoang
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // --- KIỂM TRA ĐĂNG NHẬP ---
  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        if (stored && token) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking user login:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  // --- LẤY DỮ LIỆU WISHLIST ---
  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Gọi API lấy wishlist
      const response = await api.get("/api/wishlist");
      const favoriteGamesResponse = response.data?.games || response.data || [];

      if (!favoriteGamesResponse || !Array.isArray(favoriteGamesResponse)) {
        setGames([]);
        setLoading(false);
        return;
      }

      // Map dữ liệu chi tiết (Logic của tanghoang để đảm bảo đủ trường dữ liệu)
      const processedGames = favoriteGamesResponse.map((game) => ({
        ...game,
        status: "not_purchased", // Mặc định, có thể update logic check đã mua ở đây nếu có API
        downloadProgress: 0,
        price: typeof game.price === 'number' ? `${game.price.toLocaleString()}đ` : (game.price || "Miễn phí"),
        tags: game.tags || [],
        thumbnailImage: game.thumbnail || "https://placehold.co/400x200/3a1a5e/ffffff?text=No+Image",
        ageRating: game.details?.["age-limit"] || "N/A",
        releaseDate: game.details?.published_date?.$date
          ? new Date(game.details.published_date.$date).toLocaleDateString("vi-VN")
          : "N/A",
        publisher: game.details?.publisher || "Unknown Publisher",
        description: game.details?.describe || "",
        // Giữ lại cấu hình máy để dùng cho view List chi tiết
        minRequirements: {
          os: game.minimum_configuration?.os || "N/A",
          cpu: game.minimum_configuration?.cpu || "N/A",
          ram: game.minimum_configuration?.ram || "N/A",
          gpu: game.minimum_configuration?.gpu || "N/A",
          storage: game.minimum_configuration?.disk || "N/A",
        },
      }));

      setGames(processedGames);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage = err.response?.data?.message || "Không thể tải danh sách yêu thích";
      setError(errorMessage);
      toast.error(errorMessage);
      setGames([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Lắng nghe sự kiện update wishlist từ nơi khác (nếu có)
  useEffect(() => {
    const handleWishlistUpdate = () => fetchData();
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [user]);

  // --- XỬ LÝ XÓA GAME ---
  const handleRemoveFromFavorites = async (gameId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      setWishlistLoading(true);
      // Gọi API xóa
      await api.delete(`/api/wishlist/${gameId}`);

      // Optimistic update (Cập nhật UI ngay lập tức)
      setGames((prev) => prev.filter((g) => g.id !== gameId));
      
      toast.success("Đã xóa khỏi danh sách yêu thích");
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast.error("Xóa thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setWishlistLoading(false);
    }
  };

  // --- FILTER & SORT ---
  const filteredGames = useMemo(() => {
    let result = games.filter((game) => {
      const matchSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = filterTag === "all" || game.tags.includes(filterTag);
      const matchStatus = statusFilter === "all" || game.status === statusFilter;
      return matchSearch && matchTag && matchStatus;
    });

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price") {
      result.sort((a, b) => {
        const pa = parseInt(String(a.price).replace(/\D/g, "")) || 0;
        const pb = parseInt(String(b.price).replace(/\D/g, "")) || 0;
        return pa - pb;
      });
    }
    return result;
  }, [games, searchQuery, filterTag, statusFilter, sortBy]);

  // Lấy danh sách tags duy nhất
  const allTags = [...new Set(games.flatMap((game) => game.tags))];

  // Helper formats
  const formatTag = (tag) => {
    const tagMap = { "role-playing": "Nhập vai", action: "Hành động", adventure: "Phiêu lưu" };
    return tagMap[tag] || tag;
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    const firstName = user.f_name || user.firstName || "";
    const lastName = user.l_name || user.lastName || "";
    return [firstName, lastName].filter(Boolean).join(" ").trim() || user.email || "Người dùng";
  };

  // --- RENDERING ---

  // 1. Loading State
  if (loading) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-800/50 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-purple-300">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  // 2. Not Logged In State
  if (!user) {
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
  }

  // 3. Error State
  if (error) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 flex justify-center items-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  // 4. Main Content
  return (
    <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-purple-800/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-white">Game Yêu Thích</h1>
          </div>
          <p className="text-purple-300 mt-2">
            {getUserDisplayName()} • {filteredGames.length} game
          </p>
        </div>

        {/* View Toggles */}
        <div className="flex bg-purple-800/80 rounded-md overflow-hidden border border-purple-700/50 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`rounded-none px-3 py-2 h-9 ${viewMode === "grid" ? "bg-purple-700 text-white" : "text-purple-400 hover:text-purple-200"}`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`rounded-none px-3 py-2 h-9 ${viewMode === "list" ? "bg-purple-700 text-white" : "text-purple-400 hover:text-purple-200"}`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Filter (From Tanghoang) */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="bg-purple-800/80 border border-purple-700/50 w-full md:w-auto justify-start rounded-lg p-1 h-auto shadow-lg">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white px-4 py-2">Tất cả</TabsTrigger>
            <TabsTrigger value="not_purchased" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white px-4 py-2">Chưa mua</TabsTrigger>
            <TabsTrigger value="purchased" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white px-4 py-2">Đã mua</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm game..."
            className="pl-10 bg-purple-800/80 border-purple-700/50 focus:border-purple-600 text-white placeholder-purple-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-[180px] bg-purple-800/80 border-purple-700/50 text-white">
              <SelectValue placeholder="Thể loại" />
            </SelectTrigger>
            <SelectContent className="bg-purple-900 border-purple-700 text-white">
              <SelectItem value="all">Tất cả thể loại</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>{formatTag(tag)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-purple-800/80 border-purple-700/50 text-white">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent className="bg-purple-900 border-purple-700 text-white">
              <SelectItem value="name">Tên A-Z</SelectItem>
              <SelectItem value="price">Giá thấp-cao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game List Display */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-purple-900/30 rounded-lg border border-purple-700/30">
          <Heart className="mx-auto h-16 w-16 text-purple-500/30 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy game</h3>
          <p className="text-purple-300 mb-6">
            {searchQuery || filterTag !== 'all' 
              ? "Thử thay đổi bộ lọc tìm kiếm của bạn."
              : "Bạn chưa có game nào trong danh sách yêu thích."}
          </p>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Khám phá ngay
          </Button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          <AnimatePresence>
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative bg-purple-900/40 border border-purple-700/50 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row h-32' : ''}`}
              >
                {/* Thumbnail */}
                <div
                  className={`${viewMode === 'grid' ? 'aspect-video w-full' : 'w-48 h-full'} bg-cover bg-center relative flex-shrink-0`}
                  style={{ backgroundImage: `url(${game.thumbnailImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Remove Button (Positioned differently based on view) */}
                  <div className="absolute top-2 right-2 z-10">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites(game.id);
                        }}
                        disabled={wishlistLoading}
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-red-600 text-white backdrop-blur-md"
                      >
                        {wishlistLoading ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <HeartOff className="h-4 w-4" />
                        )}
                      </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-bold text-white text-lg truncate mb-1" title={game.name}>{game.name}</h3>
                    <p className="text-purple-300 text-xs mb-2">{game.publisher}</p>
                    <div className="flex flex-wrap gap-1">
                        {game.tags.slice(0, viewMode === 'list' ? 3 : 2).map(tag => (
                            <span key={tag} className="text-[10px] bg-purple-800/80 text-purple-200 px-2 py-0.5 rounded-full border border-purple-700">
                                {formatTag(tag)}
                            </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-pink-400">{game.price}</span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/product/${game.id}`)}
                      className="bg-gradient-to-r from-purple-600