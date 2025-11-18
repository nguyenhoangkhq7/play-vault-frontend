// store/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/authApi";
import { toast } from "sonner";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [queue, setQueue] = useState([]);

  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem("access_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const refreshToken = async () => {
    if (refreshingToken) {
      return new Promise((resolve, reject) => {
        setQueue((prev) => [...prev, { resolve, reject }]);
      });
    }
    setRefreshingToken(true);
    try {
      const res = await api.post("/api/auth/refresh", {}, { withCredentials: true });
      const newToken = res.data.access_token;
      setAccessToken(newToken);
      queue.forEach(q => q.resolve(newToken));
      setQueue([]);
      return newToken;
    } catch (err) {
      console.error("Refresh token thất bại", err);
      logout();
      queue.forEach(q => q.reject(err));
      setQueue([]);
      throw err;
    } finally {
      setRefreshingToken(false);
    }
  };

  const callApi = async (apiFunc) => {
    try {
      return await apiFunc();
    } catch (err) {
      if (err.response?.status === 401) {
        // eslint-disable-next-line no-useless-catch
        try {
          await refreshToken();
          return await apiFunc();
        } catch (refreshErr) {
          throw refreshErr;
        }
      }
      throw err;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setAccessToken(token);
        const userRes = await callApi(() => api.get("/api/auth/me"));
        setUser(userRes.data);
        setBalance(userRes.data.balance || 0);
        const cartRes = await callApi(() => api.get("/api/cart"));
        setCart(cartRes.data);
      } catch (err) {
        console.error("Không thể load dữ liệu ban đầu", err);
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (token, userData) => {
    setAccessToken(token);
    setUser(userData);
    setBalance(userData.balance || 0);
    try {
      const cartRes = await callApi(() => api.get("/api/cart"));
      setCart(cartRes.data);
      toast.success("Đăng nhập thành công!");
    } catch (err) {
      console.error("Không thể tải giỏ hàng sau login", err);
      setCart({ items: [] });
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setCart(null);
    setBalance(0);
    toast.success("Đã đăng xuất");
  };

  const updateBalance = (newBalance) => {
    setBalance(newBalance);
    if (user) setUser(prev => ({ ...prev, balance: newBalance }));
  };

  const refreshCart = async () => {
    if (!user) return;
    try {
      const res = await callApi(() => api.get("/api/cart"));
      setCart(res.data);
    } catch (err) {
      console.error("Không thể cập nhật giỏ hàng", err);
      toast.error("Không thể cập nhật giỏ hàng.");
    }
  };

  const addToCart = async (gameId) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để mua game.");
      return null;
    }
    try {
      const res = await callApi(() => api.post(`/api/cart/items/${gameId}`));
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

  const removeFromCart = async (cartItemId) => {
    if (!user) return;
    try {
      const res = await callApi(() => api.delete(`/api/cart/items/${cartItemId}`));
      setCart(res.data);
      toast.success("Đã xóa game khỏi giỏ hàng.");
    } catch (err) {
      console.error("Lỗi xóa giỏ hàng", err);
      toast.error("Không thể xóa game khỏi giỏ hàng.");
    }
  };

  return (
    <CartContext.Provider value={{
      user,
      setUser,
      cart,
      setCart,
      balance,
      setBalance: updateBalance,
      loading,
      login,
      logout,
      refreshCart,
      addToCart,
      removeFromCart,
      setAccessToken
    }}>
      {children}
    </CartContext.Provider>
  );
};

// --- Export tách riêng, không dùng default ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
