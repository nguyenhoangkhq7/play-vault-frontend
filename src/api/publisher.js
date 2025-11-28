import { api } from './authApi.js';

export async function getAllPublisher(setAccessToken) {
  try {
    return await api.get('/api/publishers', setAccessToken);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw error;
  }
}

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
}
