import { api } from "./authApi";

export const reviewApi = {
  /**
   * Lấy danh sách đánh giá của một game (có phân trang, lọc, sắp xếp)
   * @param {number} gameId - ID của game
   * @param {object} params - Object chứa { page, size, sort, rating }
   * @param {function} setAccessToken - Hàm update context token (để refresh token hoạt động)
   */
  getReviewsByGameId: async (gameId, params, setAccessToken) => {
    // Chuyển đổi object params thành query string
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append("page", params.page);
    if (params.size !== undefined) queryParams.append("size", params.size);
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.rating) queryParams.append("rating", params.rating);

    const url = `/api/games/reviews/${gameId}?${queryParams.toString()}`;

    // Sử dụng api wrapper đã viết bên authApi
    const response = await api.get(url, setAccessToken);
    return response.data;
  },

  /**
   * Thêm đánh giá mới
   * @param {object} data - { gameId, rating, comment }
   * @param {function} setAccessToken - Hàm update context token
   */
  addReview: async (data, setAccessToken) => {
    const url = `/api/games/reviews/add`;
    const response = await api.post(url, data, setAccessToken);
    return response.data;
  },
};
