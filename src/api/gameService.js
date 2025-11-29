// src/api/gameService.js
import axiosClient from "./axiosClient"; // interceptor đã gắn Authorization

export const gameService = {
  create: (payload) => axiosClient.post("/games", payload),
  // PUT /api/games/{id}?status=APPROVED (body null)
  updateStatus: (id, status) =>
    axiosClient.put(`/games/${id}`, null, { params: { status } }),

  // GET /api/games?status=PENDING
  listByStatus: (status) =>
    axiosClient.get("/games", { params: { status } }),
};
