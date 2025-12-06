"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search, Check, X, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Footer from "../home/footer";
import { useNavigate } from "react-router-dom";
import { gameService } from "@/api/gameService";

/** Chuẩn hoá DTO -> đối tượng UI */
function normalizeGame(g) {
  const base = g?.gameBasicInfos || g?.gameBasicInfo || g || {};

  // Lấy status từ nhiều nguồn, ưu tiên server
  const rawStatus =
    g?.status ??
    g?.currentStatus ??
    g?.submissionStatus ??
    g?.submission?.status ??
    null;

  const status = typeof rawStatus === "string" ? rawStatus.toLowerCase() : null;

  return {
    id: g?.id ?? base?.id,
    title: base?.name || g?.title || "Unknown",
    publisher: base?.publisherName || base?.publisher?.name || g?.publisherName || "—",
    price: base?.price ?? g?.price ?? 0,
    coverImage: base?.thumbnail || base?.coverUrl || g?.thumbnail || g?.coverUrl,
    status: status, // nếu server không có, tạm pending (sẽ override ở fetchGames)
  };
}

export default function ApprovalPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // backend trả tất cả game + status đúng cho từng game
      const list = await gameService.listAll(); 
      const items = Array.isArray(list) ? list.map(normalizeGame) : [];
      setGames(items);
    } catch (e) {
      console.error(e);
      setError("Không tải được danh sách game.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames(); // load lần đầu
  }, [fetchGames]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          label: "Chờ duyệt",
          color: "text-yellow-400",
          badgeColor: "bg-yellow-500/20 border border-yellow-500/30",
        };
      case "approved":
        return {
          icon: CheckCircle2,
          label: "Đã duyệt",
          color: "text-green-400",
          badgeColor: "bg-green-500/20 border border-green-500/30",
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Từ chối",
          color: "text-red-400",
          badgeColor: "bg-red-500/20 border border-red-500/30",
        };
      default:
        return {
          icon: Clock,
          label: "Chờ duyệt",
          color: "text-gray-400",
          badgeColor: "bg-gray-500/20 border border-gray-500/30",
        };
    }
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return games.filter((game) => {
      const matchesFilter = filter === "all" || game.status === filter;
      const matchesSearch =
        game.title?.toLowerCase?.().includes(q) ||
        game.publisher?.toLowerCase?.().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [games, filter, searchQuery]);

  const handleCardClick = (id) => navigate(`/admin/approval/games/${id}`);

  const mutateStatus = async (id, next) => {
  setWorkingId(id);
  const snapshot = games.map((g) => ({ ...g })); // rollback nếu lỗi

  // optimistic
  setGames((prev) => prev.map((g) => (g.id === id ? { ...g, status: next.toLowerCase() } : g)));

  try {
    const res = await gameService.updateStatus(id, next);
    const returnedStatus =
      (res?.data?.status || res?.status || next)?.toString().toUpperCase();

    // đồng bộ item vừa cập nhật theo response
    setGames((prev) =>
      prev
        .map((g) => (g.id === id ? { ...g, status: returnedStatus.toLowerCase() } : g))
    );

    // Nếu trang này hiển thị list theo filter PENDING, có thể refetch để đồng bộ toàn trang:
    // await fetchGames();
  } catch (e) {
    console.error("Update status failed:", e);
    alert(e?.response?.data?.message || "Cập nhật trạng thái thất bại.");
    setGames(snapshot); // rollback
  } finally {
    setWorkingId(null);
  }
};

  const handleApprove = (id) => mutateStatus(id, "APPROVED");
  const handleReject = (id) => mutateStatus(id, "REJECTED");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <header className="border-b border-purple-700/50 bg-purple-800/40 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-center items-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-lg">
              Quản lý duyệt game
            </h1>
          </div>
        </header>

        <div className="pl-4 pr-8 py-10">
          {/* Tìm kiếm + Lọc */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <Input
                placeholder="Tìm kiếm theo tên game hoặc nhà phát hành..."
                className="pl-12 bg-white/10 border-purple-700/30 text-white placeholder:text-purple-300 focus:border-purple-500/50 focus:bg-white/15 transition-colors w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-purple-800/50 border-purple-700/50 text-white hover:bg-purple-800/70 hover:border-purple-600/50">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-700/30 text-white z-[9999]">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nội dung */}
          {loading ? (
            <div className="flex justify-center py-20 text-purple-300">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-300">{error}</div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {filteredGames.map((game) => {
                const statusConfig = getStatusConfig(game.status);
                const StatusIcon = statusConfig.icon;
                
                // --- CHỈNH SỬA TẠI ĐÂY: Format GCoin ---
                const priceDisplay = new Intl.NumberFormat("vi-VN").format(Number(game.price || 0)) + " GCoin";

                return (
                  <div
                    key={game.id}
                    onClick={() => handleCardClick(game.id)}
                    className="bg-gray-900/80 border border-purple-700/30 rounded-xl overflow-hidden hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-900/50 transition-all duration-300 group cursor-pointer flex flex-col h-full"
                  >
                    <div className="aspect-video bg-gray-800 overflow-hidden relative">
                      <img
                        src={game.coverImage || "/images/placeholder-16x9.png"}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://via.placeholder.com/300x200?text=Error")
                        }
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className="font-semibold text-white text-lg truncate pr-2 flex-1"
                          title={game.title}
                        >
                          {game.title}
                        </h3>
                      </div>

                      <p
                        className="text-sm text-purple-300 mb-3 truncate"
                        title={game.publisher}
                      >
                        Publisher: {game.publisher}
                      </p>
                      <p className="text-xl font-bold text-purple-400 mb-3">
                        {priceDisplay}
                      </p>

                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${statusConfig.badgeColor} w-fit`}
                      >
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span
                          className={`text-sm font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {game.status === "pending" && (
                        <div
                          className="mt-auto flex gap-3 pt-2 border-t border-purple-700/30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            disabled={workingId === game.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-60"
                            onClick={() => handleApprove(game.id)}
                          >
                            <Check className="w-4 h-4 mr-1.5" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            disabled={workingId === game.id}
                            className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700/50 font-medium transition-colors disabled:opacity-60"
                            onClick={() => handleReject(game.id)}
                          >
                            <X className="w-4 h-4 mr-1.5" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-purple-300 bg-purple-900/20 rounded-xl border border-dashed border-purple-700/50">
              Không tìm thấy yêu cầu nào phù hợp.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}