import { api } from "./authApi";

/**
 * Lấy danh sách khuyến mãi của publisher hiện tại
 * @param {function} setAccessToken - Function để update access token từ UserContext
 * @returns {Promise<Array>} Danh sách khuyến mãi
 */
export const getMyPromotions = async (setAccessToken) => {
  try {
    console.log("📋 Fetching my promotions...");
    const response = await api.get("/api/promotions", setAccessToken);
    console.log("✅ Promotions response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching promotions:", error);
    throw error;
  }
};

/**
 * Tìm kiếm và lọc khuyến mãi với phân trang
 * @param {function} setAccessToken - Function để update access token
 * @param {object} params - Tham số tìm kiếm
 * @param {string} params.keyword - Từ khóa tìm kiếm (tên khuyến mãi)
 * @param {string} params.fromDate - Lọc từ ngày (format: YYYY-MM-DD)
 * @param {string} params.toDate - Lọc đến ngày (format: YYYY-MM-DD)
 * @param {string} params.status - Trạng thái (ALL, ACTIVE, UPCOMING, EXPIRED)
 * @param {number} params.page - Số trang (default: 0)
 * @param {number} params.size - Số lượng item mỗi trang (default: 10)
 * @returns {Promise<object>} Object chứa data và pagination info
 */
export const searchPromotions = async (setAccessToken, params = {}) => {
  try {
    const {
      keyword,
      fromDate,
      toDate,
      status = "ALL",
      page = 0,
      size = 10
    } = params;

    // Xây dựng query params
    const queryParams = new URLSearchParams();
    
    if (keyword && keyword.trim()) {
      queryParams.append('keyword', keyword.trim());
    }
    if (fromDate) {
      queryParams.append('fromDate', fromDate);
    }
    if (toDate) {
      queryParams.append('toDate', toDate);
    }
    if (status) {
      queryParams.append('status', status);
    }
    queryParams.append('page', page);
    queryParams.append('size', size);

    const queryString = queryParams.toString();
    const url = `/api/promotions/search?${queryString}`;

    console.log("Searching promotions:", url);
    const response = await api.get(url, setAccessToken);
    console.log("✅ Search promotions response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ Error searching promotions:", error);
    throw error;
  }
};

/**
 * Tạo khuyến mãi mới
 * @param {function} setAccessToken - Function để update access token
 * @param {object} promotionData - Dữ liệu khuyến mãi
 * @param {string} promotionData.name - Tên khuyến mãi
 * @param {string} promotionData.description - Mô tả
 * @param {string} promotionData.startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} promotionData.endDate - Ngày kết thúc (YYYY-MM-DD)
 * @param {boolean} promotionData.isActive - Trạng thái active
 * @param {number} promotionData.discountPercent - Giảm theo % (0-100)
 * @param {number} promotionData.discountAmount - Giảm theo số tiền cố định
 * @returns {Promise<object>} Khuyến mãi đã tạo
 */
export const createPromotion = async (setAccessToken, promotionData) => {
  try {
    console.log("➕ Creating promotion:", promotionData);
    const response = await api.post("/api/promotions", promotionData, setAccessToken);
    console.log("✅ Created promotion:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating promotion:", error);
    throw error;
  }
};

/**
 * Áp dụng khuyến mãi cho các game
 * @param {function} setAccessToken - Function để update access token
 * @param {number} promotionId - ID của khuyến mãi
 * @param {Array<number>} gameIds - Danh sách ID các game
 * @returns {Promise<string>} Thông báo thành công
 */
export const applyPromotionToGames = async (setAccessToken, promotionId, gameIds) => {
  try {
    console.log(`🎮 Applying promotion ${promotionId} to games:`, gameIds);
    const response = await api.post(
      `/api/promotions/${promotionId}/apply`,
      { gameIds },
      setAccessToken
    );
    console.log("✅ Applied promotion:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error applying promotion:", error);
    throw error;
  }
};

/**
 * Gỡ khuyến mãi khỏi game
 * @param {function} setAccessToken - Function để update access token
 * @param {number} gameId - ID của game
 * @returns {Promise<string>} Thông báo thành công
 */
export const removePromotionFromGame = async (setAccessToken, gameId) => {
  try {
    console.log(`🗑️ Removing promotion from game ${gameId}`);
    const response = await api.delete(
      `/api/promotions/games/${gameId}`,
      setAccessToken
    );
    console.log("✅ Removed promotion:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error removing promotion:", error);
    throw error;
  }
};
