"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from "lucide-react";
import BorrowingStats from "@/features/borrowings/components/BorrowingStats";
import BorrowingTable from "@/features/borrowings/components/BorrowingTable";
import Pagination from "@/components/shared/Pagination";
import { borrowingService } from "@/features/borrowings/services/borrowingService";

export default function AdminBorrowingManagementPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    onTime: 0,
    overdue: 0,
    totalFine: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "overdue"
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch]);

  useEffect(() => {
    let ignore = false;

    borrowingService
      .getAdminBorrowings({
        search,
        filter,
        sort,
        page,
        limit: pageSize,
      })
      .then((res) => {
        if (!ignore && res.success) {
          setBorrowings(res.data || []);
          if (res.stats) setStats(res.stats);
          if (res.pagination) setPagination(res.pagination);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Gagal memuat data peminjaman:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, filter, sort, page, pageSize]);

  const handleQuickOverdueFilter = () => {
    if (filter === "overdue") {
      setFilter("all");
    } else {
      setFilter("overdue");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F5F0FF] text-[#6D28D9]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
              Data Peminjaman
            </h1>
          </div>
          <p className="text-[13px] text-[#858095] mt-1">
            Pantau seluruh aktivitas peminjaman buku oleh siswa.
          </p>
        </div>

        {/* Quick Overdue Filter Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickOverdueFilter}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
              filter === "overdue"
                ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {filter === "overdue"
                ? "Tampilkan Semua Peminjaman"
                : `Tampilkan Semua yang Terlambat (${stats.overdue})`}
            </span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <BorrowingStats stats={stats} loading={loading && borrowings.length === 0} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-[#858095] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari siswa, NISN, kelas, atau judul buku..."
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

          {/* Status Filter */}
          <div>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter status peminjaman"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Belum Terlambat (Aktif)</option>
              <option value="overdue">Terlambat</option>
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
              aria-label="Urutkan peminjaman"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="latest">Peminjaman Terbaru</option>
              <option value="earliest">Peminjaman Terlama</option>
              <option value="nearest_due">Batas Pengembalian Terdekat</option>
              <option value="most_overdue">Keterlambatan Terbanyak</option>
              <option value="highest_fine">Denda Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Borrowing Table */}
      <BorrowingTable
        borrowings={borrowings}
        role="admin"
        currentPage={page}
        pageSize={pageSize}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
