import { useState, useEffect, useCallback } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    CalendarIcon,
    FilterIcon,
    Grid3X3,
    ListFilter,
    ShoppingBag,
    Star,
    LogIn,
    Search,
    Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyPurchasedGames } from "../../api/library.js";
import { useUser } from "../../store/UserContext.jsx";
import { r2Service } from "../../api/r2Service.js"; // ✅ THÊM R2 SERVICE
import searchApi from "../../api/searchApi.js"; // ✅ THÊM: Để fetch game details với category


export default function PurchasedProducts() {
    const [view, setView] = useState("list");
    const [categoryFilter, setCategoryFilter] = useState("all"); // ✅ Filter theo thể loại
    const [sortOrder, setSortOrder] = useState("default"); // ✅ Sort theo bảng chữ cái
    
    // Danh sách thể loại game từ database
    const gameCategories = [
        { id: 1, name: "Action" },
        { id: 2, name: "Adventure" },
        { id: 3, name: "RPG" },
        { id: 4, name: "Simulation" },
        { id: 5, name: "Strategy" },
        { id: 6, name: "Puzzle" },
        { id: 7, name: "Horror" },
        { id: 8, name: "Racing" },
    ];
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState(""); // Input tạm, chỉ update searchQuery khi Enter
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // ✅ Detect khi component được access
    const [downloadingGameId, setDownloadingGameId] = useState(null); // ✅ THÊM: Track game đang download
    
    // Lấy user và setAccessToken từ UserContext
    const { user, setAccessToken } = useUser();

    // ✅ Hàm refetch data
    const fetchPurchasedGames = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Gọi API lấy game đã mua từ backend
            let purchasedGames = await getMyPurchasedGames(setAccessToken);

            console.log("📚 Purchased games from API (raw):", purchasedGames);

            // Handle nếu response là { data: [...] }
            if (purchasedGames && purchasedGames.data && Array.isArray(purchasedGames.data)) {
                purchasedGames = purchasedGames.data;
            }

            if (!Array.isArray(purchasedGames) || purchasedGames.length === 0) {
                console.warn("⚠️ No purchased games returned from API");
                setProducts([]);
                return;
            }

            console.log("📚 Purchased games (after parse):", purchasedGames);

            // Transform data từ backend sang format của frontend
            const transformedProducts = purchasedGames.map(game => {
                return {
                    id: game.id,
                    name: game.name || "Unknown Game",
                    price: game.price || 0,
                    purchasePrice: game.purchasePrice || game.price || 0, // Giá thực tế đã mua
                    thumbnail_image: game.thumbnail || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image',
                    purchaseDate: game.purchaseDate ? new Date(game.purchaseDate) : new Date(),
                    status: "delivered",
                    categoryName: game.categoryName || null, // ✅ Backend sẽ trả về field này
                    tags: game.categoryName ? [game.categoryName] : [],
                    details: {
                        publisher: game.publisherName || "Unknown Publisher"
                    }
                };
            });

            console.log("✅ Transformed products:", transformedProducts);
            setProducts(transformedProducts);
        } catch (err) {
            console.error("❌ Error fetching purchased games:", err);
            setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [user, setAccessToken]);

    // Fetch purchased games when component mounts or when location changes
    useEffect(() => {
        console.log("🔄 Fetching purchased games - location changed:", location.pathname);
        fetchPurchasedGames();
    }, [location.pathname, fetchPurchasedGames]);

    // 🔥 Listen to purchase event from CartPage
    useEffect(() => {
    const handlePurchaseUpdate = () => {
        console.log("Game mua thành công → Refetch thư viện!");
        fetchPurchasedGames();
    };

    window.addEventListener('purchasedGamesUpdated', handlePurchaseUpdate);

    return () => {
        window.removeEventListener('purchasedGamesUpdated', handlePurchaseUpdate);
    };
    }, [fetchPurchasedGames]);

    // Handle Enter key để tìm kiếm
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSearchQuery(searchInput);
        }
    };

    // ✅ THÊM: Xử lý download game
    const handleDownloadGame = async (e, gameId, gameName) => {
        e.stopPropagation(); // Prevent navigation to game detail

        if (!user) {
            alert("Vui lòng đăng nhập để tải game!");
            navigate("/login");
            return;
        }

        try {
            setDownloadingGameId(gameId);
            
            // Lấy secure download URL từ backend
            const { downloadUrl, fileName } = await r2Service.getSecureDownloadUrl(gameId);
            
            // Trigger download
            r2Service.downloadGameFile(downloadUrl, fileName || `${gameName}.rar`);
            
            alert(`Đang tải "${gameName}"... Vui lòng kiểm tra Downloads folder!`);
        } catch (error) {
            console.error("❌ Error downloading game:", error);
            if (error.response?.status === 403) {
                alert("Bạn không có quyền tải game này!");
            } else {
                alert("Có lỗi xảy ra khi tải game. Vui lòng thử lại!");
            }
        } finally {
            setDownloadingGameId(null);
        }
    };

    // ✅ Filter và Sort products
    let filteredProducts = products.filter((product) => {
        // Filter theo search query (tên game)
        const matchesSearch = searchQuery === "" || product.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // ✅ Filter theo category (SỚ SÀNG khi backend trả về categoryName)
        const matchesCategory = categoryFilter === "all" || 
            (product.categoryName && product.categoryName.toLowerCase() === categoryFilter.toLowerCase());
        
        return matchesSearch && matchesCategory;
    });

    // ✅ Sort theo sortOrder
    if (sortOrder === "name-asc") {
        filteredProducts = [...filteredProducts].sort((a, b) => 
            a.name.localeCompare(b.name, 'vi')
        );
    } else if (sortOrder === "name-desc") {
        filteredProducts = [...filteredProducts].sort((a, b) => 
            b.name.localeCompare(a.name, 'vi')
        );
    }
    // "default" giữ nguyên thứ tự từ API

    const formatCurrency = (amount) => {
        // Nếu amount là số, format bình thường
        const numAmount = Number(amount);
        if (isNaN(numAmount)) return "0 GCoin";
        
        return numAmount.toLocaleString('vi-VN') + " GCoin";
    };

    // Handle login click
    const handleLoginClick = () => {
        navigate('/login')
    }

    if (loading) {
        return (
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 flex justify-center items-center h-64">
                <div className="text-purple-300">Đang tải dữ liệu...</div>
            </div>
        );
    }

    // Hiển thị trang đăng nhập nếu chưa đăng nhập
    if (!user) {
        return (
            <motion.div
                className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-purple-800/50 flex flex-col items-center justify-center min-h-[400px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-purple-800/50 flex items-center justify-center mb-6">
                        <ShoppingBag className="h-10 w-10 text-pink-500/70" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Lịch sử mua hàng của bạn</h2>
                    <p className="text-purple-300 max-w-md mb-6">
                        Đăng nhập để xem lịch sử mua hàng và theo dõi trạng thái đơn hàng của bạn. Bạn có thể tải lại game đã mua và kiểm tra thông tin chi tiết.
                    </p>
                    <Button
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg shadow transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:shadow-purple-500/20"
                        onClick={handleLoginClick}
                    >
                        <LogIn className="h-4 w-4" />
                        Đăng nhập ngay
                    </Button>
                </div>
            </motion.div>
        )
    }

    if (error) {
        return (
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 flex justify-center items-center h-64">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6 text-pink-500" />
                        Sản Phẩm Đã Mua
                    </h1>

                    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto justify-end">
                        <div className="flex bg-purple-800/80 rounded-md overflow-hidden border border-purple-700/50 shadow-lg">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setView("grid")}
                                className={`rounded-none px-3 py-2 h-9 hover:bg-purple-700 hover:text-purple-200 ${view === "grid" ? "bg-purple-700 text-white" : "text-purple-400"}`}
                            >
                                <Grid3X3 className="h-4 w-4" />
                                <span className="sr-only">Grid view</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setView("list")}
                                className={`rounded-none px-3 py-2 h-9 hover:bg-purple-700 hover:text-purple-200 ${view === "list" ? "bg-purple-700 text-white" : "text-purple-400"}`}
                            >
                                <ListFilter className="h-4 w-4" />
                                <span className="sr-only">List view</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
                    <div className="flex items-center gap-2 text-purple-300">
                        <FilterIcon className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium">Lọc theo:</span>
                    </div>

                    {/* Ô tìm kiếm theo tên game */}
                    <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm game... (Nhấn Enter)"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-10 bg-purple-900/80 border-purple-700/50 hover:border-purple-600 focus:border-purple-500 shadow-lg rounded-lg text-white placeholder:text-purple-400"
                        />
                    </div>

                    {/* ✅ Lọc theo thể loại */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-purple-900/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                            <SelectValue placeholder="Thể loại" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                            <SelectItem value="all">Tất cả thể loại</SelectItem>
                            {gameCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* ✅ Sắp xếp theo bảng chữ cái */}
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-[180px] bg-purple-900/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                            <SelectItem value="default">Mặc định</SelectItem>
                            <SelectItem value="name-asc">Tên A → Z</SelectItem>
                            <SelectItem value="name-desc">Tên Z → A</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        className="bg-purple-700 hover:bg-purple-600 text-white"
                        onClick={() => {
                            setCategoryFilter("all");
                            setSearchQuery("");
                            setSearchInput("");
                            setSortOrder("default");
                        }}
                    >
                        Đặt lại bộ lọc
                    </Button>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-8 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-purple-500 mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Không tìm thấy sản phẩm
                        </h3>
                        <p className="text-purple-300 max-w-md mx-auto mb-6">
                            {products.length === 0
                                ? "Bạn chưa mua sản phẩm nào. Hãy truy cập cửa hàng để khám phá các game hấp dẫn."
                                : "Không có sản phẩm nào phù hợp với bộ lọc đã chọn."}
                        </p>
                        {products.length === 0 ? (
                            <Button
                                className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                                onClick={() => navigate('/')}
                            >
                                Khám phá cửa hàng
                            </Button>
                        ) : (
                            <Button
                                className="mt-2 bg-purple-700 hover:bg-purple-600 text-white"
                                onClick={() => {
                                    setPriceFilter("all");
                                    setCategoryFilter("all");
                                    setSearchQuery("");
                                    setSearchInput("");
                                }}
                            >
                                Đặt lại bộ lọc
                            </Button>
                        )}
                    </div>
                ) : (
                    <div>
                        {view === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="bg-purple-900/40 border border-purple-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 group cursor-pointer"
                                    >
                                        <div
                                            className="h-44 bg-cover bg-center relative"
                                            style={{ backgroundImage: `url(${product.thumbnail_image || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image'})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                                                {product.tags?.slice(0, 1).map((tag) => (
                                                    <span key={tag} className="bg-pink-600/90 text-white text-xs px-2 py-1 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                                            <div className="text-sm text-purple-300 mt-1">
                                                Ngày mua: {format(product.purchaseDate, "dd/MM/yyyy", { locale: vi })}
                                            </div>
                                            <div className="mt-3 flex justify-end items-center">
                                                <Button
                                                    onClick={(e) => handleDownloadGame(e, product.id, product.name)}
                                                    disabled={downloadingGameId === product.id}
                                                    className="text-xs h-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {downloadingGameId === product.id ? (
                                                        <>Đang tải...</>
                                                    ) : (
                                                        <>
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Tải game
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="flex bg-purple-900/40 border border-purple-700/50 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 overflow-hidden cursor-pointer"
                                    >
                                        <div
                                            className="w-32 h-24 bg-cover bg-center flex-shrink-0"
                                            style={{ backgroundImage: `url(${product.thumbnail_image || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image'})` }}
                                        ></div>
                                        <div className="flex-1 p-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="text-sm text-purple-300">
                                                            Ngày mua: {format(product.purchaseDate, "dd/MM/yyyy", { locale: vi })}
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Button
                                                        onClick={(e) => handleDownloadGame(e, product.id, product.name)}
                                                        disabled={downloadingGameId === product.id}
                                                        className="text-xs h-8 mt-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingGameId === product.id ? (
                                                            <>Đang tải...</>
                                                        ) : (
                                                            <>
                                                                <Download className="h-3 w-3 mr-1" />
                                                                Tải game
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}