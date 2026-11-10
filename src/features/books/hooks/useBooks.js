"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchBooks, fetchCategories, deleteBook } from "../services/bookService";

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("id-asc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.success) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Fetch books whenever filters, page, or refreshTrigger changes
  useEffect(() => {
    let isCancelled = false;

    fetchBooks({
      page,
      limit: pageSize,
      search,
      category,
      status,
      sort,
    })
      .then((res) => {
        if (!isCancelled) {
          if (res.success) {
            setBooks(res.data);
            setPagination(res.pagination);
            if (res.stats) {
              setStats(res.stats);
            }
          } else {
            setError(res.message || "Gagal memuat buku");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, pageSize, search, category, status, sort, refreshTrigger]);

  // Handlers that reset page to 1
  const handleSearchChange = useCallback((newSearch) => {
    setLoading(true);
    setSearch(newSearch);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((newCategory) => {
    setLoading(true);
    setCategory(newCategory);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((newStatus) => {
    setLoading(true);
    setStatus(newStatus);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setLoading(true);
    setSort(newSort);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setLoading(true);
    setSearch("");
    setCategory("all");
    setStatus("all");
    setSort("id-asc");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setLoading(true);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const refetchBooks = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleDeleteBook = useCallback(
    async (bookId) => {
      const res = await deleteBook(bookId);
      if (res.success) {
        showToast(res.message || "Buku berhasil dihapus.", "success");
        refetchBooks();
      } else {
        throw new Error(res.message || "Gagal menghapus buku");
      }
    },
    [refetchBooks, showToast]
  );

  return {
    books,
    categories,
    stats,
    loading,
    error,
    pagination,
    page,
    pageSize,
    search,
    category,
    status,
    sort,
    toast,
    setToast,
    showToast,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handleSortChange,
    handleResetFilters,
    handlePageChange,
    handleDeleteBook,
    refetchBooks,
  };
}
