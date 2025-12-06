"use client";

import {
  TrendingUp,
  Filter,
  ArrowUpDown,
  Search,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchGameRevenue } from "../../api/report";

export default function GameRevenueBreakdown({ dateFilter }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const [gameSearchQuery, setGameSearchQuery] = useState("");

  // Hàm tạo màu giả định dựa trên category (vì API chưa trả về màu)
  const getCategoryColor = (cat) => {
    const map = {
      Action: "from-orange-500 to-red-600",
      RPG: "from-purple-500 to-pink-600",
      Strategy: "from-blue-500 to-cyan-600",
      Horror: "from-red-900 to-gray-800",
      Sports: "from-green-500 to-teal-600",
    };
    return map[cat] || "from-indigo-500 to-purple-600";
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchGameRevenue(dateFilter.from, dateFilter.to);

        // Map dữ liệu API sang format UI
        const mappedData = res.map((item) => ({
          id: item.gameId,
          name: item.name,
          revenue: item.revenue,
          sales: item.sales,
          category: item.category || "Other",
          image: item.thumbnail || "/placeholder-game.jpg", // Fallback nếu thumbnail null
          trend: 0, // Backend chưa hỗ trợ trend từng game
          color: getCategoryColor(item.category),
        }));
        setGames(mappedData);
      } catch (error) {
        console.error("Lỗi tải danh sách game:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    if (dateFilter.from && dateFilter.to) loadData();
  }, [dateFilter]);

  // Logic lọc và sắp xếp (Client-side)
  let filtered = games.filter((g) =>
    g.name.toLowerCase().includes(gameSearchQuery.toLowerCase())
  );
  if (selectedCategory !== "all")
    filtered = filtered.filter((g) => g.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "sales") return b.sales - a.sales;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const displayed = showAll ? sorted : sorted.slice(0, 8);
  const totalRevenue = filtered.reduce((sum, g) => sum + g.revenue, 0);
  const totalSales = filtered.reduce((sum, g) => sum + g.sales, 0);

  // Lấy danh sách category unique từ data
  const uniqueCategories = [...new Set(games.map((g) => g.category))];

  if (loading)
    return (
      <div className="text-white p-6 animate-pulse">
        Đang tải dữ liệu game...
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-purple-700/50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Doanh thu theo Game
          </h3>
          <p className="text-pink-200 text-sm">
            {dateFilter.label} • {games.length} game có doanh thu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <Search className="h-4 w-4 text-pink-400" />
            <input
              type="text"
              placeholder="Tìm kiếm game..."
              value={gameSearchQuery}
              onChange={(e) => setGameSearchQuery(e.target.value)}
              className="bg-transparent text-white text-sm outline-none placeholder-purple-300 min-w-[150px]"
            />
          </div>

          {/* Dynamic Category Filter */}
          <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <Filter className="h-4 w-4 text-pink-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              <option value="all" className="bg-purple-950">
                Tất cả thể loại
              </option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-purple-950">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <ArrowUpDown className="h-4 w-4 text-pink-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              <option value="revenue" className="bg-purple-950">
                Doanh thu cao nhất
              </option>
              <option value="sales" className="bg-purple-950">
                Lượt bán nhiều nhất
              </option>
              <option value="name" className="bg-purple-950">
                Tên A-Z
              </option>
            </select>
          </div>

          {/* Tổng */}
          <div className="text-right bg-purple-950/60 px-4 py-2 rounded-lg border border-purple-600/50">
            <div className="text-lg font-bold text-white">
              {`${new Intl.NumberFormat("fr-FR").format(totalRevenue)} GCoin`}
            </div>
            <div className="text-pink-200 text-xs">
              {totalSales.toLocaleString()} lượt bán
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayed.map((game) => (
          <div
            key={game.id}
            className="bg-purple-950/40 backdrop-blur-sm rounded-lg p-4 border border-purple-600/30 hover:border-purple-500/50 transition-all hover:scale-105"
          >
            <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
              <img
                src={game.image}
                alt={game.name}
                className="object-cover w-full h-full rounded-lg"
                onError={(e) =>
                  (e.target.src = "https://placehold.co/600x400?text=No+Image")
                }
              />
              {/* Có thể thêm badge nếu muốn */}
            </div>

            <h4
              className="text-white font-semibold mb-1 text-sm line-clamp-1"
              title={game.name}
            >
              {game.name}
            </h4>
            <div className="text-lg font-bold text-white">
              {`${new Intl.NumberFormat("fr-FR").format(game.revenue)} GCoin`}
            </div>
            <div className="text-pink-200 text-xs">
              {game.sales.toLocaleString()} lượt bán
            </div>
          </div>
        ))}
        {displayed.length === 0 && (
          <p className="text-pink-200 col-span-4 text-center py-4">
            Không có dữ liệu trong khoảng thời gian này.
          </p>
        )}
      </div>

      {/* Nút xem thêm */}
      {sorted.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 bg-purple-950/60 hover:bg-purple-900/60 px-6 py-3 rounded-lg font-semibold text-white border border-purple-600/50 hover:border-purple-500/70 transition-all duration-200"
          >
            {showAll ? "Thu gọn" : `Xem tất cả (${sorted.length} game)`}
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                showAll ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
