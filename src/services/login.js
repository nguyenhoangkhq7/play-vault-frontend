// src/services/login.js
import axiosInstance from "../api/axiosInstance"; // Đường dẫn đúng đến axiosInstance

const LOGIN_API_URL = "/api/auth/login"; // Dùng relative path vì axiosInstance có baseURL

export async function loginUser(username, password) {
  try {
    const response = await axiosInstance.post(LOGIN_API_URL, {
      username,
      password,
    });

    // Backend trả về: { accessToken: "...", user: { ... } }
    const { accessToken, ...user } = response.data;

    // Lưu accessToken → axiosInstance sẽ tự thêm vào header
    localStorage.setItem("accessToken", accessToken);

    return { ...user, accessToken }; // Trả về user + token (nếu cần)
  } catch (error) {
    // Xử lý lỗi từ backend
    const message =
      error.response?.data?.message ||
      error.message ||
      "Đăng nhập thất bại. Vui lòng thử lại.";

    throw new Error(message);
  }
}
