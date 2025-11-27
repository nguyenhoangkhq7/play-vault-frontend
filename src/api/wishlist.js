import {API_BASE_URL} from "../config/api.js"


export async function getWishlist() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const url = API_BASE_URL+"/api/wishlist";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}



// Thêm game vào wishlist (POST /api/wishlist/{gameId})
export async function createWishlist(gameId) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const url = `${API_BASE_URL}/api/wishlist/${gameId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Body rỗng vì backend không nhận data từ request body
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return { message: "Game added to wishlist successfully" };
}

// Xóa game khỏi wishlist (DELETE /api/wishlist/{gameId})
export async function updateWishlist(gameId) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const url = `${API_BASE_URL}/api/wishlist/${gameId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Body rỗng
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return { message: "Game removed from wishlist successfully" };
}