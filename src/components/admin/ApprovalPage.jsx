"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Footer from "../home/footer";
import { gamesData } from "@/lib/game-data"; // ✅ import data
import { useNavigate } from "react-router-dom";

export function ApprovalPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState(gamesData);
  const navigate = useNavigate();

  // ✅ Lọc theo trạng thái + tìm kiếm
  const filteredGames = games.filter((game) => {
    const matchesFilter = filter === "all" || game.status === filter;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ✅ Hàm lấy style và icon cho từng trạng thái
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

  // ✅ Bấm "Duyệt"
  const handleApprove = (id) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === id ? { ...game, status: "approved" } : game
      )
    );
  };

  // ✅ Bấm "Từ chối"
  const handleReject = (id) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === id ? { ...game, status: "rejected" } : game
      )
    );
  };

  // ✅ Click vào card để chuyển sang trang chi tiết
  const handleCardClick = (id) => {
    navigate(`/admin/approval/games/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex flex-col">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="border-b border-purple-700/50 bg-purple-800/40 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-center items-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-lg">
              Quản lý duyệt game
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="pl-4 pr-8 py-10">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <Input
                placeholder="Tìm kiếm theo tên game hoặc nhà phát hành..."
                className="pl-12 bg-white/10 border-purple-700/30 text-white placeholder:text-purple-300 focus:border-purple-500/50 focus:bg-white/15 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 whitespace-nowrap bg-purple-800/50 border-purple-700/50 text-white hover:bg-purple-800/70 hover:border-purple-600/50">
                  Trạng thái <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-gray-900 border-purple-700/30"
              >
                {["all", "pending", "approved", "rejected"].map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setFilter(type)}
                    className="text-white hover:bg-purple-800/50 cursor-pointer"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        filter === type
                          ? "bg-purple-400"
                          : type === "pending"
                          ? "bg-yellow-400"
                          : type === "approved"
                          ? "bg-green-400"
                          : type === "rejected"
                          ? "bg-red-400"
                          : "bg-gray-600"
                      }`}
                    />
                    {type === "all"
                      ? "Tất cả"
                      : type === "pending"
                      ? "Chờ duyệt"
                      : type === "approved"
                      ? "Đã duyệt"
                      : "Từ chối"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Game Grid */}
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {filteredGames.map((game) => {
                const statusConfig = getStatusConfig(game.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={game.id}
                    onClick={() => handleCardClick(game.id)}
                    className="bg-gray-900/80 border border-purple-700/30 rounded-xl overflow-hidden hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-900/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="aspect-video bg-gray-800 overflow-hidden relative">
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2 text-lg">
                        {game.title}
                      </h3>
                      <p className="text-sm text-purple-300 mb-3">
                        Publisher: {game.publisher}
                      </p>
                      <p className="text-xl font-bold text-purple-400 mb-3">
                        {game.price}
                      </p>

                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-5 ${statusConfig.badgeColor} w-fit`}
                      >
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span
                          className={`text-sm font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* ✅ Nút Duyệt và Từ chối */}
                      {game.status === "pending" && (
                        <div
                          className="flex gap-3"
                          onClick={(e) => e.stopPropagation()} // tránh click card
                        >
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                            onClick={() => handleApprove(game.id)}
                          >
                            <Check className="w-4 h-4 mr-1.5" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-red-300 border border-red-700/50 font-medium transition-colors"
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
            <div className="text-center py-16 text-purple-300">
              Không tìm thấy game nào
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ApprovalPage;
