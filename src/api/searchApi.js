import { ur } from 'zod/v4/locales';
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


    searchGamesKey: (keyword) => {
    const url = '/games/search-for'; 
    return axiosClient.get(url, {
    params: { keyword }   // <---- đúng
  });
  },

  
  /**
   * Tìm kiếm game bằng AI
   * @param {string} query - Từ khóa tìm kiếm
   */
  searchGamesAI: (queryOrParams) => {
    const url = '/games/search-combined';

    if (typeof queryOrParams === 'string' || queryOrParams === undefined) {
      return axiosClient.get(url, { params: { keyword: queryOrParams || '' } });
    }

    const { keyword, query, ...rest } = queryOrParams || {};
    const finalKeyword = keyword ?? query ?? '';
    return axiosClient.get(url, { params: { keyword: finalKeyword, ...rest } });
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