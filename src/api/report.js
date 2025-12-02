import { api } from './authApi.js';

export async function getReports(params = {}, setAccessToken) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/api/reports${query ? `?${query}` : ''}`;
    const response = await api.get(url, setAccessToken);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
}

export async function processReport(reportId, approved, adminNote, setAccessToken) {
  try {
    const url = `/api/reports/${reportId}/process`;
    const data = { approved, adminNote };
    const response = await api.put(url, data, setAccessToken);
    return response.data;
  } catch (error) {
    console.error('Error processing report:', error);
    throw error;
  }
}

export async function submitReport(reportData, setAccessToken) {
  try {
    const response = await api.post('/api/reports', reportData, setAccessToken);
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
}

export async function checkOrderExists(orderId, setAccessToken) {
  try {
    // Giả sử có API để kiểm tra đơn hàng, nếu không thì có thể dùng API lấy orders
    const response = await api.get(`/api/orders/${orderId}/validate`, setAccessToken);
    return response.data ? true : false;
  } catch (error) {
    if (error.response?.status === 404) {
      return false; // Đơn hàng không tồn tại
    }
    console.error('Error checking order existence:', error);
    throw error;
  }
}