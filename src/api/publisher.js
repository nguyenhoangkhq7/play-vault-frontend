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
const BASE = import.meta.env.VITE_API_URL ?? "";

export async function getPublisherByUsername(username) {
  const res = await fetch(`${BASE}/api/publishers/by-username/${encodeURIComponent(username)}/profile`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`getPublisherByUsername failed: ${res.status}`);
  return res.json();
}

// Cập nhật theo publisherId (khuyên dùng)
export async function updatePublisherProfileById(publisherId, payload) {
  if (!publisherId) throw new Error("Missing publisherId");
  const res = await fetch(`${BASE}/api/publishers/${publisherId}/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updatePublisherProfileById failed: ${res.status}`);
  return res.json();
}
