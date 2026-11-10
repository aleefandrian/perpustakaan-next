/**
 * User Service Client
 */

export async function fetchUsersList({
  page = 1,
  limit = 20,
  search = "",
  role = "",
  status = "",
  className = "",
  sort = "name-asc",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (role && role !== "all") params.set("role", role);
  if (status && status !== "all") params.set("status", status);
  if (className && className !== "all") params.set("class", className);
  if (sort) params.set("sort", sort);

  const res = await fetch(`/api/users?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal memuat data pengguna");
  }
  return res.json();
}

export async function createUser(data) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || "Gagal membuat pengguna");
  }
  return resData;
}

export async function updateUser(id, data) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || "Gagal memperbarui pengguna");
  }
  return resData;
}

export async function deleteUser(id) {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || "Gagal menghapus pengguna");
  }
  return resData;
}
