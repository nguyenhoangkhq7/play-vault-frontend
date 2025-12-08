import axios from "axios"
import { API_BASE_URL } from "../config/api.js"

const R2_API_URL = `${API_BASE_URL}/api/r2`

/**
 * 📤 BƯỚC 1: Lấy Pre-signed Upload URL
 * @param {string} extension - Đuôi file (vd: rar, zip, exe)
 * @returns {Promise<{uploadUrl: string, filePath: string, method: string, message: string}>}
 */
export const getPresignedUploadUrl = async (extension) => {
  try {
    const token = localStorage.getItem("accessToken")
    
    if (!token) {
      throw new Error("Vui lòng đăng nhập để upload game")
    }

    console.log(`📤 Getting presigned upload URL for .${extension}...`)
    console.log(`🔑 Token length: ${token?.length || 0}`)

    const response = await axios.post(
      `${R2_API_URL}/presigned-upload-url?extension=${extension}`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log("✅ Presigned URL received:", response.data)
    return response.data

  } catch (error) {
    console.error("❌ Get presigned URL error:", error)
    
    if (error.response) {
      const errorData = error.response.data
      throw new Error(errorData.error || errorData.message || "Không thể lấy link upload")
    }
    
    throw error
  }
}

/**
 * 📤 BƯỚC 2: Upload File lên R2 qua Presigned URL
 * @param {string} uploadUrl - URL từ getPresignedUploadUrl
 * @param {File} file - File cần upload
 * @param {function} onProgress - Callback nhận % tiến độ (0-100)
 * @returns {Promise<void>}
 */
export const uploadFileToR2 = async (uploadUrl, file, onProgress) => {
  try {
    console.log(`📤 Uploading file ${file.name} to R2...`)

    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.total * 100) / progressEvent.total)
          onProgress?.(percentCompleted)
        }
      }
    })

    console.log("✅ File uploaded successfully to R2")

  } catch (error) {
    console.error("❌ Upload to R2 error:", error)
    throw new Error("Không thể upload file lên R2")
  }
}

/**
 * Download game file với kiểm tra ownership
 * @param {number} gameId - ID của game
 * @returns {Promise<{downloadUrl: string, message: string}>}
 */
export const downloadGameWithOwnership = async (gameId) => {
  try {
    const token = localStorage.getItem("accessToken")
    
    if (!token) {
      throw new Error("Vui lòng đăng nhập để tải game")
    }

    console.log(`🎮 Requesting download for game ${gameId}...`)

    const response = await axios.get(`${R2_API_URL}/download-game/${gameId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log("✅ Download link generated:", response.data)
    return response.data

  } catch (error) {
    console.error("❌ Download game error:", error)
    
    if (error.response) {
      // Backend trả về lỗi cụ thể
      const errorData = error.response.data
      throw new Error(errorData.error || errorData.message || "Không thể tải game")
    }
    
    throw error
  }
}

/**
 * Download game và tự động trigger browser download
 * @param {number} gameId - ID của game
 * @param {string} gameName - Tên game (dùng làm tên file)
 */
export const triggerGameDownload = async (gameId, gameName) => {
  try {
    const result = await downloadGameWithOwnership(gameId)
    
    if (result.downloadUrl) {
      // Tạo link ẩn để trigger download
      const link = document.createElement("a")
      link.href = result.downloadUrl
      link.setAttribute("download", `${gameName || `game-${gameId}`}.zip`)
      link.setAttribute("target", "_blank")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log("✅ Download triggered for:", gameName)
      return result
    } else {
      throw new Error("Không nhận được link tải")
    }
  } catch (error) {
    console.error("❌ Trigger download error:", error)
    throw error
  }
}
