import { useState } from "react";
import { Download, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { downloadGameWithOwnership } from "../../api/r2Games";

/**
 * Component Download Game Button với 2 options:
 * 1. Download Full Speed - Gọi API tạo presigned URL
 * 2. Link tải trực tiếp - Mở tab mới với endpoint backend
 */
export default function DownloadGameButton({ gameId, gameName, variant = "full" }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      toast.info("Đang tạo link tải...");

      const result = await downloadGameWithOwnership(gameId);

      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
        toast.success(result.message || "Tải game thành công!");
      } else {
        toast.error("Không nhận được link tải");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "Lỗi khi tải game");
    } finally {
      setDownloading(false);
    }
  };

  // Variant: full - Hiển thị cả 2 nút (dùng cho trang chi tiết)
  if (variant === "full") {
    return (
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-2xl p-8 text-center">
        <p className="text-green-400 text-lg mb-6">
          🎉 Chúc mừng! Bạn đã sở hữu game này
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-10 py-5 rounded-full transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Đang tạo link...
              </>
            ) : (
              <>
                <Download className="h-6 w-6" />
                Download Full Speed
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Tải xuống ngay
              </>
            )}
          </button>
        </div>
        <p className="text-purple-300 text-sm mt-4">
          💡 Cả 2 nút đều tạo link tải an toàn từ server
        </p>
      </div>
    );
  }

  // Variant: compact - Chỉ 1 nút nhỏ (dùng cho list/card)
  if (variant === "compact") {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Tải game
          </>
        )}
      </button>
    );
  }

  // Variant: link-only - Single button
  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Tải game
        </>
      )}
    </button>
  );
}
