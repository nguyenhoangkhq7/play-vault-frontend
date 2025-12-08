// hooks/useAuth.js  (tạo file mới)
import { useUser } from "../store/UserContext";

export default function useAuth() {
  const { user, accessToken } = useUser();

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
    accessToken,
    token: accessToken, // alias for compatibility
    isGuest,
    isCustomer,
    isPublisher,
    isAdmin,
    isLoggedIn,
    hasRole,
  };
}
