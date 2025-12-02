import { CLOUD_NAME, UPLOAD_PRESET } from "../config/cloudinary";

export async function uploadImageToCloudinary(file) {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  let resp;
  try {
    resp = await fetch(url, { method: "POST", body: formData });
  } catch (networkErr) {
    console.error("[Cloudinary] network error:", networkErr);
    throw new Error("Network error khi kết nối Cloudinary. Kiểm tra Internet hoặc CORS.");
  }

  const text = await resp.text().catch(() => null);
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }

  if (!resp.ok) {
    console.error("[Cloudinary] upload failed", { status: resp.status, statusText: resp.statusText, text, json });
    // trả lỗi có thông tin chi tiết để frontend show console
    const detail = (json && (json.error?.message || JSON.stringify(json))) || text || resp.statusText;
    const err = new Error(`Upload thất bại: ${resp.status} ${detail}`);
    err.status = resp.status;
    err.body = json || text;
    throw err;
  }

  // success
  return json;
}
