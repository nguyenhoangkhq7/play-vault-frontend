import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function PublisherManageGame() {
  // -------------------- state demo --------------------
  const [gameDb, setGameDb] = useState({
    game1: {
      title: "Hành Trình Bất Tận",
      price: 99000,
      summary: "Roguelike pixel tốc độ cao.",
      genre: "Hành động",
      trailer: "https://youtu.be/xxxx",
      free: false,
      revenueByMonth: [12, 14, 18, 22, 24, 28, 26, 31, 29, 34, 36, 40],
      downloads: 12400,
      rating: 4.6,
      reviews: 1900,
      lastUpdated: "05/10/2025",
      status: "published",
    },
    game2: {
      title: "Chiến Binh Ánh Sáng",
      price: 149000,
      summary: "ARPG chặt chém co-op.",
      genre: "Nhập vai",
      trailer: "https://youtu.be/yyyy",
      free: false,
      revenueByMonth: [8, 10, 13, 12, 16, 18, 19, 21, 22, 24, 25, 27],
      downloads: 8200,
      rating: 4.3,
      reviews: 1200,
      lastUpdated: "03/10/2025",
      status: "reviewing",
    },
  });

  const [selectedGameKey, setSelectedGameKey] = useState("game1");
  const [selectedYear, setSelectedYear] = useState("2025");

  const [showModal, setShowModal] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    summary: "",
    genre: "",
    trailer: "",
    free: false,
  });

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // -------------------- helpers --------------------
  const formatCurrencyVND = (num) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);

  const formatNumber = (num) =>
    new Intl.NumberFormat("vi-VN").format(num);

  // chart effect
  useEffect(() => {
    const game = gameDb[selectedGameKey];
    if (!game) return;
    const data = game.revenueByMonth.map((v) => v * 1_000_000);
    const labels = [
      "01","02","03","04","05","06",
      "07","08","09","10","11","12",
    ];

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: `Doanh thu ${game.title} (${selectedYear})`,
              data,
              tension: 0.35,
              fill: true,
              backgroundColor: "rgba(236,72,153,0.20)",
              borderColor: "rgba(236,72,153,0.85)",
              borderWidth: 2,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: "#fff" },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => formatCurrencyVND(ctx.parsed.y),
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#D8B4FE" },
              grid: { color: "rgba(147,51,234,.25)" },
            },
            y: {
              ticks: {
                color: "#D8B4FE",
                callback: (v) =>
                  v >= 1_000_000 ? v / 1_000_000 + "M" : v,
              },
              grid: { color: "rgba(147,51,234,.15)" },
            },
          },
        },
      });
    }
  }, [selectedGameKey, selectedYear, gameDb]);

  // stats
  const stats = (() => {
    const g = gameDb[selectedGameKey];
    if (!g) return { downloads: 0, rating: 0, reviews: 0 };
    return {
      downloads: g.downloads,
      rating: g.rating,
      reviews: g.reviews,
    };
  })();

  // modal handlers
  const openEditModal = (key) => {
    const g = gameDb[key];
    if (!g) return;
    setEditKey(key);
    setEditForm({
      title: g.title,
      price: g.price,
      summary: g.summary,
      genre: g.genre,
      trailer: g.trailer,
      free: !!g.free,
    });
    setShowModal(true);
  };

  const saveEdit = () => {
    if (!editKey) return;
    if (!editForm.title.trim()) {
      alert("Tên game không được bỏ trống");
      return;
    }
    setGameDb((prev) => ({
      ...prev,
      [editKey]: {
        ...prev[editKey],
        title: editForm.title.trim(),
        price: parseInt(editForm.price || 0, 10),
        summary: editForm.summary.trim(),
        genre: editForm.genre,
        trailer: editForm.trailer.trim(),
        free: !!editForm.free,
      },
    }));
    setShowModal(false);
    alert("Đã lưu thay đổi (demo). Hãy nối API để cập nhật thực tế.");
  };

  const handleDelete = (key) => {
    const g = gameDb[key];
    if (!g) return;
    if (
      window.confirm(
        `Bạn có chắc muốn xóa "${g.title}"? (demo – cần gắn API thật)`
      )
    ) {
      alert("Đã xóa (demo).");
    }
  };

  const scrollToChart = (key) => {
    setSelectedGameKey(key);
    setTimeout(() => {
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        window.scrollTo({
          top: rect.top + window.scrollY - 120,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  // -------------------- JSX --------------------
  return (
    <div
      className="
        min-h-screen text-white font-sans
        bg-gradient-to-br from-purple-800 via-purple-700 to-purple-950
      "
    >
      {/* TOPBAR */}
      <header
        className="
          sticky top-0 z-40 h-14 flex items-center
          border-b border-purple-500/40
          bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900
          shadow-[0_0_15px_rgba(236,72,153,0.25)]
        "
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="m-0 text-sm font-semibold tracking-tight">
              Publisher – Quản lý game
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="
                flex items-center gap-2
                rounded-lg border border-purple-500/40
                bg-purple-900/40 px-2.5 py-1.5
                text-sm text-white/80
              "
            >
              <i className="bi bi-search text-white/50 text-xs" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="
                  w-40 bg-transparent text-xs text-white
                  placeholder-white/50 outline-none border-0
                "
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-[1200px] mx-auto px-4 pt-4 pb-12">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold">Quản lý Game</h2>

          <button
            className="
              inline-flex items-center gap-2
              rounded-xl px-3 py-2 text-sm font-semibold text-white
              shadow-[0_0_18px_rgba(236,72,153,0.25)]
              bg-gradient-to-r from-pink-600 to-purple-600
              hover:brightness-110 hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]
              active:scale-[0.98] transition
            "
          >
            <i className="bi bi-plus-lg text-base" />
            <span>Đăng tải game mới</span>
          </button>
        </div>

        {/* Game list + revenue summary */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Left: game list */}
          <div className="flex-1">
            <div
              className="
                rounded-2xl border border-purple-500/40
                bg-purple-900/40 p-4
                shadow-[0_0_25px_rgba(236,72,153,0.25)]
                backdrop-blur-xl
              "
            >
              <h5 className="text-base font-semibold mb-4">
                Danh sách game của bạn
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Game 1 */}
                <div
                  className="
                    rounded-2xl border border-purple-500/40
                    bg-purple-900/40 p-4
                    shadow-[0_0_25px_rgba(236,72,153,0.25)]
                    backdrop-blur-xl
                    transition hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]
                  "
                >
                  <div className="flex items-start mb-3">
                    <img
                      src="https://placehold.co/80x60"
                      alt="game1"
                      className="h-[60px] w-[80px] rounded-md mr-3 object-cover"
                    />
                    <div className="flex-1">
                      <h6 className="text-sm font-semibold leading-tight">
                        {gameDb.game1.title}
                      </h6>
                      <small className="text-[11px] text-white/50">
                        Cập nhật lần cuối: {gameDb.game1.lastUpdated}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="
                        text-green-400/90 bg-green-400/10
                        text-[11px] font-medium px-2 py-1 rounded-md
                      "
                    >
                      Đã xuất bản
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        className="
                          inline-flex items-center justify-center
                          h-8 w-8 rounded-lg border border-white/30
                          text-white/80 text-sm hover:bg-white/10
                          transition
                        "
                        onClick={() => openEditModal("game1")}
                      >
                        <i className="bi bi-pencil-square" />
                      </button>

                      <button
                        className="
                          inline-flex items-center justify-center
                          h-8 w-8 rounded-lg border border-white/30
                          text-white/80 text-sm hover:bg-white/10
                          transition
                        "
                        onClick={() => scrollToChart("game1")}
                      >
                        <i className="bi bi-graph-up" />
                      </button>

                      <button
                        className="
                          inline-flex items-center justify-center
                          h-8 w-8 rounded-lg border border-red-400/40
                          text-red-400 text-sm hover:bg-red-500/10
                          transition
                        "
                        onClick={() => handleDelete("game1")}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Game 2 */}
                <div
                  className="
                    rounded-2xl border border-purple-500/40
                    bg-purple-900/40 p-4
                    shadow-[0_0_25px_rgba(236,72,153,0.25)]
                    backdrop-blur-xl
                    transition hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]
                  "
                >
                  <div className="flex items-start mb-3">
                    <img
                      src="https://placehold.co/80x60"
                      alt="game2"
                      className="h-[60px] w-[80px] rounded-md mr-3 object-cover"
                    />
                    <div className="flex-1">
                      <h6 className="text-sm font-semibold leading-tight">
                        {gameDb.game2.title}
                      </h6>
                      <small className="text-[11px] text-white/50">
                        Cập nhật lần cuối: {gameDb.game2.lastUpdated}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="
                        text-yellow-400/90 bg-yellow-400/10
                        text-[11px] font-medium px-2 py-1 rounded-md
                      "
                    >
                      Đang duyệt
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        className="
                          inline-flex items-center justify-center
                          h-8 w-8 rounded-lg border border-white/30
                          text-white/80 text-sm hover:bg-white/10
                          transition
                        "
                        onClick={() => openEditModal("game2")}
                      >
                        <i className="bi bi-pencil-square" />
                      </button>

                      <button
                        className="
                          inline-flex items-center justify-center
                          h-8 w-8 rounded-lg border border-white/30
                          text-white/80 text-sm hover:bg-white/10
                          transition
                        "
                        onClick={() => scrollToChart("game2")}
                      >
                        <i className="bi bi-graph-up" />
                      </button>

                      <button
                        className="
                          inline-flex items-center justify-center
                          h-8 w-8 rounded-lg border border-red-400/40
                          text-red-400 text-sm hover:bg-red-500/10
                          transition
                        "
                        onClick={() => handleDelete("game2")}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* end game grid */}
            </div>
          </div>

          {/* Right: revenue summary */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div
              className="
                rounded-2xl border border-purple-500/40
                bg-purple-900/40 p-4 h-full
                shadow-[0_0_25px_rgba(236,72,153,0.25)]
                backdrop-blur-xl
              "
            >
              <h5 className="text-base font-semibold mb-4">
                Doanh thu tổng quan
              </h5>

              <div
                className="
                  rounded-xl border border-purple-500/40
                  bg-purple-950/40 text-center px-4 py-3 mb-3
                  text-purple-200 text-sm
                "
              >
                <h3 className="text-pink-300 text-lg font-semibold">
                  ₫ 15.240.000
                </h3>
                <p className="m-0 text-xs text-purple-200/80">
                  Tháng này
                </p>
              </div>

              <div
                className="
                  rounded-xl border border-purple-500/40
                  bg-purple-950/40 text-center px-4 py-3
                  text-purple-200 text-sm
                "
              >
                <h3 className="text-pink-300 text-lg font-semibold">
                  ₫ 92.480.000
                </h3>
                <p className="m-0 text-xs text-purple-200/80">
                  Tổng doanh thu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Reports */}
        <section className="mt-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
            {/* Chart */}
            <div className="flex-1">
              <div
                className="
                  rounded-2xl border border-purple-500/40
                  bg-purple-900/40 p-4
                  shadow-[0_0_25px_rgba(236,72,153,0.25)]
                  backdrop-blur-xl
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h5 className="text-base font-semibold m-0">
                    Doanh thu theo tháng
                  </h5>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="
                        text-sm text-white bg-transparent
                        border border-white/30 rounded-lg px-2 py-1
                        focus:outline-none focus:ring-2 focus:ring-pink-500/30
                        min-w-[200px]
                      "
                      value={selectedGameKey}
                      onChange={(e) => setSelectedGameKey(e.target.value)}
                    >
                      <option
                        className="bg-purple-900 text-white"
                        value="game1"
                      >
                        {gameDb.game1.title || "Game 1"}
                      </option>
                      <option
                        className="bg-purple-900 text-white"
                        value="game2"
                      >
                        {gameDb.game2.title || "Game 2"}
                      </option>
                    </select>

                    <select
                      className="
                        text-sm text-white bg-transparent
                        border border-white/30 rounded-lg px-2 py-1
                        focus:outline-none focus:ring-2 focus:ring-pink-500/30
                        w-[100px]
                      "
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option className="bg-purple-900 text-white" value="2025">
                        2025
                      </option>
                      <option className="bg-purple-900 text-white" value="2024">
                        2024
                      </option>
                    </select>
                  </div>
                </div>

                <canvas
                  ref={chartRef}
                  height="120"
                  className="w-full max-w-full"
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div
                className="
                  rounded-2xl border border-purple-500/40
                  bg-purple-900/40 p-4 h-full
                  shadow-[0_0_25px_rgba(236,72,153,0.25)]
                  backdrop-blur-xl
                "
              >
                <h5 className="text-base font-semibold mb-4">
                  Thống kê nhanh
                </h5>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div
                    className="
                      col-span-2 rounded-xl border border-purple-500/40
                      bg-purple-950/40 px-4 py-3
                      text-purple-200 text-sm
                    "
                  >
                    <p className="m-0 text-xs text-purple-200/80">
                      Lượt tải (tháng này)
                    </p>
                    <h3 className="text-pink-300 text-lg font-semibold">
                      {formatNumber(stats.downloads)}
                    </h3>
                  </div>

                  <div
                    className="
                      rounded-xl border border-purple-500/40
                      bg-purple-950/40 px-4 py-3
                      text-purple-200 text-sm
                    "
                  >
                    <p className="m-0 text-xs text-purple-200/80">
                      Đánh giá TB
                    </p>
                    <h3 className="text-pink-300 text-lg font-semibold">
                      {stats.rating?.toFixed(1)}★
                    </h3>
                  </div>

                  <div
                    className="
                      rounded-xl border border-purple-500/40
                      bg-purple-950/40 px-4 py-3
                      text-purple-200 text-sm
                    "
                  >
                    <p className="m-0 text-xs text-purple-200/80">
                      Lượt đánh giá
                    </p>
                    <h3 className="text-pink-300 text-lg font-semibold">
                      {formatNumber(stats.reviews)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal chỉnh sửa game */}
      {showModal && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4
          "
        >
          <div
            className="
              w-full max-w-xl max-h-[90vh] overflow-y-auto
              rounded-2xl border border-purple-400/40
              bg-[rgba(19,5,36,0.9)]
              shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_30px_rgba(236,72,153,0.3)]
              text-white backdrop-blur-xl
              p-6
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-base font-bold mb-1">
                  Cập nhật thông tin game
                </h5>
                <div className="text-xs text-white/60">
                  (demo - chưa gọi API)
                </div>
              </div>

              <button
                className="
                  text-white/70 hover:text-white
                  text-sm leading-none
                "
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <form
                className="grid gap-4 text-white text-sm md:grid-cols-2"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Tên game */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium mb-1">
                    Tên game
                  </label>
                  <input
                    className="
                      w-full rounded-lg border border-white/20 bg-black/30
                      px-3 py-2 text-sm text-white outline-none
                      focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                      focus:bg-purple-800/40 transition
                    "
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Giá */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium mb-1">
                    Giá (VND)
                  </label>
                  <input
                    className="
                      w-full rounded-lg border border-white/20 bg-black/30
                      px-3 py-2 text-sm text-white outline-none
                      focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                      focus:bg-purple-800/40 transition
                    "
                    type="number"
                    min={0}
                    step={1000}
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                  />
                </div>

                {/* Mô tả ngắn */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows={3}
                    className="
                      w-full rounded-lg border border-white/20 bg-black/30
                      px-3 py-2 text-sm text-white outline-none
                      focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                      focus:bg-purple-800/40 transition
                    "
                    value={editForm.summary}
                    onChange={(e) =>
                      setEditForm({ ...editForm, summary: e.target.value })
                    }
                  />
                </div>

                {/* Thể loại */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium mb-1">
                    Thể loại
                  </label>
                  <select
                    className="
                      w-full rounded-lg border border-white/20 bg-black/30
                      px-3 py-2 text-sm text-white outline-none
                      focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                      focus:bg-purple-800/40 transition
                    "
                    value={editForm.genre}
                    onChange={(e) =>
                      setEditForm({ ...editForm, genre: e.target.value })
                    }
                  >
                    <option className="bg-purple-900 text-white">
                      Hành động
                    </option>
                    <option className="bg-purple-900 text-white">
                      Phiêu lưu
                    </option>
                    <option className="bg-purple-900 text-white">
                      Nhập vai
                    </option>
                    <option className="bg-purple-900 text-white">
                      Chiến thuật
                    </option>
                    <option className="bg-purple-900 text-white">
                      Mô phỏng
                    </option>
                    <option className="bg-purple-900 text-white">
                      Thể thao
                    </option>
                    <option className="bg-purple-900 text-white">Indie</option>
                  </select>
                </div>

                {/* Trailer */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium mb-1">
                    Trailer (YouTube URL)
                  </label>
                  <input
                    className="
                      w-full rounded-lg border border-white/20 bg-black/30
                      px-3 py-2 text-sm text-white outline-none
                      focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30
                      focus:bg-purple-800/40 transition
                    "
                    type="url"
                    value={editForm.trailer}
                    onChange={(e) =>
                      setEditForm({ ...editForm, trailer: e.target.value })
                    }
                  />
                </div>

                {/* Miễn phí */}
                <div className="md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    id="editFree"
                    type="checkbox"
                    className="
                      h-4 w-4 rounded border-white/30 bg-black/30
                      text-pink-500
                      focus:ring-pink-500/40 focus:ring-offset-0
                    "
                    checked={editForm.free}
                    onChange={(e) =>
                      setEditForm({ ...editForm, free: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="editFree"
                    className="text-xs font-medium text-white/80"
                  >
                    Miễn phí
                  </label>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="
                  rounded-lg border border-white/40 px-3 py-2 text-sm font-medium
                  text-white hover:bg-white/10 hover:border-pink-500
                  transition
                "
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>

              <button
                className="
                  inline-flex items-center gap-2
                  rounded-xl px-3 py-2 text-sm font-semibold text-white
                  shadow-[0_0_18px_rgba(236,72,153,0.25)]
                  bg-gradient-to-r from-pink-600 to-purple-600
                  hover:brightness-110 hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]
                  active:scale-[0.98] transition
                "
                onClick={saveEdit}
              >
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
