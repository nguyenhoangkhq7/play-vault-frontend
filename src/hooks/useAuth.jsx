// hooks/useAuth.js  (tạo file mới)
import { useUser } from "../store/UserContext";

export default function useAuth() {
  const { user } = useUser();

  const isGuest = !user; // chưa đăng nhập
  const isCustomer = user?.role === "CUSTOMER";
  const isPublisher = user?.role === "PUBLISHER";
  const isAdmin = user?.role === "ADMIN";
  const isLoggedIn = !!user;

  // Tiện hơn nữa: kiểm tra nhiều role
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    isGuest,
    isCustomer,
    isPublisher,
    isAdmin,
    isLoggedIn,
    hasRole,
  };
}
