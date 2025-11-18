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
