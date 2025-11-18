import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/api/categories`

export async function getCategories() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}