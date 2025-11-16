import {API_BASE_URL} from "../config/api.js"

const API_URL = `${API_BASE_URL}/purchases`;

export async function getPurchases() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
    }
}