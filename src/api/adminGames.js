import axiosClient from "./axiosClient";

const adminGames = {
  // 1. Lấy danh sách Approved
  getApprovedGames: (params) => {
    return axiosClient.get("/admin/games/approved", { params });
  },

  // 2. Cập nhật trạng thái Active/Inactive
  updateGameStatus: (gameId, newStatus) => {
    return axiosClient.put(`/admin/games/${gameId}/status`, null, {
      params: { newStatus }
    });
  },

  // 3. Lấy danh sách Pending
  getPendingGames: (params) => {
    return axiosClient.get("/admin/games/pending", { params });
  },

  // 4. Lấy chi tiết game (cho cả Pending/Approved)
  getGameDetail: (gameId) => {
    return axiosClient.get(`/admin/games/${gameId}`);
  },

  // 5. Duyệt game (Approve)
  approveGame: (gameId) => {
    return axiosClient.put(`/admin/games/${gameId}/approve`);
  },

  // 6. Từ chối game (Reject)
  rejectGame: (gameId, reason = "") => {
    return axiosClient.put(`/admin/games/${gameId}/reject`, null, {
        params: { reason } // Gửi reason dưới dạng query param
    });
  },

  getDashboardStats: () => {
    const url = '/admin/games/stats';
    return axiosClient.get(url);
  },
  getCategories: () => {
    return axiosClient.get("/categories"); 
  },

  getSubmissions: (params) => {
    // params: { page, size, searchQuery, status }
    return axiosClient.get("/admin/games/submissions", { params });
  },
};

export default adminGames;