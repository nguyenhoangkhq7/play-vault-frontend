// src/api/gameService.js
import axiosClient from "./axiosClient"; // baseURL nên là http://.../api

export const gameService = {
  create: (payload) => axiosClient.post("/games", payload),

  // PUT cập nhật trạng thái — chỉnh path cho khớp backend của bạn
  // Ví dụ nếu backend là PUT /api/games/{id}/status (body {status})
  // thì dùng:
  updateStatus: (id, status) =>
    axiosClient.put(`/games/${id}`, null, { params: { status } }),

  // Nếu backend là PUT /api/games/{id}?status=APPROVED
  // thì dùng (giữ nguyên version cũ của bạn):
  // updateStatus: (id, status) => axiosClient.put(`/games/${id}`, null, { params: { status } }),

  // Lấy toàn bộ game (có kèm status trong DTO)
  listAll: () => axiosClient.get("/games"),

  // Lọc theo status
  listByStatus: (status) => axiosClient.get("/games", { params: { status } }),
};
