import { api } from './authApi.js';

export async function getBlockRecordByUserName(username, setAccessToken) {
  try {
    return await api.get(`/api/block-records/${username}`, setAccessToken);
  } catch (error) {
    console.error('Error fetching block record:', error);
    throw error;
  }
}

export async function blockUser(username, reason, setAccessToken) {
  try {
    await api.post(`/api/block-records/${username}/block`, { reason }, setAccessToken);
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
}

export async function unblockUser(username, setAccessToken) {
  try {
    await api.post(`/api/block-records/${username}/unblock`, {}, setAccessToken);
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
}