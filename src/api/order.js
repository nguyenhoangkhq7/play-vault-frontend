// src/api/orders.js
import { API_BASE_URL } from "../config/api";

/**
 * Lấy orders (pageable) của user theo userId
 * Trả về object { content: [...], totalElements, totalPages, page, size }
 */
export async function fetchOrdersByUserId(userId, page = 0, size = 20, token = "") {
  const url = `${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/orders?page=${page}&size=${size}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => null);
    const err = new Error(`Fetch orders failed: ${resp.status} ${resp.statusText}`);
    err.status = resp.status;
    err.body = text;
    throw err;
  }

  const data = await resp.json();
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, page, size };
  }

  return {
    content: data.content || data,
    totalElements: data.totalElements ?? (data.content ? data.content.length : 0),
    totalPages: data.totalPages ?? 1,
    page,
    size
  };
}
