// store/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/authApi";
import { toast } from "sonner";
import { useUser } from "./UserContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const { accessToken, user } = useUser();

  const refreshCart = async (token) => {
    // Only customers have carts
    if (!token || user?.role !== "CUSTOMER") return;
    try {
      const res = await api.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Khong the cap nhat gio hang", err);
      toast.error("Khong the cap nhat gio hang.");
    }
  };

  // Auto fetch cart when a customer logs in
  useEffect(() => {
    if (accessToken && user?.role === "CUSTOMER") {
      refreshCart(accessToken);
    }
  }, [accessToken, user?.role]);

  const addToCart = async (gameId, userInfo, token) => {
    if (!userInfo) {
      toast.warning("Vui long dang nhap de mua game.");
      return null;
    }
    try {
      const res = await api.post(
        `/api/cart/items/${gameId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart(res.data);
      toast.success("Da them vao gio hang!");
      return res.data;
    } catch (err) {
      console.error("Loi them vao gio hang", err);
      if (err.response?.status === 409) {
        toast.info("Game da co trong gio hang");
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
      toast.success("Da xoa game khoi gio hang.");
    } catch (err) {
      console.error("Loi xoa gio hang", err);
      toast.error("Khong the xoa game khoi gio hang.");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, removeFromCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
