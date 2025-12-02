// src/api/reports.js
import axiosClient from "./axiosClient";

const reportApi = {
  // Tạo báo cáo lỗi
  createReport: async (formData) => {
    try {
      const response = await axiosClient.post("/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Gửi báo cáo thất bại";
    }
  },

  // Lấy danh sách đơn hàng để báo cáo (chỉ COMPLETED)
  getMyOrdersForReport: async () => {
    try {
      // axiosClient interceptor đã return response.data
      // Nên data ở đây chính là array orders
      const data = await axiosClient.get("/orders/my-orders-for-report");
      console.log("✅ Orders loaded:", data);
      return data;
    } catch (error) {
      console.error("❌ API Error:", error.response?.status, error.response?.data);
      throw error.response?.data?.message || "Lấy danh sách đơn hàng thất bại";
    }
  },

  // Lấy danh sách báo cáo của mình
  getMyReports: async () => {
    try {
      const response = await axiosClient.get("/reports/my");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lấy danh sách báo cáo thất bại";
    }
  },

  // Admin lấy tất cả báo cáo
  getAllReports: async () => {
    try {
      const response = await axiosClient.get("/reports");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lấy danh sách báo cáo thất bại";
    }
  },
};

export default reportApi;
