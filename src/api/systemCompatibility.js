// frontend/api/systemCompatibility.js
import api from './axiosClient';

const systemCompatibilityService = {
  /**
   * Upload file DXDiag và kiểm tra tương thích (đã đăng nhập)
   */
  uploadAndCheckCompatibility: async (gameId, file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // 1. Upload file DXDiag
      const uploadResponse = await api.post('/system-config/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Upload thất bại');
      }

      // 2. So sánh với game
      const compareResponse = await api.get(`/system-config/compare/${gameId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      return compareResponse;
    } catch (error) {
      console.error('Error in uploadAndCheckCompatibility:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra nhanh không cần đăng nhập
   */
  quickCheckCompatibility: async (gameId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(`/system-config/quick-check/${gameId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error in quickCheckCompatibility:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin cấu hình đã lưu của user
   */
  getUserSystemInfo: async (token) => {
    try {
      const response = await api.get('/system-config/user', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error('Error fetching user system info:', error);
      throw error;
    }
  },

  /**
   * So sánh cấu hình với game (đã có cấu hình lưu sẵn)
   */
  compareWithGame: async (gameId, token) => {
    try {
      const response = await api.get(`/system-config/compare/${gameId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error('Error comparing with game:', error);
      throw error;
    }
  },

  /**
   * Xóa cấu hình của user
   */
  deleteSystemInfo: async (token) => {
    try {
      const response = await api.delete('/system-config/delete', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error('Error deleting system info:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin cấu hình yêu cầu của game
   * (Vẫn giữ cho tương thích ngược nếu có component cũ dùng)
   */
  getGameSystemRequirements: async (gameId) => {
    try {
      // Bạn có thể gọi endpoint game detail để lấy system requirement
      const response = await api.get(`/games/${gameId}`);
      return {
        success: true,
        systemRequirements: response.systemRequirement
      };
    } catch (error) {
      console.error('Error fetching game system requirements:', error);
      throw error;
    }
  }
};

export default systemCompatibilityService;