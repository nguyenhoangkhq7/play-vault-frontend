import { api } from "./authApi"; 

/* ================================
   REPORTS – LẤY DỮ LIỆU & EXPORT
================================ */

// 1. Lấy danh sách doanh thu theo game
export async function fetchGameRevenue(from, to, setAccessToken) {
  const response = await api.get(
    `/api/reports/game-revenue?from=${from}&to=${to}`,
    setAccessToken
  );
  return response.data;
}

// 2. Tổng quan báo cáo
export async function fetchReportSummary(from, to, setAccessToken) {
  const response = await api.get(
    `/api/reports/summary?from=${from}&to=${to}`,
    setAccessToken
  );
  return response.data;
}

// 3. Dữ liệu biểu đồ doanh thu theo thời gian
export async function fetchRevenueTrend(from, to, setAccessToken) {
  const response = await api.get(
    `/api/reports/revenue-over-time?from=${from}&to=${to}`,
    setAccessToken
  );
  return response.data;
}

// 4. Export báo cáo
export async function downloadReport(from, to, format, compare, setAccessToken) {
  const filename = `Baocao_${from}_${to}.${format === "csv" ? "csv" : "xlsx"}`;
  await api.downloadFile(
    `/api/reports/export?from=${from}&to=${to}&format=${format}&compare=${compare}`,
    setAccessToken,
    filename
  );
}

/* ================================
        REPORT CRUD (main)
================================ */

// Lấy danh sách reports (filter)
export async function getReports(params = {}, setAccessToken) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/api/reports${query ? `?${query}` : ""}`;
    const response = await api.get(url, setAccessToken);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

// Xử lý report (approve / reject)
export async function processReport(reportId, approved, adminNote, setAccessToken) {
  try {
    const url = `/api/reports/${reportId}/process`;
    const data = { approved, adminNote };
    const response = await api.put(url, data, setAccessToken);
    return response.data;
  } catch (error) {
    console.error("Error processing report:", error);
    throw error;
  }
}

// User gửi report
export async function submitReport(reportData, setAccessToken) {
  try {
    const response = await api.post("/api/reports", reportData, setAccessToken);
    return response.data;
  } catch (error) {
    console.error("Error submitting report:", error);
    throw error;
  }
}

// Kiểm tra order có tồn tại không
export async function checkOrderExists(orderId, setAccessToken) {
  try {
    const response = await api.get(`/api/orders/${orderId}/validate`, setAccessToken);
    return response.data ? true : false;
  } catch (error) {
    if (error.response?.status === 404) return false;
    console.error("Error checking order existence:", error);
    throw error;
  }
}
