"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, ArrowUpDown, CheckCircle2, AlertCircle } from "lucide-react";
import CategoryStats from "./CategoryStats";
import CategoryTable from "./CategoryTable";
import CategoryModal from "./CategoryModal";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import Pagination from "@/components/shared/Pagination";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
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
    <PageContainer>
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <PageHeader
        title="Kategori Buku"
        description="Kelola kategori klasifikasi koleksi buku perpustakaan."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Tambah Kategori
          </Button>
        }
      />

      {/* 2. Statistics Cards */}
      <CategoryStats stats={stats} loading={loading && !stats} />

      {/* 3. Search and Sort Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1">
          <SearchInput
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari nama kategori..."
          />
        </div>

        {/* Sort */}
        <div className="w-full sm:w-56 shrink-0">
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Urutkan kategori"
          >
            <option value="name-asc">Nama: A - Z</option>
            <option value="name-desc">Nama: Z - A</option>
            <option value="date-desc">Dibuat: Terbaru</option>
            <option value="date-asc">Dibuat: Terlama</option>
          </Select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
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
    </PageContainer>
  );
}
