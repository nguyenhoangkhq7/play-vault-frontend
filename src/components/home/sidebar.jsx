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
  Activity,
  Users,
  FileText,
  CheckCircle,
  Flag,
  Percent,
} from "lucide-react";
import { useUser } from "../../store/UserContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  const role = user?.role;

  // === MENU RIÊNG CHO TỪNG ROLE ===

  // 1. GUEST: Chỉ Trang chủ, Sản phẩm
  const guestMenu = [
    { icon: Diamond, label: "Trang chủ", path: "/" },
    { icon: LayoutGrid, label: "Sản phẩm", path: "/products" },
  ];

  // 2. CUSTOMER: Guest + Yêu thích, Đã mua, Giỏ hàng
  // Đã bỏ "Đăng ký làm NPH"
  const customerMenu = [
    ...guestMenu,
    { icon: Heart, label: "Ưa thích", path: "/favorites" },
    { icon: Download, label: "Đã mua", path: "/bought" },
    { icon: ShoppingCart, label: "Giỏ hàng", path: "/cart" },
  ];

  // 3. PUBLISHER: Chỉ hiển thị các chức năng quản lý, bỏ Trang chủ/Sản phẩm
  const publisherMenu = [
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
      icon: Percent,
      label: "Promotions",
      path: "/promotions",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: DollarSign,
      label: "Doanh thu",
      path: "/revenue",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  // 4. ADMIN: Hiển thị chi tiết nội dung Admin Panel thay vì 1 nút
  const adminMenu = [
    {
      icon: LayoutGrid,
      label: "Dashboard",
      path: "/admin",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      icon: Users,
      label: "Người dùng",
      path: "/admin/users",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: GamepadIcon,
      label: "Quản lý Game",
      path: "/admin/games",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: CheckCircle,
      label: "Duyệt Game",
      path: "/admin/approval",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Activity,
      label: "Giám sát",
      path: "/admin/monitoring",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: FileText,
      label: "Báo cáo",
      path: "/admin/reports",
      gradient: "from-gray-500 to-slate-500",
    },
  ];

  // Chọn menu theo role
  let menuItems = guestMenu;
  if (role === "CUSTOMER") menuItems = customerMenu;
  else if (role === "PUBLISHER") menuItems = publisherMenu;
  else if (role === "ADMIN") menuItems = adminMenu;

  return (
    <div className="w-24 bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex flex-col items-center py-6 fixed top-0 left-0 h-screen z-50 shadow-2xl border-r border-purple-800/40 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Logo - Giảm margin bottom một chút cho gọn */}
      <div className="mb-6 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/10">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Menu chính */}
      <div className="flex flex-col items-center space-y-4 w-full px-2 pb-4 flex-grow">
        {menuItems.map((item, index) => (
          <NavItem
            key={index}
            to={item.path}
            icon={item.icon}
            label={item.label}
            isActive={
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path)
            }
            gradient={item.gradient}
          />
        ))}
      </div>

      {/* Nút dưới đáy Sidebar */}

      {/* 1. CUSTOMER: Nút Report thay vì Hồ sơ */}
      {role === "CUSTOMER" && (
        <div className="mt-auto mb-6 pt-4 shrink-0">
          <NavItem
            to="/report"
            icon={Flag}
            label="Báo cáo"
            isActive={location.pathname === "/report"}
            gradient="from-red-500 to-pink-600"
          />
        </div>
      )}

      {/* 2. PUBLISHER: Nút Hồ sơ Publisher */}
      {role === "PUBLISHER" && (
        <div className="mt-auto mb-6 pt-4 shrink-0">
          <NavItem
            to="/publisher/profile"
            icon={User}
            label="Hồ sơ"
            isActive={location.pathname === "/publisher/profile"}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>
      )}

      {role === "ADMIN" && (
        <div className="mt-auto mb-6 pt-4 shrink-0">
          <NavItem
            to="/admin/profile"
            icon={User}
            label="Profile"
            isActive={location.pathname === "/admin/profile"}
            gradient="from-gray-600 to-gray-800"
          />
        </div>
      )}
    </div>
  );
}

// NavItem
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

      {/* Tooltip Label */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 pl-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-2xl border border-white/20 whitespace-nowrap">
          {label}
          {/* Mũi tên tooltip */}
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-purple-600"></div>
        </div>
      </div>
    </div>
  );
}
