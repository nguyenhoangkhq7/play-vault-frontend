import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/api/publishers`

export async function getAllPublisher() {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch publishers: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw error;
  }
}

export async function getPublisherByUsername(username) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API_URL}/by-username/${encodeURIComponent(username)}/profile`, {
    credentials: "include",
    headers: { "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error(`getPublisherByUsername failed: ${res.status}`);
  return res.json();
}

// Cập nhật theo publisherId (khuyên dùng)
export async function updatePublisherProfileById(publisherId, payload) {
  const id = (typeof publisherId === "number" || typeof publisherId === "string")
    ? String(publisherId).trim()
    : "";

  if (!id) throw new Error("updatePublisherProfileById: publisherId rỗng/không hợp lệ");
  const token = localStorage.getItem("accessToken");
  const url = `${API_URL}/${encodeURIComponent(id)}/profile`;

  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" ,
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`updatePublisherProfileById failed: ${res.status} ${text}`);
  }
  return res.json();
}