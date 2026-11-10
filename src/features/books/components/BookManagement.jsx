"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, AlertCircle, X } from "lucide-react";
import BookStats from "./BookStats";
import BookFilters from "./BookFilters";
import BookTable from "./BookTable";
import DeleteBookDialog from "./DeleteBookDialog";
import Pagination from "@/components/shared/Pagination";
import { useBooks } from "../hooks/useBooks";

export default function BookManagement() {
  const {
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
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handleSortChange,
    handleResetFilters,
    handlePageChange,
    handleDeleteBook,
  } = useBooks();

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteDialog = (book) => {
    setDeleteTarget(book);
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
    }
  };

  const confirmDelete = async (bookId) => {
    setIsDeleting(true);
    try {
      await handleDeleteBook(bookId);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-[13px] font-medium leading-snug">
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:opacity-75 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
            Daftar Buku
          </h1>
          <p className="text-[13px] text-[#858095] mt-1">
            Kelola koleksi buku, informasi bibliografi, dan ketersediaan stok perpustakaan.
          </p>
        </div>

        {/* Action Button: + Tambah Buku */}
        <Link
          href="/books/create"
          className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold rounded-[9px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-xs hover:shadow-sm hover:scale-[1.01] transition-all duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Tambah Buku</span>
        </Link>
      </div>

      {/* 2. Statistics Cards */}
      <BookStats stats={stats} loading={loading && !stats} />

      {/* 3. Search and Filters Toolbar */}
      <BookFilters
        search={search}
        category={category}
        status={status}
        sort={sort}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        totalResults={pagination.total}
      />

      {/* Error state if API fails */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Terjadi kendala saat memuat data: {error}</span>
        </div>
      )}

      {/* 4. Book Data Table */}
      <BookTable
        books={books}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onDelete={openDeleteDialog}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBookDialog
        isOpen={Boolean(deleteTarget)}
        book={deleteTarget}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
