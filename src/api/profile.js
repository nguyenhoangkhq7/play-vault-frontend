// src/api/profile.js
import { API_BASE_URL } from "../config/api.js";

// ĐÚNG 100% - không bị lỗi /api/users/api/users nữa
const BASE_URL = `${API_BASE_URL}/api/users`;

// Helper lấy token (dùng chung cho tất cả request cần auth)
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Lấy thông tin profile của user
 * GET /api/users/{id}/profile
 */
export const getProfile = async (userId) => {
  if (!userId) throw new Error("userId is required");

  const response = await fetch(`${BASE_URL}/${userId}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(), // thêm token nếu có
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Không thể tải hồ sơ: ${response.status} ${response.statusText}`
    );
  }

  return await response.json(); // trả về trực tiếp UserProfileDto
};

/**
 * Cập nhật thông tin profile
 * PUT /api/users/{id}/profile
 */
export const updateProfile = async (userId, payload) => {
  const response = await fetch(`${BASE_URL}/${userId}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!response.ok) {
    const msg = data?.message || data?.error || text || response.statusText;
    throw new Error(`Cập nhật thất bại: ${msg}`);
  }

  return data; // backend trả UserProfileDto đã cập nhật
};

/**
 * Upload avatar (gọi riêng endpoint avatar nếu bạn có)
 * POST /api/users/{id}/avatar
 */
export const uploadAvatar = async (userId, file) => {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/avatar`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      // Không set Content-Type → browser tự thêm boundary
    },
    body: formData,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Upload avatar thất bại: ${response.status}`
    );
  }

  // Backend nên trả về { avatarUrl: "..." } hoặc full profile
  return data;
};
