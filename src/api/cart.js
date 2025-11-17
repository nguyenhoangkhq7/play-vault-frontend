
import { api } from "./authApi.js"; // Assuming this is the path to your authApi.js
import { useUser } from "../store/UserContext.jsx"; // Adjust path if needed

const API_URL = "/api/cart";

// ✅ Get cart items (returns array of cart items with gameId and cartItemId)
export async function getCart() {
  const { setAccessToken } = useUser();
  try {
    const response = await api.get(API_URL, setAccessToken);
    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.length > 0) {
      // Assuming CartResponse has cart_items array with {cartItemId, gameId, ...}
      return data[0].cart_items || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw new Error('Không thể tải giỏ hàng.');
  }
}

// ✅ Add item to cart by gameId
export async function addToCart(gameId) {
  const { setAccessToken } = useUser();
  try {
    const response = await api.post(`/api/cart/items/${gameId}`, null, setAccessToken);
    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`);
    }
    const data = await response.json();
    return data[0]?.cart_items || []; // Return updated cart_items
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Không thể thêm vào giỏ hàng.');
  }
}

// ✅ Remove item from cart by cartItemId
export async function removeFromCart(cartItemId) {
  const { setAccessToken } = useUser();
  try {
    const response = await api.delete(`/api/cart/items/${cartItemId}`, setAccessToken);
    if (!response.ok) {
      throw new Error(`Failed to remove from cart: ${response.statusText}`);
    }
    const data = await response.json();
    return data[0]?.cart_items || []; // Return updated cart_items
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Không thể xóa khỏi giỏ hàng.');
  }
}

// ✅ Clear entire cart
export async function clearCart() {
  const { setAccessToken } = useUser();
  try {
    const response = await api.delete(`${API_URL}/clear`, setAccessToken);
    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`);
    }
    const data = await response.json();
    return data[0]?.cart_items || []; // Return updated cart_items (should be empty)
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Không thể xóa toàn bộ giỏ hàng.');
  }
}