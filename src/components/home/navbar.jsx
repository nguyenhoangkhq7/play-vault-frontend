// components/home/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { User, LogOut, Upload, Shield, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../../store/UserContext"; // Dùng Context chung

export default function Navbar() {
  const { user, logout } = useUser(); // Lấy trực tiếp từ Context (chuẩn nhất!)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý logout
  const handleLogout = () => {
    logout(); // Dùng hàm logout từ Context (xóa localStorage luôn)
    setIsDropdownOpen(false);
  };

  // Lấy chữ cái đầu
  const getInitials = () => {
    if (!user) return "?";
    const name = user.fullName || user.username || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Kiểm tra role (dựa trên user từ Context)
  const isGuest = !user;
  const isCustomer = user?.role === "CUSTOMER";
  const isPublisher = user?.role === "PUBLISHER";
  const isAdmin = user?.role === "ADMIN";

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Ưa thích", path: "/favorites" },
    ...(isCustomer || isPublisher || isAdmin
      ? [
          { name: "Đã mua", path: "/bought" },
          { name: "Giỏ hàng", path: "/cart" },
        ]
      : []),
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg">
      {/* Menu trái */}
      <div className="flex items-center space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-lg font-semibold relative transition-colors ${
              location.pathname === item.path
                ? "text-white"
                : "text-purple-200 hover:text-white"
            }`}
          >
            {item.name}
            {location.pathname === item.path && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"></span>
            )}
          </Link>
        ))}
      </div>

      {/* Bên phải: Nút theo role */}
      <div className="flex items-center space-x-4">
        {/* Chỉ Publisher mới thấy nút Up Game */}
        {isPublisher && (
          <Button
            onClick={() => navigate("/publisher/upload")}
            className="bg-gradient-to-r from-cyan-500 to-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:from-cyan-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            Up Game
          </Button>
        )}

        {/* Chỉ Admin thấy nút Admin Panel */}
        {isAdmin && (
          <Button
            onClick={() => navigate("/admin")}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:from-red-500 hover:to-orange-500 transition-all flex items-center gap-3 shadow-lg"
          >
            <Shield className="w-5 h-5" />
            Admin Panel
          </Button>
        )}

        {/* Nếu đã đăng nhập → hiện avatar + dropdown */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl font-bold cursor-pointer ring-4 ring-white/20 shadow-xl hover:ring-white/40 transition-all"
              title={user.username}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-purple-900/95 backdrop-blur-xl border border-purple-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-purple-700">
                  <p className="text-white font-bold text-lg">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-purple-300 text-sm">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold rounded-full">
                    {user.role}
                  </span>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-5 py-3 text-white hover:bg-purple-800 transition"
                >
                  Hồ sơ cá nhân
                </Link>

                {(isPublisher || isAdmin) && (
                  <Link
                    to={isPublisher ? "/publisher/games" : "/admin"}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-5 py-3 text-white hover:bg-purple-800 transition flex items-center gap-3"
                  >
                    {isPublisher ? (
                      <Gamepad2 className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    {isPublisher ? "Quản lý Game" : "Admin Dashboard"}
                  </Link>
                )}

                <div className="border-t border-purple-700"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-red-400 hover:bg-purple-800 transition flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest → chỉ thấy nút Đăng nhập */
          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:from-pink-700 hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <User className="w-5 h-5" />
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
}
