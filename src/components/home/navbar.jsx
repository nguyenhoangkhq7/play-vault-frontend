import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { User, LogOut, Upload, Shield, Coins, PlusCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../../store/UserContext";
import PaymentModal from "../download/PaymentModal";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const dropdownRef = useRef(null);
  

  const { user, logout, setUser } = useUser(); // setUser là hàm cập nhật toàn bộ user object
  const navigate = useNavigate();
  const location = useLocation();
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

  // Hàm xử lý khi nạp tiền thành công – nhận về newBalance từ backend
  const handlePaymentSuccess = (newBalance) => {
    if (setUser && user) {
      setUser(prev => ({ ...prev, balance: newBalance }));
    }
    setShowPaymentModal(false);
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
      <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-xl sticky top-0 z-50">
        {/* Menu trái */}
        <div className="flex items-center space-x-10">
          <Link
            to="/"
            className={`text-lg font-bold ${location.pathname === "/" ? "text-white" : "text-purple-200 hover:text-white"}`}
          >
            Trang chủ
            {location.pathname === "/" && (
              <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-1"></div>
            )}
          </Link>
          <Link
            to="/products"
            className={`text-lg font-bold ${
              location.pathname.startsWith("/products") || location.pathname.startsWith("/game/")
                ? "text-white"
                : "text-purple-200 hover:text-white"
            }`}
          >
            Sản phẩm
            {(location.pathname.startsWith("/products") || location.pathname.startsWith("/game/")) && (
              <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-1"></div>
            )}
          </Link>
        </div>

        {/* Bên phải */}
        <div className="flex items-center gap-6">
          {role === "PUBLISHER" && (
            <Button
              onClick={() => navigate("/publisher/upload")}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-6 py-3 rounded-full font-bold shadow-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Up Game
            </Button>
          )}

          {role === "ADMIN" && (
            <Button
              onClick={() => navigate("/admin")}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 px-6 py-3 rounded-full font-bold shadow-lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Admin Panel
            </Button>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-xl transition-colors duration-200 border border-transparent hover:border-purple-500/30"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 ring-2 ring-purple-400/50 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-white font-bold text-sm leading-tight">
                    {user.fullName || user.username}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="bg-yellow-500 rounded-full p-[2px] shadow-sm">
                      <Coins className="w-3 h-3 text-white fill-yellow-200" />
                    </div>
                    <span className="text-green-400 font-bold text-xs tracking-wide">
                      {formatCurrency(user?.balance)} GCoin
                    </span>
                  </div>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-purple-900/95 backdrop-blur-xl border border-purple-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-purple-700 bg-purple-950/50">
                    <p className="text-white font-bold truncate mb-2">
                      {user.fullName || user.username}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                      {role}
                    </span>
                  </div>

                  <div className="py-2">
                    {(role === "CUSTOMER" || role === "PUBLISHER") && (
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-5 py-3 text-purple-100 hover:bg-purple-800 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ cá nhân
                      </Link>
                    )}

                    {role === "CUSTOMER" && (
                      <Link
                        to="/cart"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-5 py-3 text-purple-100 hover:bg-purple-800 hover:text-white flex items-center gap-3 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Giỏ hàng
                      </Link>
                    )}

                    {(role === "CUSTOMER" || role === "PUBLISHER") && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setShowPaymentModal(true);
                        }}
                        className="w-full text-left px-5 py-3 text-yellow-300 hover:bg-purple-800 hover:text-yellow-200 flex items-center gap-3 transition-colors font-medium"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Nạp G-Coin
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-3 transition-colors border-t border-purple-700/50 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/register" className="text-purple-200 hover:text-white font-semibold transition-colors">
                Đăng ký
              </Link>
              <Button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-8 py-3 rounded-full font-bold shadow-md transition-transform hover:scale-105"
              >
                <User className="w-5 h-5 mr-2" />
                Đăng nhập
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PaymentModal – ĐÃ SỬA ĐÚNG 100% */}
      <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      onSuccess={handlePaymentSuccess}
    />
    </>
  );
}