import { api } from "./authApi";

/**
 * API cho thống kê doanh thu của Publisher
 */

/**
 * Lấy tổng quan doanh thu
 * @param {function} setAccessToken - Function để update access token
 * @param {object} params - Tham số lọc
 * @param {string} params.from - Từ ngày (YYYY-MM-DD)
 * @param {string} params.to - Đến ngày (YYYY-MM-DD)
 * @returns {Promise<object>} Tổng quan doanh thu
 */
export const getRevenueSummary = async (setAccessToken, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }

    const queryString = queryParams.toString();
    const url = `/api/publisher/revenue/summary${queryString ? '?' + queryString : ''}`;

    console.log("📊 Fetching revenue summary:", url);
    const response = await api.get(url, setAccessToken);
    console.log("✅ Revenue summary:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching revenue summary:", error);
    throw error;
  }
};

/**
 * Lấy doanh thu theo từng game
 * @param {function} setAccessToken - Function để update access token
 * @param {object} params - Tham số lọc
 * @param {string} params.from - Từ ngày (YYYY-MM-DD)
 * @param {string} params.to - Đến ngày (YYYY-MM-DD)
 * @returns {Promise<Array>} Danh sách doanh thu theo game
 */
export const getRevenueByGame = async (setAccessToken, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }

    const queryString = queryParams.toString();
    const url = `/api/publisher/revenue/by-game${queryString ? '?' + queryString : ''}`;

    console.log("🎮 Fetching revenue by game:", url);
    const response = await api.get(url, setAccessToken);
    console.log("✅ Revenue by game:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching revenue by game:", error);
    throw error;
  }
};

/**
 * Lấy doanh thu theo tháng trong năm
 * @param {function} setAccessToken - Function để update access token
 * @param {number} year - Năm cần xem (mặc định 2025)
 * @returns {Promise<Array>} Doanh thu theo tháng
 */
export const getMonthlyRevenue = async (setAccessToken, year = 2025) => {
  try {
    const url = `/api/publisher/revenue/monthly?year=${year}`;

    console.log("📈 Fetching monthly revenue:", url);
    const response = await api.get(url, setAccessToken);
    console.log("✅ Monthly revenue:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching monthly revenue:", error);
    throw error;
  }
};
