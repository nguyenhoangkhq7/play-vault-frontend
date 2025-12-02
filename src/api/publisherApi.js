// src/api/publisherApi.js
import axiosClient from "./axiosClient";

const publisherApi = {
  register: (data) => {
    // Đường dẫn này sẽ nối với baseURL trong axiosClient (thường là http://localhost:8080/api)
    const url = "/publishers/register"; 
    return axiosClient.post(url, data);
  },
  // 1. Lấy thống kê Dashboard (Card trên cùng và bên phải)
  getDashboardStats: (publisherId) => {
    return axiosClient.get(`/publishers/${publisherId}/stats`);
  },

  // 2. Lấy danh sách Game của Publisher
  getGames: (publisherId) => {
    return axiosClient.get(`/publishers/${publisherId}/games`);
  },

  // 3. Lấy dữ liệu biểu đồ doanh thu
  getRevenueChart: (publisherId, year) => {
    return axiosClient.get(`/publishers/${publisherId}/revenue-chart`, {
      params: { year },
    });
  },

  // 4. Cập nhật thông tin Game
  updateGame: (publisherId, gameId, data) => {
    return axiosClient.put(`/publishers/${publisherId}/games/${gameId}`, data);
  },
  
  // 5. Lấy danh sách thể loại (để đổ vào dropdown trong Modal)
  getCategories: () => {
      return axiosClient.get(`/categories`); 
  },
  deleteGame: (publisherId, gameId) => {
    return axiosClient.delete(`/publishers/${publisherId}/games/${gameId}`);
  },
};

export default publisherApi;