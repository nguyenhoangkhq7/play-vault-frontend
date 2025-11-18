import { api } from "./authApi";

/**
 * Lấy danh sách game đã mua của user hiện tại
 * @param {function} setAccessToken - Function để update access token từ UserContext
 * @param {object} filters - Object chứa các filter params
 * @param {string} filters.name - Tên game (tìm kiếm)
 * @param {string} filters.category - Tên thể loại
 * @param {number} filters.minPrice - Giá tối thiểu
 * @param {number} filters.maxPrice - Giá tối đa
 * @returns {Promise<Array>} Danh sách game đã mua
 */
export const getMyPurchasedGames = async (setAccessToken, filters = {}) => {
  try {
    // Xây dựng query params từ filters
    const params = new URLSearchParams();
    
    if (filters.name) {
      params.append('name', filters.name);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params.append('maxPrice', filters.maxPrice);
    }

    // Tạo URL với query params
    const queryString = params.toString();
    const url = `/api/library/my-games${queryString ? `?${queryString}` : ''}`;

    console.log("📚 Fetching purchased games:", url);
    
    const response = await api.get(url, setAccessToken);
    
    console.log("✅ Purchased games response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching purchased games:", error);
    throw error;
  }
};

/**
 * Lấy danh sách game đã mua với phân trang (nếu backend hỗ trợ sau này)
 * @param {function} setAccessToken - Function để update access token
 * @param {object} options - Options cho pagination và filters
 * @returns {Promise<object>} Object chứa data và pagination info
 */
export const getMyPurchasedGamesWithPagination = async (
  setAccessToken,
  options = {}
) => {
  try {
    const { page = 0, size = 20, ...filters } = options;
    
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    if (filters.name) params.append('name', filters.name);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);

    const queryString = params.toString();
    const url = `/api/library/my-games?${queryString}`;

    const response = await api.get(url, setAccessToken);
    
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching paginated purchased games:", error);
    throw error;
  }
};
