//useUserOrders.js
// src/api/useUserOrders.js
import { useEffect, useState } from "react";
// cùng thư mục => dùng ./order.js
import { fetchOrdersByUserId } from "./order.js";
// orderMapper cũng cùng thư mục
import { mapOrderDtoToUi } from "./orderMapper.js";

export function useUserOrders({ userId, page = 0, size = 20, enabled = true }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page, size, totalElements: 0, totalPages: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    if (!userId) return;

    let mounted = true;
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchOrdersByUserId(userId, page, size, token);
        if (!mounted) return;

        const uiOrders = (resp.content || []).map(mapOrderDtoToUi);
        setOrders(uiOrders);
        setMeta({ page: page, size: size, totalElements: resp.totalElements || uiOrders.length, totalPages: resp.totalPages || 1 });
      } catch (err) {
        console.error("Lỗi lấy orders:", err);
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [userId, page, size, enabled]);

  return { orders, loading, meta, error };
}
