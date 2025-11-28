// customer.js
// Helper to fetch customers from backend using shared auth client.
// Expected backend response: Array of objects like
// { id, fullName, email, date, status, username }

import { api } from './authApi.js';

/**
 * Fetch all customers from backend.
 * @param {Function} setAccessToken - function from UserContext to update access token after refresh
 * @returns {Promise<Array>} array of customer objects
 */
export const getAllCustomers = async (setAccessToken) => {
  try {
    // follow same pattern as getAllPublisher
    return await api.get('/api/customers', setAccessToken);
  } catch (err) {
    console.error('getAllCustomers error:', err);
    throw err;
  }
};

export default {
  getAllCustomers,
};

export async function blockCustomer(customerId, reason, setAccessToken) {
  try {
    return await api.post(`/api/customers/${customerId}/block`, { reason }, setAccessToken);
  } catch (err) {
    console.error('blockCustomer error:', err);
    throw err;
  }
}

export async function unblockCustomer(customerId, setAccessToken) {
  try {
    return await api.post(`/api/customers/${customerId}/unblock`, {}, setAccessToken);
  } catch (err) {
    console.error('unblockCustomer error:', err);
    throw err;
  }
}
