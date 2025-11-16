import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
    CalendarIcon,
    FilterIcon,
    Grid3X3,
    ListFilter,
    ShoppingBag,
    Star,
    LogIn
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
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getGames } from "../../api/games.js";
import { getPurchases } from "../../api/purchases.js";

const statusMap = {
    delivered: { label: "Đã giao", variant: "green" },
    processing: { label: "Đang xử lý", variant: "yellow" },
};

const statusColorMap = {
    delivered: "bg-green-100 text-green-800 border-green-300",
    processing: "bg-yellow-100 text-yellow-800 border-yellow-300",
}

export default function PurchasedProducts() {
    const [view, setView] = useState("list");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [boughtItems, setBoughtItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Kiểm tra người dùng đã đăng nhập chưa
    useEffect(() => {
        // Lấy thông tin người dùng từ localStorage và sessionStorage (nếu đã đăng nhập)
        const checkLoggedIn = () => {
            try {
                // Kiểm tra cả localStorage và sessionStorage
                const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
                const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

                console.log("Stored user:", storedUser)
                console.log("Access token:", accessToken)

                if (storedUser && accessToken) {
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error("Error checking user login:", err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkLoggedIn()

        // Thêm event listener để bắt sự kiện login/logout
        window.addEventListener('storage', checkLoggedIn)
        return () => window.removeEventListener('storage', checkLoggedIn)
    }, [])

    // Fetch data from json-server
    // Fetch data from json-server
    useEffect(() => {
        // Nếu không có người dùng đăng nhập, không fetch dữ liệu
        if (!user) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [gamesResponse, purchasesResponse] = await Promise.all([
                    getGames(), // Fetch all games
                    getPurchases(), // Fetch all purchases
                ]);

                // Find user's purchased games
                const userPurchase = purchasesResponse.find(item =>
                    item.user_id.toString() === (user.id || "").toString() ||
                    item.user_id === Number(user.id) ||
                    item.userId === user.id
                );

                console.log("User:", user);
                console.log("Available purchases:", purchasesResponse);
                console.log("Found user purchase:", userPurchase);

                if (!userPurchase || !userPurchase.games_purchased) {
                    setProducts([]);
                    setBoughtItems([]);
                    setLoading(false);
                    return;
                }

                // Lấy danh sách game_id từ games_purchased
                const purchasedGames = userPurchase.games_purchased;
                const boughtGameIds = purchasedGames.map(purchase => purchase.game_id);
                console.log("Purchased game IDs:", boughtGameIds);

                setBoughtItems(boughtGameIds);

                // Get products that the user has purchased
                const boughtProducts = gamesResponse
                    .filter(game => {
                        const gameId = Number(game.id);
                        return boughtGameIds.some(id => {
                            const numId = Number(id);
                            return numId === gameId || id === game.id || id.toString() === game.id.toString();
                        });
                    })
                    .map(game => {
                        // Tìm thông tin mua hàng tương ứng với game
                        const purchaseInfo = purchasedGames.find(purchase =>
                            Number(purchase.game_id) === Number(game.id) ||
                            purchase.game_id === game.id
                        );

                        return {
                            ...game,
                            // Sử dụng purchased_at từ dữ liệu purchases
                            purchaseDate: purchaseInfo?.purchased_at?.$date
                                ? new Date(purchaseInfo.purchased_at.$date)
                                : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                            // Sử dụng price từ dữ liệu purchases
                            price: purchaseInfo?.price || game.price || 0,
                            status: ["delivered", "processing"][Math.floor(Math.random() * 2)],
                        };
                    });

                console.log("Processed bought products:", boughtProducts);
                setProducts(boughtProducts);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const filteredProducts = products.filter((product) => {
        // Lọc theo trạng thái
        const matchesStatus = statusFilter === "all" || product.status === statusFilter;

        // Lọc theo giá
        const price = product.price || 0;
        const matchesPrice =
            priceFilter === "all" ||
            (priceFilter === "under100k" && price < 100000) ||
            (priceFilter === "100k-300k" && price >= 100000 && price <= 300000) ||
            (priceFilter === "over300k" && price > 300000);

        // Lọc theo thể loại
        const tags = product.tags || [];
        const matchesCategory =
            categoryFilter === "all" ||
            (tags && tags.some(tag =>
                tag.toLowerCase().includes(categoryFilter.toLowerCase()) ||
                categoryFilter === "other" &&
                !["action", "adventure", "rpg", "strategy", "simulation"].some(genre =>
                    tag.toLowerCase().includes(genre)
                )
            ));

        return matchesStatus && matchesPrice && matchesCategory;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
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
                    <p className="text-purple-300">
                        {user && `${user.f_name} ${user.l_name} • `}{products.length} game đã mua
                    </p>

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

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-purple-900/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                            <SelectValue placeholder="Trạng thái đơn hàng" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="delivered" className="text-green-400">
                                Đã giao
                            </SelectItem>
                            <SelectItem value="processing" className="text-yellow-400">
                                Đang xử lý
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                        <SelectTrigger className="w-[180px] bg-purple-900/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                            <SelectValue placeholder="Mức giá" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                            <SelectItem value="all">Tất cả mức giá</SelectItem>
                            <SelectItem value="under100k">
                                Dưới 100.000₫
                            </SelectItem>
                            <SelectItem value="100k-300k">
                                100.000₫ - 300.000₫
                            </SelectItem>
                            <SelectItem value="over300k">
                                Trên 300.000₫
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-purple-900/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                            <SelectValue placeholder="Thể loại" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                            <SelectItem value="all">Tất cả thể loại</SelectItem>
                            <SelectItem value="action">
                                Hành động
                            </SelectItem>
                            <SelectItem value="adventure">
                                Phiêu lưu
                            </SelectItem>
                            <SelectItem value="rpg">
                                Nhập vai
                            </SelectItem>
                            <SelectItem value="strategy">
                                Chiến thuật
                            </SelectItem>
                            <SelectItem value="simulation">
                                Mô phỏng
                            </SelectItem>
                            <SelectItem value="other">
                                Thể loại khác
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        className="bg-purple-700 hover:bg-purple-600 text-white"
                        onClick={() => {
                            setStatusFilter("all");
                            setPriceFilter("all");
                            setCategoryFilter("all");
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
                                    setStatusFilter("all");
                                    setPriceFilter("all");
                                    setCategoryFilter("all");
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
                                    <div key={product.id} className="bg-purple-900/40 border border-purple-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 group">
                                        <div
                                            className="h-44 bg-cover bg-center relative"
                                            style={{ backgroundImage: `url(${product.thumbnail_image || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image'})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                                                <span className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full">
                                                    {product.details?.publisher || "Publisher"}
                                                </span>
                                                {product.tags?.slice(0, 1).map((tag) => (
                                                    <span key={tag} className="bg-pink-600/90 text-white text-xs px-2 py-1 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${product.status === "delivered" ? "bg-green-600/90 text-white" :
                                                    "bg-yellow-600/90 text-white"
                                                    }`}>
                                                    {statusMap[product.status]?.label || "Không xác định"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                                            <div className="text-sm text-purple-300 mt-1">
                                                Ngày mua: {format(product.purchaseDate, "dd/MM/yyyy", { locale: vi })}
                                            </div>
                                            <div className="mt-3 flex justify-between items-center">
                                                <div className="text-purple-200 font-medium">{formatCurrency(product.price || 0)}</div>
                                                <Button
                                                    className="text-xs h-8 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/30"
                                                >
                                                    Tải lại game
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="flex bg-purple-900/40 border border-purple-700/50 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 overflow-hidden">
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
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === "delivered" ? "bg-green-600/90 text-white" :
                                                            "bg-yellow-600/90 text-white"
                                                            }`}>
                                                            {statusMap[product.status]?.label || "Không xác định"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-purple-200 font-medium">{formatCurrency(product.price || 0)}</div>
                                                    <Button
                                                        className="text-xs h-8 mt-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                                                    >
                                                        Tải lại game
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