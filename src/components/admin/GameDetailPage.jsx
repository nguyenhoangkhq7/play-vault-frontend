import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, X, Loader2, AlertCircle } from "lucide-react";
import adminGamesApi from "../../api/adminGames"; // Import API

export function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // 1. Fetch Data từ API
  useEffect(() => {
    const fetchGameDetail = async () => {
      setLoading(true);
      try {
        const response = await adminGamesApi.getGameDetail(id);
        console.log(response.data);
        setGameData(response.data || response);
      } catch (err) {
        console.error("Failed to fetch game:", err);
        setError("Không thể tải thông tin game.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchGameDetail();
  }, [id]);

  // 2. Xử lý Duyệt Game
  const handleApprove = async () => {
    const gameName = gameData.name || gameData.title || "game này";
    if (window.confirm(`Bạn có chắc chắn muốn duyệt game "${gameName}"?`)) {
      try {
        await adminGamesApi.approveGame(id);
        alert(`✅ Duyệt thành công!`);
        navigate("/admin/games");
      } catch (err) {
        console.error(err);
        alert("❌ Có lỗi xảy ra khi duyệt game.");
      }
    }
  };

  // 3. Xử lý Từ chối Game
  const handleReject = async () => {
    if (!rejectionReason.trim()) return alert("Vui lòng nhập lý do từ chối");
    try {
      await adminGamesApi.rejectGame(id, rejectionReason);
      alert(`❌ Game đã bị từ chối.\nLý do: ${rejectionReason}`);
      setIsRejectionModalOpen(false);
      setRejectionReason("");
      navigate("/admin/games");
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi xảy ra khi từ chối game.");
    }
  };

  // Helper: Lấy trạng thái
  const resolveStatus = (data) => {
    if (!data) return "";
    const status =
      data.submissionStatus || data.submission?.status || data.status;
    return String(status || "").toUpperCase();
  };

  // Helper Styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "APPROVED":
      case "ACTIVE":
        return "bg-green-500/20 text-green-300 border-green-500/40";
      case "REJECTED":
      case "INACTIVE":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/40";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "ACTIVE":
        return "Đang hoạt động";
      case "REJECTED":
        return "Từ chối";
      case "INACTIVE":
        return "Ngưng hoạt động";
      default:
        return status || "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    try {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // --- RENDER LOADING & ERROR ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center text-center">
        <div>
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            {error || "Game không tồn tại"}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // --- XỬ LÝ DỮ LIỆU & BIẾN (MAPPING VARIABLES) ---
  const gbi = gameData.gameBasicInfo || gameData.basicInfo || gameData;

  // === 1. Hàm Helper xử lý ảnh (Online + Local) ===
  const getImageUrl = (imgData) => {
    if (!imgData) return "https://via.placeholder.com/800x400";
    const urlCandidates = [
      typeof imgData === "object" ? imgData.url : imgData,
      typeof imgData === "object" ? imgData.imageUrl : null,
      typeof imgData === "object" ? imgData.link : null,
      typeof imgData === "object" ? imgData.src : null,
      typeof imgData === "object" ? imgData.path : null,
    ].filter(Boolean);

    let url = urlCandidates.find((u) => u);
    if (!url) return "https://via.placeholder.com/800x400";

    const normalizeDrive = (rawUrl) => {
      if (typeof rawUrl !== "string") return null;
      const idFromSlash = rawUrl.match(/\/d\/([\w-]+)/);
      const idFromQuery = rawUrl.match(/[?&]id=([\w-]+)/);
      const driveId = idFromSlash?.[1] || idFromQuery?.[1];
      if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}=s1600`;
      const lh3Id = rawUrl.match(/lh3\.googleusercontent\.com\/d\/([\w-]+)/);
      if (lh3Id?.[1]) return `https://lh3.googleusercontent.com/d/${lh3Id[1]}=s1600`;
      return null;
    };

    const driveUrl = normalizeDrive(url);
    if (driveUrl) url = driveUrl;

    if (typeof url === "string" && url.startsWith("http://")) {
      url = "https://" + url.slice(7);
    }

    if (typeof url === "string" && url.startsWith("https://")) {
      return url;
    }

    return `http://localhost:8080/uploads/${url}`;
  };

  // === 2. Hàm Helper xử lý YouTube (Fix lỗi X-Frame-Options) ===
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // Regex lấy ID video youtube từ mọi dạng link
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    // Nếu tìm thấy ID hợp lệ (11 ký tự) -> trả về link embed
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url; // Trả về gốc nếu không phải youtube
  };

  // --- Áp dụng Helper ---
  const title = gbi.name || gameData.name || gbi.title || "No Title";
  const image = getImageUrl(
    gbi.thumbnail || gameData.thumbnail || gameData.image || gameData.coverImage
  );

  const developer = gbi.developer || gameData.developer || "Unknown Dev";
  const publisher = gbi.publisher || gameData.publisher || "Unknown Publisher";
  const description =
    gbi.description || gameData.description || "Chưa có mô tả.";

  // Xử lý Video URL bằng hàm mới
  const rawVideoUrl =
    gbi.trailerUrl || gameData.trailerUrl || gameData.videoUrl;
  const videoUrl = getEmbedUrl(rawVideoUrl);

  const genres = Array.isArray(gbi.category)
    ? gbi.category
    : [gbi.category?.name || gbi.category || "General"];

  const platform = Array.isArray(gbi.platforms)
    ? gbi.platforms.map((p) => p.name || p)
    : Array.isArray(gameData.platform)
    ? gameData.platform
    : [gameData.platform || "PC"];

  const reqs =
    gbi.systemRequirement ||
    gameData.systemRequirements ||
    gameData.minimumRequirements ||
    {};
  const price = gbi.price ?? gameData.price ?? 0;
  const requireAged =
    gbi.requiredAge ?? gameData.requiredAge ?? gameData.requireAged ?? "12";

  // Xử lý Screenshots bằng hàm mới
  // ⭐ Screenshots: chấp nhận cả mảng string lẫn mảng object {url}
  // ---- LẤY ẢNH SCREENSHOTS ĂN CHẮC ----
  const raw =
    gbi?.previewImages ??
    gameData.previewImages ??
    gameData.screenshots ??
    gameData.gallery ??
    [];

  // ép về mảng (nếu backend trả string, ví dụ "url1,url2 url3")
  const ensureArray = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return v.split(/[,\s]+/).filter(Boolean);
    return [];
  };

  const normalize = (u) => {
    if (!u) return null;
    let s = String(u).trim();
    if (s.startsWith("http://")) s = "https://" + s.slice(7); // tránh mixed-content
    return s;
  };

  const screenshots = ensureArray(raw)
    .map((it) => {
      if (typeof it === "string") return normalize(it);
      // lấy đúng field đang lưu trong DB
      return (
        normalize(it?.url) ||
        normalize(it?.imageUrl) || // <— thường gặp với link lh3.googleusercontent
        normalize(it?.link) ||
        normalize(it?.src) ||
        normalize(it?.path) ||
        null
      );
    })
    .filter(Boolean);

  const currentStatus = resolveStatus(gameData);
  const isApproved = currentStatus === "APPROVED" || currentStatus === "ACTIVE";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-gray-200">
      {/* HEADER */}
      <header className="sticky top-0 z-0 bg-slate-950/70 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-purple-500/10 rounded-lg transition"
          >
            <ChevronLeft className="h-6 w-6 text-purple-400" />
          </button>
          <h1 className="text-xl font-semibold text-white">Chi tiết Game</h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Image */}
          <div className="relative group overflow-hidden rounded-2xl border border-purple-500/30">
            <img
              src={image}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {videoUrl && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Play className="h-16 w-16 text-purple-400" />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">{title}</h2>
            <p className="text-purple-300 mb-4">
              {developer} • {publisher}
            </p>
            <div className="flex flex-wrap gap-2">
              {genres.map((g, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-sm"
                >
                  {typeof g === "object" ? g.name : g}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">Mô tả</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Ảnh chụp màn hình
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {screenshots.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className="group relative overflow-hidden rounded-lg border border-purple-500/30"
                  >
                    <img
                      src={img}
                      referrerPolicy="no-referrer"
                      className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={`Screenshot ${i + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Play className="h-6 w-6 text-purple-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trailer (ĐÃ SỬA: Dùng iframe với link embed) */}
          {videoUrl && (
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
              <div className="relative aspect-video border border-purple-500/30 rounded-xl overflow-hidden group">
                <iframe
                  src={videoUrl}
                  title="Trailer"
                  allowFullScreen
                  className="w-full h-full"
                />
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-red-600/90 border-2 border-white rounded-lg shadow-lg backdrop-blur-sm">
                    <span className="text-white font-extrabold text-lg leading-none drop-shadow-md">
                      {requireAged}+
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <h3 className="text-sm uppercase text-gray-400 mb-3 font-semibold">
              Trạng thái
            </h3>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusStyle(
                currentStatus
              )}`}
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              {getStatusText(currentStatus)}
            </span>
          </div>

          {/* Technical Info Box */}
          <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3">
            <h3 className="text-sm uppercase text-gray-400 font-semibold">
              Thông tin kỹ thuật
            </h3>

            <div>
              <p className="text-xs text-gray-400 uppercase">Giá bán</p>
              <p className="text-white font-medium text-xl text-green-400">
                {new Intl.NumberFormat("vi-VN").format(price)} GCoin
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Nền tảng</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {platform.map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs border border-purple-500/40"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {gameData.fileSize && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Kích thước</p>
                <p className="text-white font-medium">{gameData.fileSize}</p>
              </div>
            )}

            {isApproved && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Phát hành</p>
                <p className="text-white font-medium">
                  {formatDate(gameData.releaseDate)}
                </p>
              </div>
            )}

            {gameData.submittedDate && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Gửi ngày</p>
                <p className="text-white font-medium">
                  {formatDate(gameData.submittedDate)}
                </p>
              </div>
            )}

            {isApproved && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Đánh giá</p>
                <p className="text-white font-medium">
                  {gameData.rating || 0} / 5.0
                </p>
              </div>
            )}
          </div>

          {/* System Requirements Box */}
          {Object.keys(reqs).length > 0 && (
            <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <h3 className="text-sm uppercase text-gray-400 font-semibold">
                Yêu cầu tối thiểu
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Hệ điều hành</p>
                  <p className="text-white font-medium">{reqs.os || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400">CPU</p>
                  <p className="text-white font-medium">
                    {reqs.processor || reqs.cpu || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">RAM</p>
                  <p className="text-white font-medium">
                    {reqs.memory || reqs.ram || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">GPU</p>
                  <p className="text-white font-medium">
                    {reqs.graphics || reqs.gpu || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Lưu trữ</p>
                  <p className="text-white font-medium">
                    {reqs.storage || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions Buttons */}
          {currentStatus === "PENDING" && (
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-600/30 transition-all"
              >
                Duyệt game
              </button>
              <button
                onClick={() => setIsRejectionModalOpen(true)}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-600/30 transition-all"
              >
                Từ chối
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: IMAGE PREVIEW */}
      {selectedImageIndex !== null && screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute -top-10 right-0 text-white hover:text-purple-400 transition"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={screenshots[selectedImageIndex]}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="rounded-xl border border-purple-500/30 w-full"
            />
          </div>
        </div>
      )}

      {/* MODAL: REJECTION REASON */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-purple-900/50 rounded-xl border border-purple-500/30 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-3">Từ chối game</h2>
            <p className="text-gray-300 mb-4">
              Vui lòng nhập lý do từ chối phê duyệt game này.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do..."
              className="w-full h-28 p-3 rounded-lg bg-slate-800/60 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsRejectionModalOpen(false)}
                className="flex-1 py-2 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/10 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameDetailPage;
