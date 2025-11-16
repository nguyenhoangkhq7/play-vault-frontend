import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/games`

export async function getGames() {
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

export async function getGameById(id) {
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

export async function updateGame(id, gameData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update game ${id}: ${response.statusText}`);
    }
    const updatedData = await response.json();
    return updatedData; // Return the updated game data if provided by the server
  } catch (error) {
    console.error(`Error updating game ${id}:`, error);
    throw error;
  }
}

export async function addGame(gameData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });
    if (!response.ok) {
      throw new Error(`Failed to add game: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
}

export async function deleteGame(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete game ${id}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting game ${id}:`, error);
    throw error;
  }
}