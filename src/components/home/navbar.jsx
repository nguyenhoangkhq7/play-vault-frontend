import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  LogOut,
  Upload,
  Shield,
  Coins,
  PlusCircle,
  ShoppingCart,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../../store/UserContext";
import PaymentModal from "../download/PaymentModal";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const { user, logout, setUser } = useUser();
  const navigate = useNavigate();
  const role = user?.role;

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handlePaymentSuccess = (newBalance) => {
    if (setUser && user) {
      setUser((prev) => ({ ...prev, balance: newBalance }));
    }
    setShowPaymentModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const getInitials = () => {
    if (!user) return "?";
    return (user.fullName || user.username || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? "0" : new Intl.NumberFormat("vi-VN").format(num);
  };

  return (
    <>
      <div className="grid grid-cols-3 items-center px-6 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg sticky top-0 z-40 h-16 border-b border-white/5">
        {/* Cột Trái: Spacer để cân bằng layout */}
        <div className="flex justify-start w-full"></div>

        {/* Cột Giữa: Search Bar (Luôn căn giữa màn hình) */}
        <div className="flex justify-center w-full px-4">
          {role !== "PUBLISHER" && (
            <form
              onSubmit={handleSearch}
              className="relative w-full max-w-lg group"
            >
              <input
                type="text"
                placeholder="Tìm kiếm game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-white/10 border border-purple-400/20 text-white placeholder-purple-300/70 rounded-full pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/15 focus:border-transparent transition-all duration-300 shadow-inner"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300 group-focus-within:text-pink-400 transition-colors" />
            </form>
          )}
        </div>

        {/* Cột Phải: User Actions */}
        <div className="flex items-center justify-end gap-3 w-full">
          {role === "ADMIN" && (
            <Button
              onClick={() => navigate("/admin")}
              className="h-10 px-5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-full font-bold shadow-md hover:shadow-orange-500/20 transition-all text-sm flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-white/10 p-1.5 pr-3 rounded-full transition-all duration-200 border border-transparent hover:border-purple-500/30 group"
              >
                {/* Avatar container */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 ring-2 ring-purple-400/30 group-hover:ring-purple-400/60 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden transition-all">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>

                {/* User Info */}
                <div className="flex flex-col items-start min-w-[80px]">
                  <span className="text-white font-bold text-xs leading-tight truncate max-w-[120px]">
                    {user.fullName || user.username}
                  </span>
                  {role === "CUSTOMER" && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      <span className="text-green-400 font-bold text-[11px] tracking-wide">
                        {formatCurrency(user?.balance)}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-purple-900/95 backdrop-blur-xl border border-purple-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-purple-700/50 bg-purple-950/30">
                    <p className="text-white font-bold truncate mb-1">
                      {user.fullName || user.username}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide shadow-sm">
                      {role}
                    </span>
                  </div>

                  <div className="py-2 space-y-0.5">
                    {role === "CUSTOMER" && (
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-purple-100 hover:bg-purple-800/80 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ cá nhân
                      </Link>
                    )}

                    {role === "PUBLISHER" && (
                      <Link
                        to="/publisher/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-purple-100 hover:bg-purple-800/80 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ cá nhân
                      </Link>
                    )}

                    {role === "CUSTOMER" && (
                      <Link
                        to="/cart"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-purple-100 hover:bg-purple-800/80 hover:text-white transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Giỏ hàng
                      </Link>
                    )}

                    {role === "CUSTOMER" && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setShowPaymentModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-yellow-300 hover:bg-purple-800/80 hover:text-yellow-200 transition-colors font-medium"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Nạp G-Coin
                      </button>
                    )}

                    <div className="h-px bg-purple-700/50 my-1 mx-4"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="text-sm font-semibold text-purple-200 hover:text-white transition-colors px-2"
              >
                Đăng ký
              </Link>
              <Button
                onClick={() => navigate("/login")}
                className="h-10 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-full font-bold shadow-md hover:shadow-pink-500/20 transition-all text-sm flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
