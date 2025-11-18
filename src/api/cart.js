import { API_BASE_URL } from "../config/api.js"; // Import cấu hình API base

const API_CART_URL = "/api/cart"; // Đường dẫn API cho giỏ hàng

/**
 * Tạo headers chuẩn cho request
 * @returns {Headers}
 */
function getAuthHeaders() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);
  headers.append("Content-Type", "application/json");
  return headers;
}

/**
 * Xử lý phản hồi (response) chung
 */
async function handleResponse(response) {
  if (!response.ok) {
    // Nếu lỗi, thử đọc text
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(errorText || `Error: ${response.status} ${response.statusText}`);
  }
  // Nếu response là 204 No Content (thường gặp khi delete), trả về object rỗng
  if (response.status === 204) {
    return {}; 
  }
  return await response.json(); // Trả về JSON
}

// ===================================================================
// Các hàm API
// ===================================================================

/**
 * Lấy giỏ hàng.
 * Trả về toàn bộ object CartResponse từ backend.
 */
export async function getCart() {
  const url = `${API_BASE_URL}${API_CART_URL}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw new Error('Không thể tải giỏ hàng.');
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng bằng gameId.
 * Trả về object CartResponse đã cập nhật.
 */
export async function addToCart(gameId) {
  const url = `${API_BASE_URL}${API_CART_URL}/items/${gameId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: null, // Giống như code gốc của bạn
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Không thể thêm vào giỏ hàng.');
  }
}

/**
 * Xóa 1 item khỏi giỏ hàng bằng cartItemId.
 * Trả về object CartResponse đã cập nhật.
 */
export async function removeFromCart(cartItemId) {
  const url = `${API_BASE_URL}${API_CART_URL}/items/${cartItemId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Không thể xóa khỏi giỏ hàng.');
  }
}

/**
 * Xóa toàn bộ giỏ hàng.
 * Trả về object CartResponse đã cập nhật (thường là rỗng).
 */
export async function clearCart() {
  const url = `${API_BASE_URL}${API_CART_URL}/clear`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Không thể xóa toàn bộ giỏ hàng.');
  }
}