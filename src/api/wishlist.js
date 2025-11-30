// Import object 'api' từ file authAPI của bạn
// (Đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn)
import { api } from "./authApi"; 

// 1. Lấy danh sách Wishlist (GET)
export async function getWishlist() {
  // api.get tự động thêm API_BASE_URL và Header Authorization
  const response = await api.get("/api/wishlist");
  return response.data;
}

// 2. Thêm game vào wishlist (POST)
export async function createWishlist(gameId) {
  // Tham số thứ 2 là body (data), ở đây backend không cần body nên để null
  const response = await api.post(`/api/wishlist/${gameId}`, null);
  return response.data;
}

// 3. Xóa game khỏi wishlist (DELETE)
// (Tên hàm giữ nguyên là updateWishlist để không lỗi code cũ, dù logic là Delete)
export async function updateWishlist(gameId) {
  const response = await api.delete(`/api/wishlist/${gameId}`);
  return response.data;
}