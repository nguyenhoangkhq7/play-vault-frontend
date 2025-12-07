import axiosClient from './axiosClient';

const searchApi = {
  /**
   * Tìm kiếm game theo keyword, categoryId, giá
   * Backend method: searchGames(...)
   */
  searchGames: (params) => {
    // params bao gồm: { keyword, categoryId, minPrice, maxPrice, page, size }
    const url = '/games/search'; 
    return axiosClient.get(url, { params });
  },

  
  /**
   * Tìm kiếm game bằng AI
   * @param {string} query - Từ khóa tìm kiếm
   */
  searchGamesAI: (query) => {
    const url = '/games/search-ai';
    return axiosClient.get(url, { params: { query } });
  },

  // API phụ: Lấy danh sách Category để đổ vào thẻ Select (nếu bạn đã có API này)
  getAllCategories: () => {
    return axiosClient.get('/categories'); 
  },

  // Lấy chi tiết 1 game
  getGameDetail: (id) => {
    return axiosClient.get(`/games/${id}`);
  }
};

export default searchApi;