import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/wishlist`

// Lấy danh sách wishlist
export async function getWishlist() {
    try {
        const response = await fetch(API_URL)
        if (!response.ok) {
            throw new Error(`Failed to fetch wishlist: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error("Error fetching wishlist:", error)
        throw new Error(`Failed to fetch wishlist: ${error.message}`)
    }
}

// Cập nhật wishlist
export async function updateWishlist(wishlistId, updatedWishlist) {
    try {
        const response = await fetch(`${API_URL}/${wishlistId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedWishlist),
        })
        if (!response.ok) {
            throw new Error(`Failed to update wishlist: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error("Error updating wishlist:", error)
        throw new Error(`Failed to update wishlist: ${error.message}`)
    }
}

// Tạo wishlist mới
export async function createWishlist(newWishlist) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newWishlist),
        })
        if (!response.ok) {
            throw new Error(`Failed to create wishlist: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error("Error creating wishlist:", error)
        throw new Error(`Failed to create wishlist: ${error.message}`)
    }
}