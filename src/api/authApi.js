import axios from "axios";
import { API_BASE_URL, REFRESH_TOKEN_URL } from "../config/api";

// Gọi API và tự refresh token nếu 401
const callWithRefresh = async (requestFn, setAccessToken) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        // Gọi refresh token
        const refreshRes = await axios.post(
          REFRESH_TOKEN_URL,
          {},
          { withCredentials: true }
        );
        const { token } = refreshRes.data;
        localStorage.setItem("accessToken", token);
        setAccessToken?.(token); // update context
        return await requestFn(); // retry request cũ
      } catch (refreshError) {
        // Xóa token và redirect về login nếu refresh thất bại
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw refreshError;
      }
    }
    throw error;
  }
};

// Login nhận cả user + accessToken
export const loginApi = async (username, password) => {
  console.log("📤 Gửi request login:", { username, password: "***" });
  console.log("🌐 API URL:", `${API_BASE_URL}/api/auth/login`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      { username, password },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Response nhận được:", response);
    console.log("📦 Response.data:", response.data);

    // Backend trả về "token" thay vì "accessToken"
    const { token, user } = response.data;

    console.log("🔑 Token:", token);
    console.log("👤 User:", user);

    if (!token || !user) {
      console.error("❌ THIẾU DỮ LIỆU:");
      console.error("  - token:", token);
      console.error("  - user:", user);
      throw new Error("Login thất bại - Thiếu token hoặc user");
    }

    // Return với tên "accessToken" để code khác không cần sửa
    return { accessToken: token, user };
  } catch (error) {
    console.error("❌ ERROR trong loginApi:");
    console.error("  - Status:", error.response?.status);
    console.error("  - Response Data:", error.response?.data);
    throw error;
  }
};

// Register API
export const registerApi = async (userData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      userData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ ERROR trong registerApi:", error.response?.data);
    throw error;
  }
};

// Logout API
export const logoutApi = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    // Xóa token khỏi localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    return response.data;
  } catch (error) {
    console.error("❌ ERROR trong logoutApi:", error.response?.data);
    // Vẫn xóa token dù API lỗi
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    throw error;
  }
};

// Wrapper API chung
export const api = {
  /**
   * GET request
   * @param {string} url - API endpoint (e.g., "/users" or "/users/123")
   * @param {function} setAccessToken - Function to update access token in context
   * @param {object} config - Additional axios config (optional)
   */
  get: (url, setAccessToken, config = {}) =>
    callWithRefresh(
      () =>
        axios.get(`${API_BASE_URL}${url}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            ...config.headers,
          },
          withCredentials: true,
          ...config,
        }),
      setAccessToken
    ),

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @param {function} setAccessToken - Function to update access token in context
   * @param {object} config - Additional axios config (optional)
   */
  post: (url, data, setAccessToken, config = {}) =>
    callWithRefresh(
      () =>
        axios.post(`${API_BASE_URL}${url}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
            ...config.headers,
          },
          withCredentials: true,
          ...config,
        }),
      setAccessToken
    ),

  /**
   * PUT request (update toàn bộ resource)
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @param {function} setAccessToken - Function to update access token in context
   * @param {object} config - Additional axios config (optional)
   */
  put: (url, data, setAccessToken, config = {}) =>
    callWithRefresh(
      () =>
        axios.put(`${API_BASE_URL}${url}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
            ...config.headers,
          },
          withCredentials: true,
          ...config,
        }),
      setAccessToken
    ),

  /**
   * PATCH request (update một phần resource)
   * @param {string} url - API endpoint
   * @param {object} data - Request body
   * @param {function} setAccessToken - Function to update access token in context
   * @param {object} config - Additional axios config (optional)
   */
  patch: (url, data, setAccessToken, config = {}) =>
    callWithRefresh(
      () =>
        axios.patch(`${API_BASE_URL}${url}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
            ...config.headers,
          },
          withCredentials: true,
          ...config,
        }),
      setAccessToken
    ),

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {function} setAccessToken - Function to update access token in context
   * @param {object} config - Additional axios config (optional)
   */
  delete: (url, setAccessToken, config = {}) =>
    callWithRefresh(
      () =>
        axios.delete(`${API_BASE_URL}${url}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            ...config.headers,
          },
          withCredentials: true,
          ...config,
        }),
      setAccessToken
    ),

  /**
   * Upload file (FormData)
   * @param {string} url - API endpoint
   * @param {FormData} formData - Form data containing file
   * @param {function} setAccessToken - Function to update access token in context
   * @param {function} onUploadProgress - Progress callback (optional)
   */
  uploadFile: (url, formData, setAccessToken, onUploadProgress) =>
    callWithRefresh(
      () =>
        axios.post(`${API_BASE_URL}${url}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress,
        }),
      setAccessToken
    ),

  /**
   * Download file
   * @param {string} url - API endpoint
   * @param {function} setAccessToken - Function to update access token in context
   * @param {string} filename - Filename to save as
   */
  downloadFile: async (url, setAccessToken, filename) => {
    try {
      const response = await callWithRefresh(
        () =>
          axios.get(`${API_BASE_URL}${url}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            withCredentials: true,
            responseType: "blob",
          }),
        setAccessToken
      );

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response;
    } catch (error) {
      console.error("❌ ERROR trong downloadFile:", error);
      throw error;
    }
  },
};
