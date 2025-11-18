import { API_BASE_URL } from "../config/api.js";
// THÊM: Import api wrapper (giả định nằm trong services/authApi)
import { api } from "../api/authApi"; 

/**
 * Lấy giỏ hàng của user (API cũ - KHÔNG DÙNG cho backend mới)
 */
export async function getCart(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart?user_id=${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.length > 0) {
            return data[0].cart_items || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw new Error('Không thể tải giỏ hàng.');
    }
}

/**
 * Thêm sản phẩm vào giỏ hàng (API cũ - KHÔNG DÙNG cho backend mới)
 */
export async function addToCart(userId, gameId) {
    try {
        const cartResponse = await fetch(`${API_BASE_URL}/cart?user_id=${userId}`);
        if (!cartResponse.ok) {
            throw new Error(`Failed to fetch cart: ${cartResponse.statusText}`);
        }
        const cartData = await cartResponse.json();
        let cart = cartData[0];

        if (!cart) {
            const newCart = {
                user_id: userId,
                cart_items: [{ id: gameId }],
            };
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCart),
            });
            if (!response.ok) {
                throw new Error(`Failed to create cart: ${response.statusText}`);
            }
            const newCartData = await response.json();
            return newCartData.cart_items;
        } else {
            if (!cart.cart_items.some(item => item.id === gameId)) {
                cart.cart_items.push({ id: gameId });
                const response = await fetch(`${API_BASE_URL}/cart/${cart.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cart),
                });
                if (!response.ok) {
                    throw new Error(`Failed to update cart: ${response.statusText}`);
                }
                const updatedCart = await response.json();
                return updatedCart.cart_items;
            }
            return cart.cart_items;
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw new Error('Không thể thêm game vào giỏ hàng.');
    }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng (API cũ - KHÔNG DÙNG cho backend mới)
 */
export async function removeFromCart(userId, gameId) {
    try {
        const cartResponse = await fetch(`${API_BASE_URL}/cart?user_id=${userId}`);
        if (!cartResponse.ok) {
            throw new Error(`Failed to fetch cart: ${cartResponse.statusText}`);
        }
        const cartData = await cartResponse.json();
        const cart = cartData[0];

        if (cart && cart.cart_items) {
            cart.cart_items = cart.cart_items.filter(item => item.id !== gameId);
            const response = await fetch(`${API_BASE_URL}/cart/${cart.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cart),
            });
            if (!response.ok) {
                throw new Error(`Failed to update cart: ${response.statusText}`);
            }
            const updatedCart = await response.json();
            return updatedCart.cart_items;
        }
        return [];
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw new Error('Không thể xóa game khỏi giỏ hàng.');
    }
}

/**
 * Thanh toán các mục đã chọn (API cũ - KHÔNG DÙNG cho backend mới)
 */
export async function checkoutCart(userId, selectedGameIds) {
    try {
        const boughtResponse = await fetch(`${API_BASE_URL}/bought?user_id=${userId}`);
        if (!boughtResponse.ok) {
            throw new Error(`Failed to fetch bought items: ${boughtResponse.statusText}`);
        }
        const boughtData = await boughtResponse.json();
        let bought = boughtData[0];

        if (!bought) {
            const newBought = {
                user_id: userId,
                bought_game_id: selectedGameIds,
            };
            const response = await fetch(`${API_BASE_URL}/bought`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBought),
            });
            if (!response.ok) {
                throw new Error(`Failed to create bought entry: ${response.statusText}`);
            }
        } else {
            const updatedGameIds = [...new Set([...bought.bought_game_id, ...selectedGameIds])];
            const response = await fetch(`${API_BASE_URL}/bought/${bought.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...bought,
                    bought_game_id: updatedGameIds,
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update bought entry: ${response.statusText}`);
            }
        }

        const cartResponse = await fetch(`${API_BASE_URL}/cart?user_id=${userId}`);
        if (!cartResponse.ok) {
            throw new Error(`Failed to fetch cart: ${cartResponse.statusText}`);
        }
        const cartData = await cartResponse.json();
        const cart = cartData[0];

        if (cart && cart.cart_items) {
            cart.cart_items = cart.cart_items.filter(item => !selectedGameIds.includes(item.id));
            const response = await fetch(`${API_BASE_URL}/cart/${cart.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cart),
            });
            if (!response.ok) {
                throw new Error(`Failed to update cart: ${response.statusText}`);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error during checkout:', error);
        throw new Error('Không thể thực hiện thanh toán.');
    }
}

/**
 * Thanh toán toàn bộ giỏ hàng (API cũ - KHÔNG DÙNG cho backend mới)
 */
export async function checkoutAllCart(userId) {
    try {
        const cartItems = await getCart(userId);
        const gameIds = cartItems.map(item => item.id);
        return await checkoutCart(userId, gameIds);
    } catch (error) {
        console.error('Error during checkout all:', error);
        throw new Error('Không thể thanh toán toàn bộ giỏ hàng.');
    }
}

// ==========================================================
// 🚀 HÀM CHECKOUT MỚI DÙNG CHO BACKEND SPRING BOOT (JWT)
// ==========================================================

/**
 * Thanh toán các mục đã chọn, gửi danh sách cartItemId.
 * Endpoint giả định: POST /api/orders/checkout/selected
 * @param {function} setAccessToken - Hàm để refresh token.
 * @param {Array<string>} cartItemIds - Danh sách Cart Item ID cần thanh toán.
 * @returns {Promise<any>} CartResponse mới.
 */
export async function checkoutSelectedItems(setAccessToken, cartItemIds) {
    try {
        console.log("📤 Gửi request checkout selected:", cartItemIds);
        const response = await api.post(
            "/api/orders/checkout/selected",
            { itemIds: cartItemIds },
            setAccessToken
        );
        console.log("✅ Checkout Selected thành công:", response.data);
        return response.data; // Mong đợi CartResponse mới
    } catch (error) {
        console.error('❌ ERROR trong checkoutSelectedItems:', error);
        throw new Error('Không thể thực hiện thanh toán các mục đã chọn.');
    }
}

/**
 * Thanh toán toàn bộ giỏ hàng.
 * Endpoint giả định: POST /api/orders/checkout/all
 * @param {function} setAccessToken - Hàm để refresh token.
 * @returns {Promise<any>} CartResponse mới.
 */
export async function checkoutAllItems(setAccessToken) {
    try {
        console.log("📤 Gửi request checkout all.");
        const response = await api.post(
            "/api/orders/checkout/all",
            {},
            setAccessToken
        );
        console.log("✅ Checkout All thành công:", response.data);
        return response.data; // Mong đợi CartResponse mới
    } catch (error) {
        console.error('❌ ERROR trong checkoutAllItems:', error);
        throw new Error('Không thể thanh toán toàn bộ giỏ hàng.');
    }
}