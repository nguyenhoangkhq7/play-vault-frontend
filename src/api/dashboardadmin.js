// Import object 'api' từ file authAPI của bạn
// (Hãy kiểm tra lại đường dẫn import cho đúng với cấu trúc thư mục của bạn)
import { api } from "./authApi"; 

// 1. Lấy dữ liệu Order Items trong ngày hôm nay
export async function getDataToDay() {
  // api.get tự động xử lý: Base URL, Header Auth, Refresh Token
  const response = await api.get("/admin/orderitems/today");
  return response.data;
}

// 2. Lấy số lượng tài khoản tạo mới trong ngày hôm nay
export async function getDataAccountCreateToday() {
  const response = await api.get("/admin/accounts/today");
  return response.data;
}