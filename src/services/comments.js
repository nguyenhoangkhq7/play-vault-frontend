import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/comments`

import { getUsers } from "./users" // Nhập hàm lấy người dùng

export async function getComments() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching comments:", error)
    throw error
  }
}

export async function getCommentsByGameId(gameId) {
  try {
    const response = await fetch(`${API_URL}?game_id=${gameId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch comments for game ${gameId}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching comments for game ${gameId}:`, error)
    throw error
  }
}

export async function getCommentsWithUsers() {
  try {
    // Lấy tất cả comments
    const commentsResponse = await fetch(API_URL)
    if (!commentsResponse.ok) {
      throw new Error(`Failed to fetch comments: ${commentsResponse.statusText}`)
    }
    const comments = await commentsResponse.json()

    // Lấy tất cả users
    const users = await getUsers()

    // Kết hợp dữ liệu giữa comment và user
    const commentsWithUsers = comments.map((comment) => {
      const user = users.find((u) => u.id === comment.user_id)
      return { ...comment, user }
    })

    return commentsWithUsers
  } catch (error) {
    console.error("Error fetching comments with users:", error)
    throw error
  }
}

export async function getCommentsByGameIdWithUsers(gameId) {
  try {
    const commentsResponse = await fetch(`${API_URL}?game_id=${gameId}`)
    if (!commentsResponse.ok) {
      throw new Error(`Failed to fetch comments for game ${gameId}: ${commentsResponse.statusText}`)
    }
    const comments = await commentsResponse.json()
    const users = await getUsers()

    const commentsWithUsers = comments.map((comment) => {
      const user = users.find((u) => u.id === comment.user_id)
      return {
        ...comment,
        user,
        isPositive: comment.rating >= 3, // Tự động tính isPositive
      }
    })

    return commentsWithUsers
  } catch (error) {
    console.error(`Error fetching comments for game ${gameId} with users:`, error)
    throw error
  }
}

// Thêm hàm để lưu comment mới
export async function addComment(comment) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}


