/**
 * Client-side service API wrapper for Book Borrowing Management
 */

export const borrowingService = {
  // --- Student Services ---
  async getStudentRequests(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const res = await fetch(`/api/siswa/borrowings/requests?${query.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal memuat pengajuan peminjaman.");
    }
    return data;
  },

  async submitBorrowRequest(bookId) {
    const res = await fetch("/api/siswa/borrowings/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal mengajukan peminjaman buku.");
    }
    return data;
  },

  async cancelBorrowRequest(requestId) {
    const res = await fetch(`/api/siswa/borrowings/requests/${requestId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal membatalkan pengajuan peminjaman.");
    }
    return data;
  },

  async getStudentBorrowings(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.filter && params.filter !== "all") query.set("filter", params.filter);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const res = await fetch(`/api/siswa/borrowings?${query.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal memuat daftar peminjaman aktif.");
    }
    return data;
  },

  async getStudentBookEligibility() {
    const res = await fetch("/api/siswa/borrowings/my-status");
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal memuat status buku.");
    }
    return data;
  },

  // --- Admin Services ---
  async getAdminRequests(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const res = await fetch(`/api/admin/borrowings/requests?${query.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal memuat daftar permohonan peminjaman.");
    }
    return data;
  },

  async approveRequest(requestId) {
    const res = await fetch(`/api/admin/borrowings/requests/${requestId}/approve`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal menyetujui permohonan peminjaman.");
    }
    return data;
  },

  async rejectRequest(requestId, reason) {
    const res = await fetch(`/api/admin/borrowings/requests/${requestId}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal menolak permohonan peminjaman.");
    }
    return data;
  },

  async getAdminBorrowings(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.filter && params.filter !== "all") query.set("filter", params.filter);
    if (params.sort) query.set("sort", params.sort);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const res = await fetch(`/api/admin/borrowings?${query.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Gagal memuat data peminjaman perpustakaan.");
    }
    return data;
  },
};
