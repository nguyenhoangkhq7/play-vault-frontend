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
        const { accessToken } = refreshRes.data;
        localStorage.setItem("accessToken", accessToken);
        setAccessToken?.(accessToken); // update context
        return await requestFn(); // retry request cũ
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        throw error;
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

// Wrapper API chung
export const api = {
  get: (url, setAccessToken) =>
    callWithRefresh(
      () =>
        axios.get(`${API_BASE_URL}${url}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
        }),
      setAccessToken
    ),

  post: (url, data, setAccessToken) =>
    callWithRefresh(
      () =>
        axios.post(`${API_BASE_URL}${url}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
        }),
      setAccessToken
    ),

  // put, delete tương tự...
};
