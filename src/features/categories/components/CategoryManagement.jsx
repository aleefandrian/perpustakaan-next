"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, ArrowUpDown, X, CheckCircle2, AlertCircle } from "lucide-react";
import CategoryStats from "./CategoryStats";
import CategoryTable from "./CategoryTable";
import CategoryModal from "./CategoryModal";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import Pagination from "@/components/shared/Pagination";
import {
  fetchCategoriesList,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [prevSearch, setPrevSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Sync search state during render (React 19 pattern)
  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // Debounced search trigger (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
        setPage(1);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [localSearch, search]);

  // Fetch categories
  useEffect(() => {
    let isCancelled = false;

    fetchCategoriesList({
      page,
      limit: pageSize,
      search,
      sort,
    })
      .then((res) => {
        if (!isCancelled) {
          if (res.success) {
            setCategories(res.data);
            setPagination(res.pagination);
            if (res.stats) {
              setStats(res.stats);
            }
          } else {
            setError(res.message || "Gagal memuat kategori");
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
  }, [page, pageSize, search, sort, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Modal actions
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, formData);
        showToast(res.message || "Kategori berhasil diperbarui.");
      } else {
        const res = await createCategory(formData);
        showToast(res.message || "Kategori baru berhasil ditambahkan.");
      }
      handleRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      const res = await deleteCategory(id);
      showToast(res.message || "Kategori berhasil dihapus.");
      setDeleteTarget(null);
      handleRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    setSearch("");
    setSort("name-asc");
    setPage(1);
    setLoading(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            Kategori Buku
          </h1>
          <p className="text-[13px] text-[#858095] mt-1">
            Kelola kategori koleksi buku perpustakaan.
          </p>
        </div>

        {/* Action Button: Tambah Kategori */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold rounded-[9px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-xs hover:shadow-sm hover:scale-[1.01] transition-all duration-150 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* 2. Statistics Cards */}
      <CategoryStats stats={stats} loading={loading && !stats} />

      {/* 3. Search and Sort Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari nama kategori..."
            className="w-full h-10 pl-10 pr-9 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] placeholder-[#858095] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#858095] hover:text-[#27233A]"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative w-full sm:w-56 shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Urutkan kategori"
            className="w-full h-10 pl-9 pr-8 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all cursor-pointer appearance-none"
          >
            <option value="name-asc">Nama: A - Z</option>
            <option value="name-desc">Nama: Z - A</option>
            <option value="date-desc">Dibuat: Terbaru</option>
            <option value="date-asc">Dibuat: Terlama</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Category Table */}
      <CategoryTable
        categories={categories}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onEdit={handleOpenEdit}
        onDelete={(cat) => setDeleteTarget(cat)}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={(newPage) => {
          setPage(newPage);
          setLoading(true);
        }}
      />

      {/* Add / Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        category={editingCategory}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        isOpen={Boolean(deleteTarget)}
        category={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
