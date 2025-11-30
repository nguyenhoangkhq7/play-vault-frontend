import { api } from './authApi.js';

export async function getAllPublisher(setAccessToken) {
  try {
    return await api.get('/api/publishers', setAccessToken);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw error;
  }
}
<<<<<<< HEAD

export async function approvePublisherRequest(requestId, setAccessToken) {
  try {
    return await api.post(`/api/publisher-requests/${requestId}/approve`, {}, setAccessToken);
  } catch (error) {
    console.error('Error approving publisher request:', error);
    throw error;
  }
}

export async function blockPublisher(publisherId, reason, setAccessToken) {
  try {
    return await api.post(`/api/publishers/${publisherId}/block`, { reason }, setAccessToken);
  } catch (error) {
    console.error('Error blocking publisher:', error);
    throw error;
  }
}

export async function unblockPublisher(publisherId, setAccessToken) {
  try {
    return await api.post(`/api/publishers/${publisherId}/unblock`, {}, setAccessToken);
  } catch (error) {
    console.error('Error unblocking publisher:', error);
    throw error;
  }
=======
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
>>>>>>> 991eb97 (done admin,customer profile)
}
