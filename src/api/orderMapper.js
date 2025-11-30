/**
 * Map Order DTO -> UI object
 */
export function mapOrderDtoToUi(dto = {}) {
  const id = dto.id ?? "";
  const createdAt =
    dto.createdAt ?? dto.created_at ?? dto.createdDate ?? dto.created_date ?? null;

  const date = createdAt ? formatDateSafe(createdAt) : "";
  const status = humanizeStatus(dto.status);

  const items = Array.isArray(dto.orderItems) ? dto.orderItems : [];
  const first = items[0] ?? {};

  const name =
    first.gameTitle ?? first.game_name ?? (id ? `Order ${id}` : "Đơn hàng");

  const image =
    first.gameThumbnail ??
    first.thumbnail ??
    "https://placehold.co/100x100/333/fff?text=No+Image";

  // Nếu backend không trả total thì cộng từ items
  const totalPrice =
    toNumber(dto.total) !== 0 && dto.total != null
      ? toNumber(dto.total)
      : computeTotalFromItems(items);

  return {
    id,
    name,
    publisher: first.publisher ?? dto.publisher ?? "",
    date,
    status,
    price: totalPrice,
    image,
    tags: first.tags ?? [],
    age_limit: first.requiredAge ?? first.age_limit ?? "",
    itemCount: items.length,
  };
}

function computeTotalFromItems(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce(
    (sum, it) => sum + toNumber(it.total ?? it.price ?? 0),
    0
  );
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatDateSafe(v) {
  // hỗ trợ cả ISO string lẫn epoch millis
  const d = typeof v === "number" ? new Date(v) : new Date(String(v));
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString("vi-VN") : String(v);
}

function humanizeStatus(raw) {
  if (!raw) return "Không rõ";
  const s = String(raw).toUpperCase();
  if (s.includes("COMPLETED") || s.includes("DONE")) return "Hoàn thành";
  if (s.includes("PAID")) return "Đã thanh toán";
  if (s.includes("PROCESSING")) return "Đang xử lý";
  if (s.includes("PENDING")) return "Đang chờ";
  if (s.includes("CANCEL")) return "Bị hủy";
  return String(raw);
}
