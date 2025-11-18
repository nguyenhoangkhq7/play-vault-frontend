// src/utils/orderMapper.js

/**
 * Map một Order DTO từ backend -> object UI format mong muốn
 * Backend DTO mẫu:
 * {
 *   id, createdAt, total, status, orderItems: [{ id, gameTitle, gameThumbnail, price, gameId }, ...]
 * }
 */
export function mapOrderDtoToUi(orderDto) {
  const id = orderDto.id;
  const createdAt = orderDto.createdAt || orderDto.created_at || null;
  const date = createdAt ? formatDate(createdAt) : "";
  const status = humanizeStatus(orderDto.status);
  const totalPrice = orderDto.total ?? computeTotalFromItems(orderDto.orderItems);

  // take first item as representative for list view (can be adjusted)
  const firstItem = Array.isArray(orderDto.orderItems) && orderDto.orderItems.length > 0 ? orderDto.orderItems[0] : null;

  const name = firstItem?.gameTitle || firstItem?.game_name || `Order ${id}`;
  const image = firstItem?.gameThumbnail || firstItem?.thumbnail || "https://placehold.co/100x100/333333/ffffff?text=No+Image";
  const publisher = firstItem?.publisher || orderDto.publisher || ""; // if backend includes publisher
  const tags = firstItem?.tags || [];
  const age_limit = firstItem?.requiredAge || firstItem?.age_limit || "";

  return {
    id: id,
    name,
    publisher,
    date,
    status,
    price: Number(totalPrice || 0),
    image,
    tags,
    age_limit
  };
}

function computeTotalFromItems(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((s, it) => s + (Number(it.total ?? it.price ?? 0)), 0);
}

function formatDate(isoOrDateString) {
  try {
    const d = new Date(isoOrDateString);
    if (isNaN(d.getTime())) return String(isoOrDateString);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return String(isoOrDateString);
  }
}

function humanizeStatus(raw) {
  if (!raw) return "Không rõ";
  const s = String(raw).toUpperCase();
  if (s.includes("COMPLETED") || s.includes("DONE")) return "Hoàn thành";
  if (s.includes("PENDING")) return "Đang chờ";
  if (s.includes("PROCESSING")) return "Đang xử lý";
  if (s.includes("CANCEL")) return "Bị hủy";
  if (s.includes("PAID")) return "Đã thanh toán";
  return raw;
}
