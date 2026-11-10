/**
 * Category Service Client
 */

export async function fetchCategoriesList({
  page = 1,
  limit = 20,
  search = "",
  sort = "name-asc",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);

  const res = await fetch(`/api/categories?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal memuat kategori");
  }
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || "Gagal membuat kategori");
  }
  return resData;
}

export async function updateCategory(id, data) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || "Gagal memperbarui kategori");
  }
  return resData;
}

export async function deleteCategory(id) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || "Gagal menghapus kategori");
  }
  return resData;
}
