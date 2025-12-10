import { api } from "./authApi";

function normalize(data, page, size) {
  if (!data)
    return { content: [], totalElements: 0, totalPages: 0, page, size };
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      page,
      size,
    };
  }
  return {
    content: data.content ?? data.items ?? [],
    totalElements:
      data.totalElements ??
      data.total ??
      data.content?.length ??
      data.items?.length ??
      0,
    totalPages: data.totalPages ?? 1,
    page,
    size,
  };
}

// Lấy danh sách hóa đơn admin, dùng wrapper api (có refresh token)
export async function fetchAdminInvoices(
  page = 0,
  size = 10,
  keyword = "",
  status = "ALL"
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  if (keyword && keyword.trim() !== "") {
    params.set("keyword", keyword.trim());
  }
  if (status && status !== "ALL") {
    params.set("status", status);
  }

  const url = `/api/admin/invoices?${params.toString()}`;
  const resp = await api.get(url);

  if (resp.status === 204) {
    return { content: [], totalElements: 0, totalPages: 0, page, size };
  }

  const data = resp?.data;
  if (!resp.status || resp.status >= 400) {
    const msg =
      (data && (data.message || data.error)) ||
      `${resp.status} ${resp.statusText}`;
    const err = new Error(`Fetch admin invoices failed: ${msg}`);
    err.status = resp.status;
    err.body = data;
    throw err;
  }

  return normalize(data, page, size);
}
