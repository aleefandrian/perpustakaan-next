"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Tag,
  BookOpen,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  X,
  Loader2,
  Clock,
  BookmarkCheck,
  AlertCircle,
} from "lucide-react";
import BookCover from "@/features/books/components/BookCover";
import Pagination from "@/components/shared/Pagination";
import BookDetailModal from "@/features/borrowings/components/BookDetailModal";
import BorrowConfirmationDialog from "@/features/borrowings/components/BorrowConfirmationDialog";
import { borrowingService } from "@/features/borrowings/services/borrowingService";

export default function SiswaBooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student borrowing status tracking (for button states)
  const [pendingBookIds, setPendingBookIds] = useState([]);
  const [activeBookIds, setActiveBookIds] = useState([]);

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(16);
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("title-asc");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 16,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [confirmBook, setConfirmBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification
  const [notification, setNotification] = useState(null);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Load student book borrowing eligibility status
  useEffect(() => {
    let ignore = false;
    borrowingService
      .getStudentBookEligibility()
      .then((res) => {
        if (!ignore && res.success) {
          setPendingBookIds(res.pendingBookIds || []);
          setActiveBookIds(res.activeBookIds || []);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat status peminjaman siswa:", err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Load categories
  useEffect(() => {
    fetch("/api/categories?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [localSearch]);

  // Load books
  useEffect(() => {
    let isCancelled = false;

    const query = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      search,
      category,
      status,
      sort,
    });

    fetch(`/api/books?${query.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (!isCancelled && res.success) {
          setBooks(res.data);
          setPagination(res.pagination);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [page, pageSize, search, category, status, sort]);

  // Handle Borrow Submission
  const handleBorrowSubmit = async (bookId) => {
    setIsSubmitting(true);
    try {
      const res = await borrowingService.submitBorrowRequest(bookId);
      if (res.success) {
        showToast("success", res.message || "Pengajuan peminjaman berhasil diajukan!");
        setConfirmBook(null);
        setSelectedBook(null);
        setPendingBookIds((prev) => [...prev, bookId]);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md animate-in slide-in-from-top-2 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="pb-3 border-b border-[#E5E7EB]">
        <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
          Katalog Buku Perpustakaan
        </h1>
        <p className="text-[13px] text-[#858095] mt-1">
          Cari dan temukan ribuan koleksi buku bacaan. Klik buku untuk melihat detail dan mengajukan peminjaman.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#858095] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari judul, penulis, ISBN..."
              className="w-full h-10 pl-9.5 pr-8 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter kategori buku"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter ketersediaan stok"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="all">Semua Stok</option>
              <option value="available">Tersedia</option>
              <option value="out_of_stock">Stok Habis</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              aria-label="Urutkan katalog buku"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="title-asc">Judul: A - Z</option>
              <option value="title-desc">Judul: Z - A</option>
              <option value="year-desc">Tahun Terbit: Terbaru</option>
              <option value="year-asc">Tahun Terbit: Terlama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-[#858095]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6D28D9]" />
          <span className="text-sm font-medium">Memuat buku...</span>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((b) => {
            const isAvailable = b.availableStock > 0;
            const isPending = pendingBookIds.includes(b.id);
            const isActiveBorrowed = activeBookIds.includes(b.id);

            return (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedBook(b)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedBook(b);
                  }
                }}
                className="bg-white rounded-xl border border-[#E5E7EB] hover:border-purple-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between p-4 cursor-pointer text-left group"
              >
                <div>
                  <div className="w-full h-52 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-[1.01] transition-transform">
                    <BookCover
                      src={b.coverUrl}
                      alt={b.title}
                      size="lg"
                      className="h-full w-auto object-cover"
                    />
                  </div>

                  <span className="inline-block text-[10px] font-semibold text-[#6D28D9] bg-[#F5F0FF] px-2 py-0.5 rounded mb-1.5">
                    {b.category?.name || "Kategori Umum"}
                  </span>

                  <h3 className="font-bold text-sm text-[#27233A] line-clamp-2 leading-snug group-hover:text-[#6D28D9] transition-colors">
                    {b.title}
                  </h3>

                  <p className="text-xs text-[#858095] mt-1 line-clamp-1">
                    {b.author} • {b.publishedYear}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  {/* Status Indicator */}
                  {isActiveBorrowed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <BookmarkCheck className="w-3 h-3" />
                      <span>Sedang Dipinjam</span>
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>Menunggu Persetujuan</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersedia ({b.availableStock})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Stok Habis</span>
                        </>
                      )}
                    </span>
                  )}

                  <span className="text-[11px] text-[#858095] font-mono">
                    Rak {b.location || "A-1"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E7EB]">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-semibold text-[#27233A]">
            Buku Tidak Ditemukan
          </h3>
          <p className="text-xs text-[#858095] mt-1 max-w-sm mx-auto">
            Tidak ada buku yang sesuai dengan kata kunci pencarian Anda. Silakan coba kata kunci lain.
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        isOpen={Boolean(selectedBook)}
        book={selectedBook}
        isPending={selectedBook ? pendingBookIds.includes(selectedBook.id) : false}
        isActiveBorrowed={
          selectedBook ? activeBookIds.includes(selectedBook.id) : false
        }
        onClose={() => setSelectedBook(null)}
        onBorrowClick={(b) => {
          setSelectedBook(null);
          setConfirmBook(b);
        }}
      />

      {/* Borrow Confirmation Dialog */}
      <BorrowConfirmationDialog
        isOpen={Boolean(confirmBook)}
        book={confirmBook}
        onClose={() => setConfirmBook(null)}
        onConfirm={handleBorrowSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
