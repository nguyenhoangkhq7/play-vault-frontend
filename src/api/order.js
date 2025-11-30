// src/api/orders.js
import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/api`;

function getAuthHeader() {
  const t =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    "";
  return t ? { Authorization: `Bearer ${t.replace(/^"|"$/g, "")}` } : {};
}

function normalize(data, page, size) {
  if (!data) return { content: [], totalElements: 0, totalPages: 0, page, size };
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, page, size };
  }
  return {
    content: data.content ?? data.items ?? [],
    totalElements:
      data.totalElements ?? data.total ?? (data.content?.length ?? data.items?.length ?? 0),
    totalPages: data.totalPages ?? 1,
    page,
    size,
  };
}

export async function fetchOrdersByUserId(userId, page = 0, size = 20) {
  const url = `${BASE}/users/${encodeURIComponent(userId)}/orders?page=${page}&size=${size}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeader(),                // ✅ luôn có Bearer nếu đăng nhập
    },
  });

  if (resp.status === 204) {
    return { content: [], totalElements: 0, totalPages: 0, page, size };
  }

  const text = await resp.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!resp.ok) {
    const msg = (data && (data.message || data.error)) || text || `${resp.status} ${resp.statusText}`;
    const err = new Error(`Fetch orders failed: ${msg}`);
    err.status = resp.status;
    err.body = data ?? text;
    throw err;
  }

  return normalize(data, page, size);
}