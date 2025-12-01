// components/home/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { User, LogOut, Upload, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../../store/UserContext";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role;
  const isGuest = !user;

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Chữ cái đầu
  const getInitials = () => {
    if (!user) return "?";
    return (user.fullName || user.username || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-xl">
      {/* Menu trái – chỉ Trang chủ + Sản phẩm cho mọi người */}
      <div className="flex items-center space-x-10">
        <Link
          to="/"
          className={`text-lg font-bold ${
            location.pathname === "/"
              ? "text-white"
              : "text-purple-200 hover:text-white"
          }`}
        >
          Trang chủ
          {location.pathname === "/" && (
            <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-1"></div>
          )}
        </Link>
        <Link
          to="/products"
          className={`text-lg font-bold ${
            location.pathname.startsWith("/products") ||
            location.pathname.startsWith("/game/")
              ? "text-white"
              : "text-purple-200 hover:text-white"
          }`}
        >
          Sản phẩm
          {(location.pathname.startsWith("/products") ||
            location.pathname.startsWith("/game/")) && (
            <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-1"></div>
          )}
        </Link>
      </div>

      {/* Bên phải */}
      <div className="flex items-center gap-6">
        {/* Publisher: nút Up Game */}
        {role === "PUBLISHER" && (
          <Button
            onClick={() => navigate("/publisher/upload")}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-6 py-3 rounded-full font-bold shadow-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Up Game
          </Button>
        )}

        {/* Admin: nút Admin Panel */}
        {role === "ADMIN" && (
          <Button
            onClick={() => navigate("/admin")}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 px-6 py-3 rounded-full font-bold shadow-lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Admin Panel
          </Button>
        )}

        {/* Đã đăng nhập: avatar */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 ring-4 ring-white/20 flex items-center justify-center text-white font-bold text-xl shadow-xl hover:ring-white/40 transition"
            >
              {getInitials()}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-purple-900/95 backdrop-blur-xl border border-purple-700 rounded-2xl shadow-2xl z-50">
                <div className="p-4 border-b border-purple-700">
                  <p className="text-white font-bold">
                    {user.fullName || user.username}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold rounded-full">
                    {role}
                  </span>
                </div>
                {(role === "CUSTOMER") && (
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-5 py-3 text-white hover:bg-purple-800"
                  >
                    Hồ sơ cá nhân
                  </Link>
                )}

                {role === "PUBLISHER" && (
                  <Link
                    to="/publisher/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-5 py-3 text-white hover:bg-purple-800"
                  >
                    Hồ sơ nhà phát hành
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-red-400 hover:bg-purple-800 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest */
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="text-purple-200 hover:text-white font-semibold"
            >
              Đăng ký
            </Link>
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-8 py-3 rounded-full font-bold"
            >
              <User className="w-5 h-5 mr-2" />
              Đăng nhập
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
