import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/api/block-records`

export async function getBlockRecordByUserName(username) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_URL}/${username}`,{
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch block record: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching block record:', error)
    throw error
  }
}