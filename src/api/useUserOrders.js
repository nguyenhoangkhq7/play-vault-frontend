// src/api/useUserOrders.js
import { useCallback, useEffect, useState } from "react";
import { fetchOrdersByUserId } from "./order.js";
import { mapOrderDtoToUi } from "./orderMapper.js";

export function useUserOrders({ userId, page = 0, size = 20, enabled = true }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page, size, totalElements: 0, totalPages: 0 });
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled || !userId) return;
    setLoading(true); setError(null);
    try {
      const resp = await fetchOrdersByUserId(userId, page, size);
      const ui = (resp.content || []).map(mapOrderDtoToUi);
      setOrders(ui);
      setMeta({ page, size, totalElements: resp.totalElements, totalPages: resp.totalPages });
    } catch (e) {
      console.error("Lỗi lấy orders:", e);
      setError(e);
      setOrders([]); setMeta({ page, size, totalElements: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [enabled, userId, page, size]);

  useEffect(() => { load(); }, [load]);

  return { orders, loading, meta, error, refetch: load };
}
