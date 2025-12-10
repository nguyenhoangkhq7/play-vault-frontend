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
// 1. Import Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useUser();
  const role = user?.role;

  // ... (Giữ nguyên các mảng menu guestMenu, customerMenu, v.v...)
  // CODE MENU CỦA BẠN GIỮ NGUYÊN Ở ĐÂY
  const guestMenu = [
    { icon: Diamond, label: "Trang chủ", path: "/" },
    { icon: LayoutGrid, label: "Sản phẩm", path: "/products" },
  ];

  const customerMenu = [
    ...guestMenu,
    { icon: Heart, label: "Yêu thích", path: "/favorites" },
    { icon: Download, label: "Đã mua", path: "/bought" },
    { icon: ShoppingCart, label: "Giỏ hàng", path: "/cart" },
  ];

  const publisherMenu = [
    {
      icon: GamepadIcon,
      label: "Quản lý Game",
      path: "/publisher/games",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Upload,
      label: "Up Game",
      path: "/publisher/upload",
      gradient: "from-emerald-500 to-cyan-500",
    },
    {
      icon: Percent,
      label: "Quản lý khuyến mãi",
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

  let menuItems = guestMenu;
  if (role === "CUSTOMER") menuItems = customerMenu;
  else if (role === "PUBLISHER") menuItems = publisherMenu;
  else if (role === "ADMIN") menuItems = adminMenu;

  return (
    // Consolidated sidebar wrapped in TooltipProvider
    <TooltipProvider delayDuration={0}>
      <div className="w-24 bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 flex flex-col items-center py-6 fixed top-0 left-0 h-screen z-50 shadow-2xl border-r border-purple-800/40 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {/* Logo */}
        <div className="mb-6 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/10">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Main menu */}
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

        {/* Bottom actions per role */}
        <div className="mt-auto mb-6 pt-4 shrink-0">
          {role === "CUSTOMER" && (
            <NavItem
              to="/report"
              icon={Flag}
              label="Báo cáo"
              isActive={location.pathname === "/report"}
              gradient="from-red-500 to-pink-600"
            />
          )}

          {role === "ADMIN" && (
            <NavItem
              to="/admin/profile"
              icon={User}
              label="Profile"
              isActive={location.pathname === "/admin/profile"}
              gradient="from-gray-600 to-gray-800"
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// 3. Viết lại NavItem sử dụng Shadcn Tooltip
function NavItem({ to, icon, label, isActive, gradient }) {
  const Icon = icon;
  const defaultGradient = "from-pink-600 to-purple-600";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink to={to}>
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
              shadow-lg transform hover:scale-105
              ${
                isActive
                  ? `bg-gradient-to-br ${
                      gradient || defaultGradient
                    } text-white ring-2 ring-white/30`
                  : "bg-white/5 backdrop-blur-md text-purple-300 hover:bg-white/10"
              }
            `}
          >
            <Icon className="w-6 h-6" />
          </div>
        </NavLink>
      </TooltipTrigger>

      {/* TooltipContent nằm ngoài luồng DOM của Sidebar nhờ Portal */}
      <TooltipContent
        side="right"
        sideOffset={15}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-white/20 shadow-2xl font-bold text-base px-5 py-2.5 rounded-xl"
      >
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
