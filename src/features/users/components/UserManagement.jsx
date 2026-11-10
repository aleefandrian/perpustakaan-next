"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, ArrowUpDown, X, CheckCircle2, AlertCircle, Filter, RotateCcw } from "lucide-react";
import UserStats from "./UserStats";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import DeleteUserDialog from "./DeleteUserDialog";
import Pagination from "@/components/shared/Pagination";
import {
  fetchUsersList,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [prevSearch, setPrevSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [classNameFilter, setClassNameFilter] = useState("");
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
  const [editingUser, setEditingUser] = useState(null);
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

  // Fetch users
  useEffect(() => {
    let isCancelled = false;

    fetchUsersList({
      page,
      limit: pageSize,
      search,
      role,
      status,
      className: classNameFilter,
      sort,
    })
      .then((res) => {
        if (!isCancelled) {
          if (res.success) {
            setUsers(res.data);
            setPagination(res.pagination);
            if (res.stats) {
              setStats(res.stats);
            }
          } else {
            setError(res.message || "Gagal memuat pengguna");
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
  }, [page, pageSize, search, role, status, classNameFilter, sort, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Modal actions
  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const res = await updateUser(editingUser.id, formData);
        showToast(res.message || "Data pengguna berhasil diperbarui.");
      } else {
        const res = await createUser(formData);
        showToast(res.message || "Pengguna baru berhasil ditambahkan.");
      }
      handleRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    try {
      const res = await deleteUser(id);
      showToast(res.message || "Pengguna berhasil dihapus.");
      setDeleteTarget(null);
      handleRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    setSearch("");
    setRole("");
    setStatus("");
    setClassNameFilter("");
    setSort("name-asc");
    setPage(1);
    setLoading(true);
  };

  const hasActiveFilters = Boolean(search || role || status || classNameFilter || sort !== "name-asc");

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
            Data User
          </h1>
          <p className="text-[13px] text-[#858095] mt-1">
            Kelola akun administrator dan siswa perpustakaan.
          </p>
        </div>

        {/* Action Button: Tambah User */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold rounded-[9px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-xs hover:shadow-sm hover:scale-[1.01] transition-all duration-150 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Tambah User</span>
        </button>
      </div>

      {/* 2. Statistics Cards */}
      <UserStats stats={stats} loading={loading && !stats} />

      {/* 3. Search and Filters Toolbar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari nama, username, email, NISN, ID..."
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

          {/* Role Filter */}
          <div className="relative w-full sm:w-40 shrink-0">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              aria-label="Filter role pengguna"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all cursor-pointer appearance-none"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SISWA">SISWA</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-40 shrink-0">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter status pengguna"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all cursor-pointer appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="relative w-full sm:w-36 shrink-0">
            <select
              value={classNameFilter}
              onChange={(e) => {
                setClassNameFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter kelas siswa"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all cursor-pointer appearance-none"
            >
              <option value="">Semua Kelas</option>
              <option value="X-A">Kelas X-A</option>
              <option value="X-B">Kelas X-B</option>
              <option value="XI-A">Kelas XI-A</option>
              <option value="XI-B">Kelas XI-B</option>
              <option value="XII-A">Kelas XII-A</option>
              <option value="XII-B">Kelas XII-B</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative w-full sm:w-48 shrink-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              aria-label="Urutkan pengguna"
              className="w-full h-10 pl-9 pr-6 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all cursor-pointer appearance-none"
            >
              <option value="name-asc">Nama: A - Z</option>
              <option value="name-desc">Nama: Z - A</option>
              <option value="date-desc">Daftar: Terbaru</option>
              <option value="date-asc">Daftar: Terlama</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset semua filter"
              className="h-10 px-3 bg-gray-100 hover:bg-gray-200 text-[#4B465C] rounded-[9px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. User Table */}
      <UserTable
        users={users}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onEdit={handleOpenEdit}
        onDelete={(usr) => setDeleteTarget(usr)}
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
      <UserModal
        isOpen={modalOpen}
        user={editingUser}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Dialog */}
      <DeleteUserDialog
        isOpen={Boolean(deleteTarget)}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
