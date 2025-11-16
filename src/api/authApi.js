// src/api/authApi.js
import axios from "axios";
import { API_BASE_URL, REFRESH_TOKEN_URL } from "../config/api";

const callWithRefresh = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const refreshRes = await axios.post(
          REFRESH_TOKEN_URL,
          {},
          { withCredentials: true } // BẮT BUỘC
        );
        const { token } = refreshRes.data;
        localStorage.setItem("accessToken", token);
        return await requestFn();
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        throw refreshError;
      }
    }
    throw error;
  }
};

export const login = async (username, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/login`,
    { username, password },
    { withCredentials: true } // BẮT BUỘC
  );

  const accessToken = response.data?.token;
  if (!accessToken) throw new Error("Không nhận được token");

  localStorage.setItem("accessToken", accessToken);
  return { accessToken };
};

export const api = {
  get: (url) =>
    callWithRefresh(() =>
      axios.get(`${API_BASE_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true, // BẮT BUỘC
      })
    ),
  post: (url, data) =>
    callWithRefresh(() =>
      axios.post(`${API_BASE_URL}${url}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true,
      })
    ),
  // ... put, delete tương tự
};
