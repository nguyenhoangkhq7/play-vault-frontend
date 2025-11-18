import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/api/publisher-requests`

export async function getPublisherReuqestByUserName(username) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/${username}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    // Nếu response trả về body rỗng → không parse
    const text = await response.text();
    if (!text) return null;   // ******** quan trọng ********

    return JSON.parse(text);

  } catch (error) {
    console.error('Error fetching publisherRequest:', error);
    return null;
  }
}


export async function updatePublisherRequestStatus(id) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/api/publisher-requests/${id}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) return false;

    return true;
  } catch (error) {
    console.error("Error updating publisher request status:", error);
    return false;
  }
}
