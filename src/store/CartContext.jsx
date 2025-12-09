// store/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/authApi";
import { toast } from "sonner";
import { useUser } from "./UserContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const { accessToken } = useUser();

  const refreshCart = async (token) => {
    if (!token) return;
    try {
      const res = await api.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Không thể cập nhật giỏ hàng", err);
      toast.error("Không thể cập nhật giỏ hàng.");
    }
  };

  // 🔥 Tự động fetch cart khi user login
  useEffect(() => {
    if (accessToken) {
      refreshCart(accessToken);
    }
  }, [accessToken]);

  const addToCart = async (gameId, user, token) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để mua game.");
      return null;
    }
    try {
      const res = await api.post(`/api/cart/items/${gameId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
      toast.success("Đã thêm vào giỏ hàng!");
      return res.data;
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng", err);
      if (err.response?.status === 409) {
        toast.info("Game đã có trong giỏ hàng");
      } else {
        toast.error(err.response?.data?.message || err.message);
      }
      return null;
    }
  };

  const removeFromCart = async (cartItemId, token) => {
    if (!token) return;
    try {
      const res = await api.delete(`/api/cart/items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
      toast.success("Đã xóa game khỏi giỏ hàng.");
    } catch (err) {
      console.error("Lỗi xóa giỏ hàng", err);
      toast.error("Không thể xóa game khỏi giỏ hàng.");
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
