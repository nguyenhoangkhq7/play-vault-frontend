// components/home/Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import {
  Crown,
  Diamond,
  ShoppingCart,
  LayoutGrid,
  Download,
  Heart,
  User,
  Bug,
  GamepadIcon,
  Upload,
  Shield,
  DollarSign,
} from "lucide-react";
import { useUser } from "../../store/UserContext"; // Đảm bảo đường dẫn đúng

export default function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  // Xác định role
  const isGuest = !user;
  const isCustomer = user?.role === "CUSTOMER";
  const isPublisher = user?.role === "PUBLISHER";
  const isAdmin = user?.role === "ADMIN";
  const isLoggedIn = !!user;

  // Danh sách menu động theo role
  const menuItems = [
    // Tất cả mọi người đều thấy
    {
      id: "home",
      icon: Diamond,
      label: "Trang chủ",
      path: "/",
      roles: ["ALL"],
    },
    {
      id: "products",
      icon: LayoutGrid,
      label: "Sản phẩm",
      path: "/products",
      roles: ["ALL"],
    },
    {
      id: "favorites",
      icon: Heart,
      label: "Ưa thích",
      path: "/favorites",
      roles: ["ALL"],
    },

    // Chỉ người đăng nhập mới thấy
    {
      id: "bought",
      icon: Download,
      label: "Đã mua",
      path: "/bought",
      roles: ["CUSTOMER", "PUBLISHER", "ADMIN"],
    },
    {
      id: "cart",
      icon: ShoppingCart,
      label: "Giỏ hàng",
      path: "/cart",
      roles: ["CUSTOMER", "PUBLISHER", "ADMIN"],
    },

    // Chỉ Publisher
    {
      id: "upload",
      icon: Upload,
      label: "Up Game",
      path: "/publisher/upload",
      roles: ["PUBLISHER"],
      color: "from-emerald-500 to-cyan-500",
    },
    {
      id: "managegames",
      icon: GamepadIcon,
      label: "Quản lý Game",
      path: "/publisher/games",
      roles: ["PUBLISHER"],
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "revenue",
      icon: DollarSign,
      label: "Doanh thu",
      path: "/revenue",
      roles: ["PUBLISHER"],
      color: "from-yellow-500 to-orange-500",
    },

    // Chỉ Admin
    {
      id: "admin",
      icon: Shield,
      label: "Admin Panel",
      path: "/admin",
      roles: ["ADMIN"],
      color: "from-red-600 to-orange-600",
    },

    // Báo lỗi (tùy chọn: ai cũng thấy được)
    {
      id: "report",
      icon: Bug,
      label: "Báo lỗi",
      path: "/report",
      roles: ["ALL"],
    },
  ];

  // Lọc menu theo role
  const visibleItems = menuItems.filter((item) => {
    if (item.roles.includes("ALL")) return true;
    if (!isLoggedIn) return false;
    return item.roles.includes(user.role);
  });

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
        {visibleItems.map((item) => (
          <NavItem
            key={item.id}
            to={item.path}
            icon={item.icon}
            label={item.label}
            isActive={
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/")
            }
            gradient={item.color}
          />
        ))}
      </div>

      {/* Hồ sơ (chỉ hiện khi đăng nhập) */}
      {isLoggedIn && (
        <div className="mt-auto mb-10">
          <NavItem
            to="/profile"
            icon={User}
            label="Hồ sơ cá nhân"
            isActive={location.pathname === "/profile"}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      )}
    </div>
  );
}

// Component con – có hiệu ứng đẹp hơn
function NavItem({ to, icon: Icon, label, isActive, gradient }) {
  const defaultGradient = "from-pink-600 to-purple-600";

  return (
    <div className="relative group">
      <NavLink to={to} className="block">
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

      {/* Tooltip đẹp hơn */}
      <div className="absolute left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold py-2 px-4 rounded-xl whitespace-nowrap shadow-2xl border border-white/20">
          <span className="drop-shadow-md">{label}</span>
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-8 border-transparent border-r-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
