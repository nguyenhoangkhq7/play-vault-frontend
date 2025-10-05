import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Navbar() {

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();



  // Load user từ localStorage hoặc sessionStorage khi mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);




  // Xử lý click ngoài dropdown để đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  // Lấy chữ cái đầu của tên người dùng
  const getUserInitials = (user) => {
    if (!user) return "";
    return `${user.f_name?.charAt(0) || ""}${user.l_name?.charAt(0) || ""}`.toUpperCase();
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Ưa thích", path: "/favorites" },
    { name: "Đã mua", path: "/bought" },
    { name: "Giỏ hàng", path: "/cart" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg">
      <div className="flex items-center space-x-8">
        {navItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className={`text-lg font-semibold relative ${location.pathname === item.path ? "text-white" : "text-purple-200"
              } hover:text-white transition-colors`}
          >
            {item.name}
            {location.pathname === item.path && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"></span>
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-6">

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-semibold cursor-pointer"
              onClick={toggleDropdown}
              title={`${user.f_name} ${user.l_name}`}
            >
              {getUserInitials(user)}
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-purple-900/95 backdrop-blur-md border border-purple-700 rounded-lg shadow-xl z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-white hover:bg-purple-800 rounded-t-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <div className="w-full border-t border-purple-700/50"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white hover:bg-purple-800 rounded-b-lg"
                >
                  <div className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-2 rounded-full font-semibold hover:from-pink-700 hover:to-purple-700"
          >
            <User className="w-5 h-5 mr-2" />
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
}