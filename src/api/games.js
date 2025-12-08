import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/api/games`

//API cũ
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

//end API cũ


export async function getGameById(id) {
  try {
    const response = await fetch(`${API_URL}/card/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch game ${id}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching game ${id}:`, error)
    throw error
  }
}

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

export async function getTopNGame(topGame) {
  try {
    const response = await fetch(`${API_URL}/top?limit=${topGame}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}

export async function getReviewByGameId(id) {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}

export async function getRalatedGameWithCategoryName(categoryName) {
  try {
    const response = await fetch(`${API_URL}?categoryName=${categoryName}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}

/**
 * Lấy danh sách games của publisher hiện tại
 * @param {function} setAccessToken - Function để update access token
 * @returns {Promise<Array>} Danh sách games
 */
export async function getMyGames(setAccessToken) {
  try {
    const accessToken = localStorage.getItem('accessToken')
    console.log('🎮 Fetching my games...')
    
    // SỬA: Gọi đúng endpoint của publisher
    const response = await fetch(`${API_BASE_URL}/api/promotions/my-games`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (response.status === 401) {
      // Token expired, try to refresh
      console.log('Token expired, refreshing...')
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (refreshResponse.ok) {
        const { accessToken: newToken } = await refreshResponse.json()
        localStorage.setItem('accessToken', newToken)
        setAccessToken(newToken)
        
        // Retry with new token
        const retryResponse = await fetch(`${API_URL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          }
        })
        
        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch games: ${retryResponse.statusText}`)
        }
        return await retryResponse.json()
      }
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching my games:', error)
    throw error
  }
}



/**
 * 📝 BƯỚC 3: Tạo Game Submission (Submit thông tin game)
 * @param {Object} gameData - Dữ liệu game theo GameCreateRequest
 * @returns {Promise<Object>} Game đã tạo
 */
export async function createGameSubmission(gameData) {
  try {
    const accessToken = localStorage.getItem('accessToken')
    
    if (!accessToken) {
      throw new Error('Vui lòng đăng nhập để tạo game')
    }

    console.log('📝 Creating game submission...', gameData)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(gameData)
    })

    if (response.status === 401) {
      throw new Error('Token hết hạn. Vui lòng đăng nhập lại.')
    }

    if (!response.ok) {
      let errorMessage = `Không thể tạo game: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        console.error('❌ Create game failed:', errorData)
        
        // Chi tiết lỗi từ backend
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        // Nếu không parse được JSON, lấy text
        const errorText = await response.text()
        console.error('❌ Create game error text:', errorText)
      }
      
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Game created successfully:', result)
    return result

  } catch (error) {
    console.error('Error creating game:', error)
    throw error
  }
}

// export async function fetchGameRevenue(from, to) {
//   try {
//     const res = await fetch(
//       `${API_URL}/revenue?from=${from}&to=${to}`
//     );

//     if (!res.ok) {
//       throw new Error("Failed to fetch game revenue");
//     }

//     return await res.json();
//   } catch (e) {
//     console.error("Error fetching revenue:", e);
//     throw e;
//   }
// }