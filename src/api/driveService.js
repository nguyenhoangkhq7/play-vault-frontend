import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// tạo link xem trực tiếp cho file public trên Drive
const driveDirectLink = (id) => `https://drive.google.com/uc?id=${id}`;

export const driveService = {
  /**
   * Upload 1 file lên Drive (public = true để xem công khai)
   * return: { id, name, viewLink, downloadLink, directLink }
   */
  uploadFile: async (file, isPublic = true, onUploadProgress) => {
    const form = new FormData();
    form.append("file", file);

    const res = await api.post(`/api/drive/upload?public=${isPublic}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });

    const { id, name, viewLink, downloadLink } = res.data || {};
    return {
      id, name, viewLink, downloadLink,
      directLink: id ? driveDirectLink(id) : undefined,
    };
  },

  deleteFile: async (id) => {
    await api.delete(`/api/drive/delete/${id}`);
  },

  test: async () => api.get("/api/drive/test").then(r => r.data),
};
