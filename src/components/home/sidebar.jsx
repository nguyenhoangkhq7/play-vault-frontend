// components/home/Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import {
  Crown,
  Diamond,
  LayoutGrid,
  Heart,
  Download,
  ShoppingCart,
  User,
  Upload,
  GamepadIcon,
  DollarSign,
  Shield,
} from "lucide-react";
import { useUser } from "../../store/UserContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  const role = user?.role;

  // === MENU RIÊNG CHO TỪNG ROLE ===
  const guestMenu = [
    { icon: Diamond, label: "Trang chủ", path: "/" },
    { icon: LayoutGrid, label: "Sản phẩm", path: "/products" },
  ];

  const customerMenu = [
    ...guestMenu,
    { icon: Heart, label: "Ưa thích", path: "/favorites" },
    { icon: Download, label: "Đã mua", path: "/bought" },
    { icon: ShoppingCart, label: "Giỏ hàng", path: "/cart" },
  ];

  const publisherMenu = [
    { icon: Diamond, label: "Trang chủ", path: "/" },
    { icon: LayoutGrid, label: "Sản phẩm", path: "/products" },
    {
      icon: Upload,
      label: "Up Game",
      path: "/publisher/upload",
      gradient: "from-emerald-500 to-cyan-500",
    },
    {
      icon: GamepadIcon,
      label: "Quản lý Game",
      path: "/publisher/games",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      label: "Doanh thu",
      path: "/revenue",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const adminMenu = [
    {
      icon: Shield,
      label: "Admin Panel",
      path: "/admin",
      gradient: "from-red-600 to-orange-600",
    },
  ];

  // Chọn menu theo role
  let menuItems = guestMenu;
  if (role === "CUSTOMER") menuItems = customerMenu;
  else if (role === "PUBLISHER") menuItems = publisherMenu;
  else if (role === "ADMIN") menuItems = adminMenu;

  return (
    <div className="w-20 bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex flex-col items-center py-8 fixed top-0 left-0 h-screen z-50 shadow-2xl border-r border-purple-800/40">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/10">
          <Crown className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Menu chính */}
      <div className="flex flex-col items-center space-y-7">
        {menuItems.map((item, index) => (
          <NavItem
            key={index}
            to={item.path}
            icon={item.icon}
            label={item.label}
            isActive={
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/")
            }
            gradient={item.gradient}
          />
        ))}
      </div>

      {/* Hồ sơ – chỉ hiện cho Customer & Publisher */}
      {(role === "CUSTOMER") && (
        <div className="mt-auto mb-10">
          <NavItem
            to="/profile"
            icon={User}
            label="Hồ sơ"
            isActive={location.pathname === "/profile"}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      )}

      {/* Hồ sơ Publisher */}
{role === "PUBLISHER" && (
  <div className="mt-auto mb-10">
    <NavItem
      to="/publisher/profile"
      icon={User}
      label="Hồ sơ Publisher"
      isActive={location.pathname === "/publisher/profile"}
      gradient="from-cyan-500 to-blue-600"
    />
  </div>
)}

    </div>
  );
}

// NavItem – giữ nguyên hiệu ứng đẹp
function NavItem({ to, icon: Icon, label, isActive, gradient }) {
  const defaultGradient = "from-pink-600 to-purple-600";

  return (
    <div className="relative group">
      <NavLink to={to}>
        <div
          className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
            shadow-lg transform hover:scale-110
            ${
              isActive
                ? `bg-gradient-to-br ${
                    gradient || defaultGradient
                  } text-white ring-4 ring-white/30`
                : "bg-white/5 backdrop-blur-md text-purple-300 hover:bg-white/10"
            }
          `}
        >
          <Icon className="w-7 h-7" />
        </div>
      </NavLink>

      <div className="absolute left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-2xl border border-white/20">
          {label}
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-8 border-transparent border-r-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
