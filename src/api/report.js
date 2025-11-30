// Import object 'api' từ file authAPI của bạn
import { api } from "./authApi"; 

// 1. API Lấy danh sách doanh thu theo Game
export async function fetchGameRevenue(from, to) {
  // api.get trả về axios response, dữ liệu nằm trong .data
  const response = await api.get(`/api/reports/game-revenue?from=${from}&to=${to}`);
  return response.data;
}

// 2. API Lấy tổng quan
export async function fetchReportSummary(from, to) {
  const response = await api.get(`/api/reports/summary?from=${from}&to=${to}`);
  return response.data;
}

// 3. API Lấy dữ liệu biểu đồ
export async function fetchRevenueTrend(from, to) {
  const response = await api.get(`/api/reports/revenue-over-time?from=${from}&to=${to}`);
  return response.data;
}

// 4. Hàm xuất báo cáo (Sử dụng hàm downloadFile cực tiện của bạn)
export async function downloadReport(from, to, format, compare) {
  const filename = `Baocao_${from}_${to}.${format === 'csv' ? 'csv' : 'xlsx'}`;
  
  // Hàm này của bạn đã tự xử lý việc tạo thẻ <a> và click tải xuống rồi
  // Chúng ta chỉ cần await nó chạy xong là được
  await api.downloadFile(
    `/api/reports/export?from=${from}&to=${to}&format=${format}&compare=${compare}`,
    null, // setAccessToken (có thể để null nếu không cần update context ở đây)
    filename
  );
}