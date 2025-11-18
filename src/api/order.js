// src/api/orders.js
import { API_BASE_URL } from "../config/api.js";

const BASE = `${API_BASE_URL}/api/users`;

/**
 * Lấy lịch sử đơn hàng (pageable) từ backend:
 * GET /api/users/{userId}/orders?page=0&size=10
 * Trả về JSON (Page<OrderDto> hoặc array tuỳ backend).
 *
 * @param {number|string} userId
 * @param {number} page default 0
 * @param {number} size default 10
 */
export async function getOrderHistory(userId, page = 0, size = 10) {
  if (!userId) throw new Error("userId is required");

  const q = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const url = `${BASE}/${userId}/orders${q}`;

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      const msg = text || `${resp.status} ${resp.statusText}`;
      throw new Error(`Failed to fetch order history: ${msg}`);
    }

    // Back-end có thể trả Page<T> hoặc array, ta parse JSON và trả nguyên vẹn
    return await resp.json();
  } catch (err) {
    console.error("Error in getOrderHistory:", err);
    throw err;
  }
}