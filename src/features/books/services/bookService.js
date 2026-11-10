/**
 * Book Service Client
 */

export async function fetchBooks({
  page = 1,
  limit = 20,
  search = "",
  category = "all",
  genre = "all",
  status = "all",
  year = "all",
  sort = "id-asc",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (category && category !== "all") params.set("category", category);
  if (genre && genre !== "all") params.set("genre", genre);
  if (status && status !== "all") params.set("status", status);
  if (year && year !== "all") params.set("year", year);
  if (sort) params.set("sort", sort);

  const res = await fetch(`/api/books?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal memuat data buku");
  }
  return res.json();
}

export async function fetchBookById(id) {
  const res = await fetch(`/api/books/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal mengambil detail buku");
  }
  return res.json();
}

export async function createBook(bookData) {
  const res = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal menyimpan buku baru");
  }
  return data;
}

export async function updateBook(id, bookData) {
  const res = await fetch(`/api/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal memperbarui data buku");
  }
  return data;
}

export async function deleteBook(id) {
  const res = await fetch(`/api/books/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal menghapus buku");
  }
  return data;
}

export async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) {
    throw new Error("Gagal mengambil data kategori");
  }
  return res.json();
}
