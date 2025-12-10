import axiosClient from "./axiosClient";
import axios from "axios";

const R2_API_URL = "/r2";

/**
 * 📤 Lấy presigned upload URL từ backend
 * @param {string} extension - Đuôi file (ví dụ: "rar", "zip", "exe")
 * @returns {Promise<{uploadUrl: string, filePath: string, method: string, message: string}>}
 */
export const getPresignedUploadUrl = async (extension) => {
  try {
    const response = await axiosClient.post(
      `${R2_API_URL}/presigned-upload-url`,
      null,
      {
        params: { extension }
      }
    );
    return response;
  } catch (error) {
    console.error("❌ Error getting presigned upload URL:", error);
    throw error;
  }
};

/**
 * 📤 Upload file trực tiếp lên R2 sử dụng presigned URL
 * @param {string} uploadUrl - URL presigned từ backend
 * @param {File} file - File cần upload
 * @param {Function} onProgress - Callback cho progress (optional)
 * @returns {Promise<void>}
 */
export const uploadFileToR2 = async (uploadUrl, file, onProgress) => {
  try {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  } catch (error) {
    console.error("❌ Error uploading file to R2:", error);
    throw error;
  }
};

/**
 * 📥 Lấy presigned download URL từ backend (có authentication)
 * @param {number} gameId - ID của game
 * @returns {Promise<{downloadUrl: string, fileName: string, expiresIn: number}>}
 */
export const getSecureDownloadUrl = async (gameId) => {
  try {
    const response = await axiosClient.get(
      `${R2_API_URL}/download-game/${gameId}`
    );
    return response;
  } catch (error) {
    console.error("❌ Error getting download URL:", error);
    throw error;
  }
};

/**
 * 📥 Tải game với URL presigned (trigger download)
 * @param {string} downloadUrl - URL download presigned
 * @param {string} fileName - Tên file để lưu
 */
export const downloadGameFile = (downloadUrl, fileName) => {
  try {
    // Tạo link tạm thời và trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName || "game-download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    throw error;
  }
};

/**
 * 🎯 Flow hoàn chỉnh: Upload file game lên R2
 * @param {File} file - File game cần upload
 * @param {Function} onProgress - Callback cho progress
 * @returns {Promise<string>} - Trả về filePath để lưu vào DB
 */
export const uploadGameFile = async (file, onProgress) => {
  try {
    // Bước 1: Lấy extension từ tên file
    const fileName = file.name;
    const extension = fileName.split(".").pop();

    if (!extension) {
      throw new Error("File không có extension hợp lệ");
    }

    // Bước 2: Lấy presigned upload URL
    const { uploadUrl, filePath } = await getPresignedUploadUrl(extension);

    // Bước 3: Upload file lên R2
    await uploadFileToR2(uploadUrl, file, onProgress);

    // Bước 4: Trả về filePath để lưu vào DB
    return filePath;
  } catch (error) {
    console.error("❌ Error in uploadGameFile flow:", error);
    throw error;
  }
};

export const r2Service = {
  getPresignedUploadUrl,
  uploadFileToR2,
  getSecureDownloadUrl,
  downloadGameFile,
  uploadGameFile,
};

export default r2Service;
