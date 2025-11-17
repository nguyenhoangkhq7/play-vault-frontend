// src/api/profile.js
import { API_BASE_URL } from "../config/api.js";

const BASE = `${API_BASE_URL}/api/users`;

// helper lấy token từ localStorage (hỗ trợ cả "accessToken" và "token")
function getSavedToken() {
  return localStorage.getItem("accessToken") || localStorage.getItem("token") || null;
}

/**
 * Lấy profile user theo id
 * GET /api/users/{id}/profile
 */
export async function getProfile(userId) {
  try {
    const token = getSavedToken();
    const resp = await fetch(`${BASE}/${userId}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      const msg = text || `${resp.status} ${resp.statusText}`;
      throw new Error(`Failed to load profile: ${msg}`);
    }

    return await resp.json();
  } catch (err) {
    console.error("Error in getProfile:", err);
    throw err;
  }
}

/**
 * Cập nhật profile user
 * PUT /api/users/{id}/profile
 * payload: { fullName, dateOfBirth, avatarUrl, gender, address, ... }
 */
export async function updateProfile(userId, payload) {
  try {
    const token = getSavedToken();
    const resp = await fetch(`${BASE}/${userId}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      const msg = text || `${resp.status} ${resp.statusText}`;
      throw new Error(`Failed to update profile: ${msg}`);
    }

    return await resp.json();
  } catch (err) {
    console.error("Error in updateProfile:", err);
    throw err;
  }
}

