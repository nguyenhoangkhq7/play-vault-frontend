import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/api/systemrequirements`

export async function getSystemReuqirementByGameId(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch game ${id}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching game ${id}:`, error)
    throw error
  }
}
