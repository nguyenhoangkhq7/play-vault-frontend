import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, X, Loader2 } from "lucide-react";
import { gamesData } from "@/lib/game-data";

export function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Fake fetch (giống như Next.js fetch server-side)
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const foundGame = gamesData.find((g) => g.id === Number(id));
      setGameData(foundGame || null);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Game không tồn tại
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

  const handleApprove = () => {
    alert(`✅ Duyệt thành công: ${gameData.title}`);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return alert("Vui lòng nhập lý do từ chối");
    alert(`❌ Game "${gameData.title}" bị từ chối.\nLý do: ${rejectionReason}`);
    setIsRejectionModalOpen(false);
    setRejectionReason("");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/40";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/40";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-gray-200">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-purple-500/10 rounded-lg transition"
          >
            <ChevronLeft className="h-6 w-6 text-purple-400" />
          </button>
          <h1 className="text-xl font-semibold text-white">
            Chi tiết Game
          </h1>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover */}
          <div className="relative group overflow-hidden rounded-2xl border border-purple-500/30">
            <img
              src={gameData.coverImage}
              alt={gameData.title}
              className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Play className="h-16 w-16 text-purple-400" />
            </div>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              {gameData.title}
            </h2>
            <p className="text-purple-300 mb-4">
              {gameData.developer} • {gameData.publisher}
            </p>
            <div className="flex flex-wrap gap-2">
              {gameData.genre.map((g, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-sm"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">Mô tả</h3>
            <p className="text-gray-300 leading-relaxed">
              {gameData.description}
            </p>
          </div>

          {/* Screenshots */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Ảnh chụp màn hình
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {gameData.screenshots.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className="group relative overflow-hidden rounded-lg border border-purple-500/30"
                >
                  <img
                    src={img}
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

          {/* Video */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Trailer</h3>
            <div className="relative aspect-video border border-purple-500/30 rounded-xl overflow-hidden">
              <iframe
                src={gameData.videoUrl}
                title="Trailer"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
<div className="space-y-6">
  {/* Status */}
  <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
    <h3 className="text-sm uppercase text-gray-400 mb-3 font-semibold">
      Trạng thái
    </h3>
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusStyle(
        gameData.status
      )}`}
    >
      <div className="w-2 h-2 rounded-full bg-current"></div>
      {getStatusText(gameData.status)}
    </span>
  </div>

  {/* Technical Info */}
  <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3">
    <h3 className="text-sm uppercase text-gray-400 font-semibold">
      Thông tin kỹ thuật
    </h3>
    <div>
      <p className="text-xs text-gray-400 uppercase">Nền tảng</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {gameData.platform.map((p, i) => (
          <span
            key={i}
            className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs border border-purple-500/40"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase">Kích thước</p>
      <p className="text-white font-medium">{gameData.fileSize}</p>
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase">Phát hành</p>
      <p className="text-white font-medium">{gameData.releaseDate}</p>
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase">Gửi ngày</p>
      <p className="text-white font-medium">{gameData.submittedDate}</p>
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase">Đánh giá</p>
      <p className="text-white font-medium">{gameData.rating} / 5.0</p>
    </div>
  </div>

  {/* Minimum Requirements */}
  <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3">
    <h3 className="text-sm uppercase text-gray-400 font-semibold">
      Yêu cầu tối thiểu
    </h3>
    <div className="space-y-2 text-sm">
      <div>
        <p className="text-gray-400">Hệ điều hành</p>
        <p className="text-white font-medium">
          {gameData.minimumRequirements?.os}
        </p>
      </div>
      <div>
        <p className="text-gray-400">Bộ xử lý</p>
        <p className="text-white font-medium">
          {gameData.minimumRequirements?.processor}
        </p>
      </div>
      <div>
        <p className="text-gray-400">RAM</p>
        <p className="text-white font-medium">
          {gameData.minimumRequirements?.memory}
        </p>
      </div>
      <div>
        <p className="text-gray-400">Card đồ họa</p>
        <p className="text-white font-medium">
          {gameData.minimumRequirements?.graphics}
        </p>
      </div>
      <div>
        <p className="text-gray-400">Lưu trữ</p>
        <p className="text-white font-medium">
          {gameData.minimumRequirements?.storage}
        </p>
      </div>
    </div>
  </div>

  {/* Actions */}
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
</div>

      </main>

      {/* IMAGE MODAL */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute -top-10 right-0 text-white hover:text-purple-400 transition"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={gameData.screenshots[selectedImageIndex]}
              alt="Preview"
              className="rounded-xl border border-purple-500/30 w-full"
            />
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
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