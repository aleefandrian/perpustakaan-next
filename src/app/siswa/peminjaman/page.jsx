"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookmarkCheck,
  Search,
  Clock,
  AlertTriangle,
  Coins,
  X,
} from "lucide-react";
import BorrowingStats from "@/features/borrowings/components/BorrowingStats";
import BorrowingTable from "@/features/borrowings/components/BorrowingTable";
import Pagination from "@/components/shared/Pagination";
import { borrowingService } from "@/features/borrowings/services/borrowingService";

export default function SiswaPeminjamanPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    onTime: 0,
    overdue: 0,
    totalFine: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Debounce search
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
      .getStudentBorrowings({
        search,
        filter,
        page,
        limit: pageSize,
      })
      .then((res) => {
        if (!ignore && res.success) {
          setBorrowings(res.data || []);
          if (res.stats) {
            setStats({
              totalActive: res.stats.total || 0,
              onTime: res.stats.active || 0,
              overdue: res.stats.overdue || 0,
              totalFine: res.stats.totalFine || 0,
            });
          }
          if (res.pagination) setPagination(res.pagination);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Gagal memuat peminjaman siswa:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, filter, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F5F0FF] text-[#6D28D9]">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
            Peminjaman Saya
          </h1>
        </div>
        <p className="text-[13px] text-[#858095] mt-1">
          Daftar seluruh buku perpustakaan yang sedang Anda pinjam beserta batas waktu pengembalian dan informasi denda.
        </p>
      </div>

      {/* Stats */}
      <BorrowingStats
        stats={stats}
        loading={loading && borrowings.length === 0}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-3">
            <Search className="w-4 h-4 text-[#858095] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari judul buku, penulis, ISBN..."
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
              aria-label="Filter status tenggang"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="all">Semua Peminjaman</option>
              <option value="on_time">Belum Terlambat</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <BorrowingTable
        borrowings={borrowings}
        role="siswa"
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
