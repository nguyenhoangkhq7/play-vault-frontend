// components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../store/UserContext"; // Nhớ trỏ đúng đường dẫn

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();

  // 1. Nếu chưa đăng nhập -> Đá về Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có truyền allowedRoles và Role của user không nằm trong danh sách cho phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Đá về trang chủ hoặc trang báo lỗi 403
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Render các Route con (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
