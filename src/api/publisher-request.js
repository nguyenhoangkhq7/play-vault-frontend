import { api } from './authApi.js';

export async function getPublisherReuqestByUserName(username, setAccessToken) {
  try {
    const response = await api.get(`/api/publisher-requests/${username}`, setAccessToken);
    return response || null;
  } catch (error) {
    console.error('Error fetching publisherRequest:', error);
    return null;
  }
}


export async function approvePublisherRequest(id, setAccessToken) {
  try {
    await api.put(`/api/publisher-requests/${id}/approve`, {}, setAccessToken);
    return true;
  } catch (error) {
    console.error("Error updating publisher request status:", error);
    return false;
  }
}

// 3. Từ chối
export async function rejectPublisherRequest(id, setAccessToken) {
  try {
    await api.put(`/api/publisher-requests/${id}/reject`, {}, setAccessToken);
    return true;
  } catch (error) {
    console.error("Error rejecting publisher request:", error);
    return false;
  }
}
