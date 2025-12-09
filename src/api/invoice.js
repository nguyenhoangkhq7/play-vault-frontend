import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/api`;

function getAuthHeader() {
  const t =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    "";
  return t ? { Authorization: `Bearer ${t.replace(/^"|"$/g, "")}` } : {};
}

function normalize(data, page, size) {
  if (!data) return { content: [], totalElements: 0, totalPages: 0, page, size };
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, page, size };
  }
  return {
    content: data.content ?? data.items ?? [],
    totalElements:
      data.totalElements ?? data.total ?? (data.content?.length ?? data.items?.length ?? 0),
    totalPages: data.totalPages ?? 1,
    page,
    size,
  };
}

export async function fetchAdminInvoices(page = 0, size = 10, keyword = "", status = "ALL") {
  // Tạo query string an toàn
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  
  if (keyword && keyword.trim() !== "") {
    params.set("keyword", keyword.trim());
  }

  // 2. FIX: Thêm logic xử lý status
  // Chỉ gửi lên server nếu status khác "ALL" và có giá trị
  if (status && status !== "ALL") {
    params.set("status", status);
  }

  const url = `${BASE}/admin/invoices?${params.toString()}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeader(), // Tự động thêm Token
    },
  });

  // Xử lý 204 No Content
  if (resp.status === 204) {
    return { content: [], totalElements: 0, totalPages: 0, page, size };
  }

  const text = await resp.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  // Xử lý lỗi
  if (!resp.ok) {
    const msg = (data && (data.message || data.error)) || text || `${resp.status} ${resp.statusText}`;
    const err = new Error(`Fetch admin invoices failed: ${msg}`);
    err.status = resp.status;
    err.body = data ?? text;
    throw err;
  }

  // Chuẩn hóa dữ liệu trả về
  return normalize(data, page, size);
}