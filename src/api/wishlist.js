// Import object 'api' từ file authAPI của bạn
// (Đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn)
import { api } from "./authApi"; 

// 1. Lấy danh sách Wishlist (GET)
// Backend: GET /api/wishlist
export async function getWishlist() {
  // api.get tự động thêm API_BASE_URL và Header Authorization
  const response = await api.get("/api/wishlist");
  return response.data;
}

// 2. Thêm game vào wishlist (POST)
// Backend: POST /api/wishlist/add/{gameId}
export async function createWishlist(gameId) {
  const response = await api.post(`/api/wishlist/add/${gameId}`);
  return response.data;
}

// 3. Xóa game khỏi wishlist (DELETE)
// Backend: DELETE /api/wishlist/{gameId}
export async function updateWishlist(gameId) {
  const response = await api.delete(`/api/wishlist/${gameId}`);
  return response.data;
}