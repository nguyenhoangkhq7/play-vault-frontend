"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import { TrendingUpIcon, TrendingDownIcon, EyeIcon } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUser } from "../store/UserContext";
import {
  getRevenueSummary,
  getRevenueByGame,
  getMonthlyRevenue,
  getGameMonthlyRevenue,
} from "../api/revenue";

const timeRanges = [
  { value: "7days", label: "7 ngày qua" },
  { value: "30days", label: "30 ngày qua" },
  { value: "3months", label: "3 tháng qua" },
  { value: "6months", label: "6 tháng qua" },
  { value: "year", label: "Năm nay" },
  { value: "all", label: "Tất cả" },
];

export default function PublisherManagerRevenue() {
  const { user, setAccessToken } = useUser();

  // State cho data từ API
  const [summary, setSummary] = useState(null);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [gamesData, setGamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho filters
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("year");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedGameDetail, setSelectedGameDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Tính toán date range dựa trên selectedTimeRange
  const getDateRange = () => {
    const today = new Date();
    let fromDate = null;
    let toDate = today.toISOString().split("T")[0];

    switch (selectedTimeRange) {
      case "7days":
        fromDate = new Date(today.setDate(today.getDate() - 7))
          .toISOString()
          .split("T")[0];
        break;
      case "30days":
        fromDate = new Date(today.setDate(today.getDate() - 30))
          .toISOString()
          .split("T")[0];
        break;
      case "3months":
        fromDate = new Date(today.setMonth(today.getMonth() - 3))
          .toISOString()
          .split("T")[0];
        break;
      case "6months":
        fromDate = new Date(today.setMonth(today.getMonth() - 6))
          .toISOString()
          .split("T")[0];
        break;
      case "year":
        fromDate = `${new Date().getFullYear()}-01-01`;
        break;
      case "all":
        fromDate = null;
        toDate = null;
        break;
      default:
        fromDate = `${new Date().getFullYear()}-01-01`;
    }

    return { from: fromDate, to: toDate };
  };

  // Fetch data từ API
  const fetchRevenueData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { from, to } = getDateRange();
      const currentYear = new Date().getFullYear();

      // Fetch tất cả data song song
      const [summaryData, monthlyData, gamesDataRaw] = await Promise.all([
        getRevenueSummary(setAccessToken, { from, to }),
        getMonthlyRevenue(setAccessToken, currentYear),
        getRevenueByGame(setAccessToken, { from, to }),
      ]);

      setSummary(summaryData);

      // Transform monthly data để hiển thị trên chart
      const transformedMonthly = monthlyData.map((item) => ({
        month: `T${item.month}`,
        revenue: parseFloat(item.revenue || 0),
      }));

      // Đảm bảo có đủ 12 tháng (fill 0 cho tháng chưa có data)
      const fullYearData = [];
      for (let i = 1; i <= 12; i++) {
        const existing = transformedMonthly.find((m) => m.month === `T${i}`);
        fullYearData.push(existing || { month: `T${i}`, revenue: 0 });
      }
      setMonthlyRevenueData(fullYearData);

      // Transform games data - Backend đã GROUP BY rồi nên không cần group lại
      console.log("📊 Raw games data from API:", gamesDataRaw);
      console.log("📊 Number of games:", gamesDataRaw.length);
      
      const transformedGames = gamesDataRaw.map((item) => ({
        id: item.gameId,
        name: item.gameTitle,
        revenue: parseFloat(item.totalRevenue || 0),
        players: parseInt(item.totalOrders || 0), // Backend trả totalOrders
        orders: parseInt(item.totalOrders || 0),
        trend: 0, // TODO: Tính từ data kỳ trước
        status: "Hoạt động",
        monthlyData: fullYearData, // Dùng chung monthly data
      }));
      
      console.log("📊 Processed games:", transformedGames);

      setGamesData(transformedGames);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError(err.message || "Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTimeRange]);

  // Tính toán thống kê từ summary
  const totalRevenue = summary?.totalRevenue
    ? parseFloat(summary.totalRevenue)
    : 0;
  const totalPlayers = summary?.totalPlayers || 0;
  const totalGames = summary?.totalGames || 0;
  const avgRevenuePerGame = summary?.avgRevenuePerGame
    ? parseFloat(summary.avgRevenuePerGame)
    : 0;
  const growthPercent = summary?.growthPercent
    ? parseFloat(summary.growthPercent)
    : 0;

  // Bên trong component PublisherManagerRevenue(), thêm hàm:

  const exportToCSV = () => {
    const csvRows = [];

    // Thêm tiêu đề báo cáo
    csvRows.push("BÁO CÁO DOANH THU");
    csvRows.push("");

    // Thêm thống kê tổng quan
    csvRows.push("TỔNG QUAN");
    csvRows.push(`Tổng doanh thu,${totalRevenue.toLocaleString()} GCoin`);
    csvRows.push(`Số lượng mua,${totalPlayers.toLocaleString()}`);
    csvRows.push(`Số lượng game,${totalGames}`);
    csvRows.push(
      `TB doanh thu/game,${Math.round(avgRevenuePerGame).toLocaleString()} GCoin`
    );
    csvRows.push("");

    // Thêm doanh thu theo tháng
    csvRows.push("DOANH THU THEO THÁNG");
    csvRows.push("Tháng,Doanh thu");
    monthlyRevenueData.forEach((item) => {
      csvRows.push(`${item.month},${item.revenue} GCoin`);
    });
    csvRows.push("");

    // Thêm chi tiết từng game
    csvRows.push("CHI TIẾT DOANH THU THEO GAME");
    csvRows.push(
      "Tên game,Doanh thu,Số lượng mua,Xu hướng,Trạng thái"
    );
    filteredGames.forEach((game) => {
      csvRows.push(
        `${game.name},${game.revenue} GCoin,${game.players},${
          game.conversionRate
        }%,${game.trend > 0 ? "+" : ""}${game.trend}%,${game.status}`
      );
    });

    // Tạo blob và tải về
    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bao-cao-doanh-thu-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");

    const wb = XLSX.utils.book_new();

    // Sheet Tổng quan
    const summaryData = [
      ["BÁO CÁO DOANH THU"],
      [],
      ["TỔNG QUAN"],
      ["Tổng doanh thu", `${totalRevenue.toLocaleString()} GCoin`],
      ["Tổng số lượng mua", totalPlayers.toLocaleString()],
      ["Số lượng game", totalGames],
      [
        "TB doanh thu/game",
        `${Math.round(avgRevenuePerGame).toLocaleString()} GCoin`,
      ],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Tổng quan");

    // Sheet doanh thu theo tháng
    const monthlyData = [
      ["DOANH THU THEO THÁNG"],
      [],
      ["Tháng", "Doanh thu"],
      ...monthlyRevenueData.map((item) => [item.month, `${item.revenue} GCoin`]),
    ];
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, monthlySheet, "Doanh thu theo tháng");

    // Sheet chi tiết game
    const gamesDetailsData = [
      ["CHI TIẾT DOANH THU THEO GAME"],
      [],
      [
        "Tên game",
        "Doanh thu",
        "Só lượng mua",
        "Xu hướng",
        "Trạng thái",
      ],
      ...filteredGames.map((game) => [
        game.name,
        `${game.revenue} GCoin`,
        game.players,
        `${game.conversionRate}%`,
        `${game.trend > 0 ? "+" : ""}${game.trend}%`,
        game.status,
      ]),
    ];
    const gamesSheet = XLSX.utils.aoa_to_sheet(gamesDetailsData);
    XLSX.utils.book_append_sheet(wb, gamesSheet, "Chi tiết game");

    // Ghi file Excel
    XLSX.writeFile(
      wb,
      `bao-cao-doanh-thu-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const filteredGames = gamesData
    .filter((g) => selectedGame === "all" || g.id.toString() === selectedGame)
    .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleViewDetail = async (game) => {
    try {
      // Fetch monthly data cho game này
      const currentYear = new Date().getFullYear();
      const gameMonthlyData = await getGameMonthlyRevenue(setAccessToken, game.id, currentYear);
      
      // Transform data
      const transformedMonthly = gameMonthlyData.map((item) => ({
        month: `T${item.month}`,
        revenue: parseFloat(item.revenue || 0),
      }));
      
      // Fill đủ 12 tháng
      const fullYearData = [];
      for (let i = 1; i <= 12; i++) {
        const existing = transformedMonthly.find((m) => m.month === `T${i}`);
        fullYearData.push(existing || { month: `T${i}`, revenue: 0 });
      }
      
      setSelectedGameDetail({
        ...game,
        monthlyData: fullYearData, // Gán data riêng cho game này
      });
      setDetailDialogOpen(true);
    } catch (err) {
      console.error("Error fetching game detail:", err);
      // Fallback: vẫn hiển thị modal nhưng không có monthly data
      setSelectedGameDetail({
        ...game,
        monthlyData: [],
      });
      setDetailDialogOpen(true);
    }
  };

  // Show loading/error states
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">
          Vui lòng đăng nhập để xem báo cáo doanh thu
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Báo cáo doanh thu</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">Tổng doanh thu</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {totalRevenue.toLocaleString()} GCoin
            </p>
            <p
              className={`mt-1 flex items-center gap-1 text-sm ${
                growthPercent >= 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              {growthPercent >= 0 ? (
                <TrendingUpIcon className="w-4 h-4" />
              ) : (
                <TrendingDownIcon className="w-4 h-4" />
              )}
              {growthPercent >= 0 ? "+" : ""}
              {growthPercent.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">Tổng số lượng mua</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {totalPlayers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">Số lượng game</p>
            <p className="mt-2 text-3xl font-bold text-white">{totalGames}</p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80">TB doanh thu/game</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {Math.round(avgRevenuePerGame).toLocaleString()} GCoin
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Doanh thu theo tháng
          </h2>
          <AreaChart data={monthlyRevenueData} width={700} height={300}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => `${Number(value).toLocaleString()} GCoin`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#a78bfa"
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </div>

        {/* Games Revenue Table */}
        <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Chi tiết doanh thu theo game
          </h2>
          
          {/* Filters inside table section */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Bộ lọc thời gian */}
            <div className="relative group">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="appearance-none p-2 pr-8 rounded-lg bg-[#8130CD]/40 border border-white/20 
                   text-white focus:ring-2 focus:ring-[#8130CD] outline-none 
                   hover:bg-[#8130CD]/60 cursor-pointer transition-all"
                style={{ colorScheme: "dark" }}
              >
                {timeRanges.map((range) => (
                  <option
                    key={range.value}
                    value={range.value}
                    className="bg-[#8130CD] text-white"
                  >
                    {range.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Ô tìm kiếm */}
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 rounded-lg bg-[#8130CD]/40 text-white border border-white/20 
                 placeholder-white/50 focus:ring-2 focus:ring-[#8130CD] 
                 outline-none hover:bg-[#8130CD]/60 transition-all"
            />

            {/* Bộ lọc game */}
            <div className="relative group">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="appearance-none p-2 pr-8 rounded-lg bg-[#8130CD]/40 border border-white/20 
                   text-white focus:ring-2 focus:ring-[#8130CD] outline-none 
                   hover:bg-[#8130CD]/60 cursor-pointer transition-all"
                style={{ colorScheme: "dark" }}
              >
                <option value="all" className="bg-[#8130CD] text-white">
                  Tất cả game
                </option>
                {gamesData.map((game) => (
                  <option
                    key={game.id}
                    value={game.id.toString()}
                    className="bg-[#8130CD] text-white"
                  >
                    {game.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-3 text-left text-sm font-medium text-white/80">
                    Tên game
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">
                    Doanh thu
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">
                    Số lượng mua
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">
                    Xu hướng
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-white/80">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game) => (
                  <tr
                    key={game.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-4 text-white">{game.name}</td>
                    <td className="py-4 text-white">
                      {game.revenue.toLocaleString()} GCoin
                    </td>
                    <td className="py-4 text-white">
                      {game.players.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`flex items-center gap-1 ${
                          game.trend > 0 ? "text-green-300" : "text-red-300"
                        }`}
                      >
                        {game.trend > 0 ? (
                          <TrendingUpIcon className="w-4 h-4" />
                        ) : (
                          <TrendingDownIcon className="w-4 h-4" />
                        )}
                        {game.trend > 0 ? "+" : ""}
                        {game.trend}%
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        className="flex items-center gap-1 px-2 py-1 rounded border border-white/20 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => handleViewDetail(game)}
                      >
                        <EyeIcon className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
                Xuất báo cáo
              </DropdownMenu.Trigger>

              <DropdownMenu.Content className="mt-2 w-40 bg-white rounded shadow-lg border border-gray-200 overflow-hidden">
                <DropdownMenu.Item
                  onClick={exportToCSV}
                  className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Xuất file CSV
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={exportToExcel}
                  className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Xuất file Excel
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      {detailDialogOpen && selectedGameDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-4xl w-full bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Chi tiết doanh thu - {selectedGameDetail.name}
              </h2>
              <button
                onClick={() => setDetailDialogOpen(false)}
                className="text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/80">Tổng doanh thu</p>
                <p className="mt-2 text-2xl font-bold">
                  {selectedGameDetail.revenue.toLocaleString()} GCoin
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/80">Số lượng mua</p>
                <p className="mt-2 text-2xl font-bold">
                  {selectedGameDetail.players.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/80">Xu hướng</p>
                <p
                  className={`mt-2 flex items-center gap-1 text-2xl font-bold ${
                    selectedGameDetail.trend > 0
                      ? "text-green-300"
                      : "text-red-300"
                  }`}
                >
                  {selectedGameDetail.trend > 0 ? (
                    <TrendingUpIcon className="w-6 h-6" />
                  ) : (
                    <TrendingDownIcon className="w-6 h-6" />
                  )}
                  {selectedGameDetail.trend > 0 ? "+" : ""}
                  {selectedGameDetail.trend}%
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="mb-4 text-lg font-semibold">
                Doanh thu game này theo tháng
              </h3>
              {selectedGameDetail.monthlyData && selectedGameDetail.monthlyData.length > 0 ? (
                <BarChart
                  data={selectedGameDetail.monthlyData}
                  width={700}
                  height={300}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: "rgba(255,255,255,0.7)" }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => `${Number(value).toLocaleString()} GCoin`}
                  />
                  <Bar dataKey="revenue" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <p>Không có dữ liệu doanh thu theo tháng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
