import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
// [UPDATE] Import thêm icon Search
import { Pencil, LineChart, Trash, Search } from "lucide-react";
import publisherApi from "../api/publisherApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PublisherManageGame() {
  // --- [FIX LẠI] LẤY PUBLISHER ID CHUẨN ---
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.publisherId || user.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const PUBLISHER_ID = getUserFromStorage();
  const navigate = useNavigate();

  // --- TẠO DANH SÁCH NĂM ĐỘNG ---
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // -------------------- State --------------------
  const [games, setGames] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState(null);

  // --- [NEW] STATE CHO TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    price: "",
    shortDescription: "",
    description: "",
    categoryId: 1,
    trailerUrl: "",
    isFree: false,
  });

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // -------------------- Helpers --------------------
  const formatCurrencyVND = (num) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num || 0);

  const formatNumber = (num) => new Intl.NumberFormat("vi-VN").format(num || 0);

  const getGameInfo = (game, field) => {
    const info = game.gameBasicInfo || game.gameBasicInfos || game;
    return info[field];
  };

  const getGameName = (game) => getGameInfo(game, "name") || game.name || "Chưa có tên";
  const getGamePrice = (game) => {
    const price = getGameInfo(game, "price");
    return price !== undefined ? price : game.price || 0;
  };

  // --- HÀM RENDER TRẠNG THÁI GAME ĐỘNG ---
  const renderGameStatus = (game) => {
    const status = game.status || getGameInfo(game, "status") || "PENDING";
    switch (status) {
      case "APPROVED":
      case "PUBLISHED":
        return (
          <span className="text-green-400/90 bg-green-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">
            Đã xuất bản
          </span>
        );
      case "PENDING":
      case "REVIEWING":
        return (
          <span className="text-yellow-400/90 bg-yellow-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">
            Đang duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-red-400/90 bg-red-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="text-gray-400/90 bg-gray-400/10 text-xs font-medium px-2.5 py-1.5 rounded-md">
            {status}
          </span>
        );
    }
  };

  // -------------------- Fetch Data --------------------
  useEffect(() => {
    if (!PUBLISHER_ID) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, gamesRes, catsRes] = await Promise.all([
          publisherApi.getDashboardStats(PUBLISHER_ID),
          publisherApi.getGames(PUBLISHER_ID),
          publisherApi.getCategories().catch(() => []),
        ]);

        setDashboardStats(statsRes);
        setGames(gamesRes);
        setCategories(catsRes);

        if (gamesRes && gamesRes.length > 0) {
          setSelectedGameId(gamesRes[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error("Lỗi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [PUBLISHER_ID]);

  // Load Chart
  useEffect(() => {
    if (!PUBLISHER_ID) return;
    const fetchChart = async () => {
      try {
        const res = await publisherApi.getRevenueChart(PUBLISHER_ID, Number(selectedYear));
        setChartData(res);
      } catch (error) {
        console.error("Lỗi tải biểu đồ:", error);
      }
    };
    fetchChart();
  }, [PUBLISHER_ID, selectedYear]);

  // Render Chart
  useEffect(() => {
    if (!chartRef.current) return;
    const labels = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const dataPoints = labels.map((_, index) => {
      const month = index + 1;
      const found = chartData.find((item) => item.month === month);
      return found ? found.revenue : 0;
    });

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Doanh thu (${selectedYear})`,
            data: dataPoints,
            tension: 0.35,
            fill: true,
            backgroundColor: "rgba(236,72,153,0.20)",
            borderColor: "rgba(236,72,153,0.85)",
            borderWidth: 2,
            pointRadius: 4, // [UPDATE] Tăng kích thước điểm biểu đồ
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // [UPDATE] Để chart tự fill chiều cao
        plugins: {
          legend: { labels: { color: "#fff", font: { size: 14 } } }, // [UPDATE] Tăng font legend
          tooltip: {
            callbacks: { label: (ctx) => formatCurrencyVND(ctx.parsed.y) },
            titleFont: { size: 14 },
            bodyFont: { size: 14 },
          },
        },
        scales: {
          x: {
            ticks: { color: "#D8B4FE", font: { size: 12 } },
            grid: { color: "rgba(147,51,234,.25)" },
          },
          y: {
            ticks: {
              color: "#D8B4FE",
              font: { size: 12 },
              callback: (v) => (v >= 1_000_000 ? v / 1_000_000 + "M" : v),
            },
            grid: { color: "rgba(147,51,234,.15)" },
          },
        },
      },
    });
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartData, selectedYear]);

  // -------------------- Handlers --------------------
  const openEditModal = (game) => {
    const info = game.gameBasicInfo || game.gameBasicInfos || game;
    let catId = 1;
    if (game.categoryId) catId = game.categoryId;
    else if (info.category && info.category.id) catId = info.category.id;
    else if (info.categoryId) catId = info.categoryId;

    setEditForm({
      id: game.id,
      name: info.name || "",
      price: info.price !== undefined ? info.price : 0,
      shortDescription: info.shortDescription || "",
      description: info.description || "",
      categoryId: catId,
      trailerUrl: info.trailerUrl || "",
      isFree: info.price === 0,
    });
    setShowModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.warning("Tên game không được bỏ trống");
      return;
    }
    try {
      const payload = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        shortDescription: editForm.shortDescription,
        description: editForm.description,
        categoryId: parseInt(editForm.categoryId),
        trailerUrl: editForm.trailerUrl,
        isFree: editForm.isFree,
      };
      await publisherApi.updateGame(PUBLISHER_ID, editForm.id, payload);
      toast.success("Cập nhật thành công!");
      setShowModal(false);
      const updatedGames = await publisherApi.getGames(PUBLISHER_ID);
      setGames(updatedGames);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Cập nhật thất bại.");
    }
  };

  // const handleDelete = async (game) => {
  //   const gameName = getGameName(game);
  //   if (window.confirm(`Bạn có chắc muốn xóa "${gameName}"? Hành động này không thể hoàn tác.`)) {
  //     try {
  //       await publisherApi.deleteGame(PUBLISHER_ID, game.id);
  //       toast.success(`Đã xóa game "${gameName}"`);
  //       setGames((prevGames) => prevGames.filter((g) => g.id !== game.id));
  //       if (selectedGameId === game.id) {
  //          setSelectedGameId(null);
  //       }
  //     } catch (error) {
  //       console.error("Lỗi xóa game:", error);
  //       toast.error("Xóa thất bại! Có thể game đang có đơn hàng.");
  //     }
  //   }
  // };

  const scrollToChart = (gameId) => {
    setSelectedGameId(gameId);
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // --- [NEW] LOGIC LỌC GAME THEO TỪ KHÓA ---
  const filteredGames = games.filter((game) => {
    if (!searchTerm.trim()) return true; // Không nhập gì thì hiện hết
    const gameName = getGameName(game).toLowerCase();
    return gameName.includes(searchTerm.toLowerCase());
  });


  // -------------------- JSX --------------------
  if (!PUBLISHER_ID) return <div className="text-white p-10 text-center bg-purple-950 h-screen pt-20 text-lg">Vui lòng đăng nhập tài khoản Publisher.</div>;
  if (loading) return <div className="text-white p-10 text-center bg-purple-950 h-screen pt-20 text-lg">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen text-white font-sans bg-gradient-to-br from-purple-800 via-purple-700 to-purple-950">

      {/* HEADER - [UPDATE] Tăng chiều cao và thêm thanh tìm kiếm */}
      <header className="sticky top-0 z-40 h-16 lg:h-20 flex items-center border-b border-purple-500/40 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 shadow-md">
        {/* [UPDATE] Tăng max-width container */}
        <div className="w-full max-w-[1350px] mx-auto px-6 flex justify-between items-center gap-4">
          <h1 className="font-bold text-xl lg:text-2xl shrink-0">Publisher – Quản lý game</h1>

          {/* --- [NEW] THANH TÌM KIẾM --- */}
          <div className="flex-1 max-w-md relative hidden md:block">
             <span className="absolute inset-y-0 left-3 flex items-center text-purple-300">
                <Search size={20} />
             </span>
             <input
                type="text"
                placeholder="Tìm kiếm game của bạn..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-purple-900/50 border border-purple-500/30 text-white placeholder-purple-300/70 outline-none focus:border-pink-500/50 focus:bg-purple-900/80 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

        
        </div>
      </header>

      {/* MAIN CONTENT - [UPDATE] Tăng padding và max-width */}
      <main className="w-full max-w-[1350px] mx-auto px-6 pt-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold">Quản lý Game</h2>
          {/* [UPDATE] Nút to hơn */}
          <button
            onClick={() => navigate("/publisher/upload")}
            className="rounded-xl px-5 py-3 text-base font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg hover:brightness-110 transition-all flex items-center"
          >
            <i className="bi bi-plus-lg mr-2 text-lg" /> Đăng tải game mới
          </button>
        </div>

        {/* [NEW] Thanh tìm kiếm cho mobile (chỉ hiện khi màn hình nhỏ) */}
         <div className="mb-6 relative md:hidden">
             <span className="absolute inset-y-0 left-3 flex items-center text-purple-300">
                <Search size={20} />
             </span>
             <input
                type="text"
                placeholder="Tìm kiếm game..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-900/50 border border-purple-500/30 text-white placeholder-purple-300/70 outline-none focus:border-pink-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">

          {/* --- DANH SÁCH GAME --- */}
          <div className="flex-1">
            {/* [UPDATE] Tăng padding container */}
            <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 p-6 shadow-xl backdrop-blur-xl h-full">
              <h5 className="text-xl font-bold mb-6">Danh sách game của bạn ({filteredGames.length})</h5>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* [UPDATE] Sử dụng filteredGames thay vì games */}
                {filteredGames.map((game) => (
                  // [UPDATE] Tăng padding card game
                  <div key={game.id} className="rounded-2xl border border-purple-500/40 bg-purple-900/40 p-5 shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start mb-4">
                      {/* [UPDATE] Tăng kích thước ảnh thumbnail */}
                      <img
                        src={getGameInfo(game, "thumbnail") || "https://placehold.co/100x75"}
                        alt={getGameName(game)}
                        className="h-[75px] w-[100px] rounded-lg mr-4 object-cover shadow-sm"
                      />
                      <div className="flex-1">
                        {/* [UPDATE] Tăng font size tên game */}
                        <h6 className="text-base lg:text-lg font-bold leading-tight line-clamp-2 mb-1">
                          {getGameName(game)}
                        </h6>
                        <small className="text-sm text-purple-200/80 block">
                          Giá: <span className="text-pink-300 font-semibold">{getGamePrice(game) === 0 ? "Miễn phí" : formatCurrencyVND(getGamePrice(game))}</span>
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {renderGameStatus(game)}

                      <div className="flex items-center gap-3">
                        {/* [UPDATE] Nút chức năng to hơn xíu */}
                        <button onClick={() => openEditModal(game)} className="h-9 w-9 rounded-lg border border-white/30 bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors" title="Chỉnh sửa">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => scrollToChart(game.id)} className="h-9 w-9 rounded-lg border border-white/30 bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors" title="Xem biểu đồ">
                          <LineChart size={18} />
                        </button>
                        {/* <button onClick={() => handleDelete(game)} className="h-9 w-9 rounded-lg border border-red-400/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors" title="Xóa">
                          <Trash size={18} />
                        </button> */}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredGames.length === 0 && (
                    <div className="col-span-full text-center p-8 text-white/60 text-lg italic border border-dashed border-purple-500/30 rounded-xl">
                        {searchTerm ? "Không tìm thấy game nào phù hợp." : "Chưa có game nào."}
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* --- DASHBOARD THỐNG KÊ --- */}
          {/* [UPDATE] Tăng chiều rộng cột bên phải */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 p-6 h-full shadow-xl backdrop-blur-xl flex flex-col">
              <h5 className="text-xl font-bold mb-6">Doanh thu tổng quan</h5>

              {/* [UPDATE] Tăng padding và font size các box thống kê */}
              <div className="flex-1 flex flex-col gap-5">
                  <div className="rounded-2xl border border-purple-500/40 bg-purple-950/40 text-center px-6 py-5 shadow-inner">
                    <h3 className="text-pink-300 text-3xl font-bold mb-1">
                      {formatCurrencyVND(dashboardStats?.monthlyRevenue)}
                    </h3>
                    <p className="m-0 text-base text-purple-200">Tháng này</p>
                  </div>

                  <div className="rounded-2xl border border-purple-500/40 bg-purple-950/40 text-center px-6 py-5 shadow-inner">
                    <h3 className="text-pink-300 text-3xl font-bold mb-1">
                       {formatCurrencyVND(dashboardStats?.totalRevenue)}
                    </h3>
                    <p className="m-0 text-base text-purple-200">Tổng doanh thu</p>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BIỂU ĐỒ & THỐNG KÊ NHANH --- */}
        <section className="mt-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">

            {/* Chart */}
            <div className="flex-1">
              {/* [UPDATE] Tăng padding */}
              <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 p-6 shadow-xl backdrop-blur-xl h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h5 className="text-xl font-bold m-0">Doanh thu theo tháng</h5>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* [UPDATE] Dropdown to hơn */}
                    <select
                      className="text-base text-white bg-purple-950/50 border border-white/30 rounded-xl px-3 py-2 outline-none min-w-[220px] focus:border-pink-500/50 transition-all"
                      value={selectedGameId || ""}
                      onChange={(e) => setSelectedGameId(Number(e.target.value))}
                    >
                      <option className="bg-purple-900" value="">-- Tất cả game --</option>
                      {games.map(g => (
                          <option key={g.id} className="bg-purple-900" value={g.id}>{getGameName(g)}</option>
                      ))}
                    </select>

                    <select
                      className="text-base text-white bg-purple-950/50 border border-white/30 rounded-xl px-3 py-2 outline-none w-[110px] focus:border-pink-500/50 transition-all"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {yearOptions.map(year => (
                        <option key={year} className="bg-purple-900" value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* [UPDATE] Tăng chiều cao container chứa biểu đồ */}
                <div className="h-[350px] w-full">
                    <canvas ref={chartRef} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
             {/* [UPDATE] Tăng chiều rộng cột bên phải */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 p-6 h-full shadow-xl backdrop-blur-xl">
                <h5 className="text-xl font-bold mb-6">Thống kê nhanh</h5>
                <div className="grid grid-cols-2 gap-5 text-center h-full content-start">
                  {/* [UPDATE] Tăng padding và font size các box nhỏ */}
                  <div className="col-span-2 rounded-2xl border border-purple-500/40 bg-purple-950/40 px-5 py-4 shadow-inner">
                    <p className="m-0 text-sm text-purple-200 mb-1">Lượt tải (tháng này)</p>
                    <h3 className="text-pink-300 text-2xl font-bold">{formatNumber(dashboardStats?.monthlyDownloads)}</h3>
                  </div>
                  <div className="rounded-2xl border border-purple-500/40 bg-purple-950/40 px-5 py-4 shadow-inner">
                    <p className="m-0 text-sm text-purple-200 mb-1">Đánh giá TB</p>
                    <h3 className="text-pink-300 text-2xl font-bold flex items-center justify-center gap-1">
                        {dashboardStats?.averageRating || 0} <span className="text-yellow-400 text-xl">★</span>
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-purple-500/40 bg-purple-950/40 px-5 py-4 shadow-inner">
                    <p className="m-0 text-sm text-purple-200 mb-1">Lượt đánh giá</p>
                    <h3 className="text-pink-300 text-2xl font-bold">{formatNumber(dashboardStats?.totalRatings)}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- MODAL (Cũng tăng kích thước) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          {/* [UPDATE] Tăng max-width modal */}
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-400/40 bg-[rgba(25,10,45,0.95)] p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <h5 className="text-2xl font-bold text-white">Cập nhật thông tin game</h5>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-colors">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div className="mt-4">
              <form className="grid gap-6 text-white text-base md:grid-cols-2">
                {/* [UPDATE] Tăng padding và font size input */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Tên game</label>
                  <input
                    className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Giá (VND)</label>
                  <input
                    className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="number"
                    value={editForm.price}
                    disabled={editForm.isFree}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Mô tả ngắn</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all resize-none"
                    value={editForm.shortDescription}
                    onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-2 text-purple-200">Thể loại</label>
                  <select
                    className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all appearance-none"
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                  >
                    {categories.length > 0 ? (
                        categories.map(c => (
                            <option key={c.id} className="bg-purple-950" value={c.id}>{c.name}</option>
                        ))
                    ) : (
                        <>
                            <option className="bg-purple-950" value="1">Hành động</option>
                            <option className="bg-purple-950" value="2">Nhập vai</option>
                        </>
                    )}
                  </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-semibold mb-2 text-purple-200">Trailer (Youtube URL)</label>
                    <input
                         className="w-full rounded-xl border border-purple-500/30 bg-purple-900/50 px-4 py-3 text-white outline-none focus:border-pink-500 transition-all"
                         value={editForm.trailerUrl}
                         onChange={(e) => setEditForm({ ...editForm, trailerUrl: e.target.value })}
                    />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-2 p-4 rounded-xl bg-purple-900/30 border border-purple-500/20">
                  <input
                    id="editFree"
                    type="checkbox"
                    className="h-5 w-5 rounded border-purple-500/50 bg-purple-900/50 text-pink-600 focus:ring-pink-500/40 transition-all"
                    checked={editForm.isFree}
                    onChange={(e) => setEditForm({ ...editForm, isFree: e.target.checked, price: e.target.checked ? 0 : editForm.price })}
                  />
                  <label htmlFor="editFree" className="text-base font-medium text-white cursor-pointer select-none">Đặt làm game Miễn phí</label>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-white/30 px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-all">Hủy bỏ</button>
              <button onClick={saveEdit} className="rounded-xl px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg hover:shadow-pink-500/30 hover:brightness-110 transition-all">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}