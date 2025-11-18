// src/api/profile.js
import { API_BASE_URL } from "../config/api.js";

const BASE = `${API_BASE_URL}/api/users`;

/**
 * Lấy profile user theo id
 * GET /api/users/{id}/profile
 */
export async function getProfile(userId) {
  try {
    const resp = await fetch(`${BASE}/${userId}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => null);
      throw new Error(txt || `Failed to fetch profile ${userId}: ${resp.status} ${resp.statusText}`);
    }
    return await resp.json(); // giả sử API trả object user (nếu trả wrapper, adjust ở chỗ gọi)
  } catch (error) {
    console.error(`Error fetching profile ${userId}:`, error);
    throw error;
  }
}

function getAuthHeader() {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function updateProfile(userId, payload) {
  const resp = await fetch(`${BASE}/${userId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(payload)
  });

  const text = await resp.text().catch(()=>null);
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch{ /* not json */ }

  if (!resp.ok) {
    // throw richer error so frontend biết status + message
    const msg = parsed?.message || parsed?.error || text || `${resp.status} ${resp.statusText}`;
    const err = new Error(`Failed to update profile: ${resp.status} ${msg}`);
    err.status = resp.status;
    err.body = parsed || text;
    throw err;
  }
  return parsed;
}

export async function uploadAvatar(userId, file) {
  const API = `${API_BASE_URL}/api/users/${userId}/avatar`;
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  const fd = new FormData();
  fd.append("file", file);

  const resp = await fetch(API, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // DON'T set Content-Type when sending FormData; browser sets boundary for you
    },
    body: fd
  });

  const txt = await resp.text().catch(() => null);
  let data;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }

  if (!resp.ok) {
    const err = new Error(`Upload failed: ${resp.status}`);
    err.status = resp.status;
    err.body = data || txt;
    throw err;
  }

  // Expect server returns { avatarUrl: "..." } or full profile object
  return data;
}
