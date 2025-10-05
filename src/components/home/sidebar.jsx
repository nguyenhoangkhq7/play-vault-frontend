import { useLocation, NavLink } from 'react-router-dom';
import { Crown, Diamond, ShoppingCart, LayoutGrid, Download, Heart, User } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { id: "home", icon: Diamond, label: "Trang chủ", path: "/" },
    { id: "products", icon: LayoutGrid, label: "Sản phẩm", path: "/products" },
    { id: "favorites", icon: Heart, label: "Ưa thích", path: "/favorites" },
    { id: "bought", icon: Download, label: "Đã mua", path: "/bought" },
    { id: "cart", icon: ShoppingCart, label: "Giỏ hàng", path: "/cart" },
  ];

  return (
    <div className="w-20 bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col items-center py-8 fixed top-0 left-0 h-screen z-10 shadow-xl border-r border-purple-800/30">
      <div className="mb-10">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8 mt-4">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            to={item.path}
            isActive={location.pathname === item.path}
            icon={<item.icon className="w-6 h-6" />}
            label={item.label}
          />
        ))}
      </div>

      <div className="mt-auto mb-8">
        <NavItem
          to="/profile"
          isActive={location.pathname === "/profile"}
          icon={<User className="w-6 h-6" />}
          label="Hồ sơ"
        />
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, isActive }) {
  return (
    <div className="relative group">
      <NavLink
        to={to}
        className="block"
      >
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${isActive
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
            : 'text-purple-300 bg-purple-900/20'}
        `}>
          {icon}
        </div>
      </NavLink>

      <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
        {label}
      </div>
    </div>
  );
}