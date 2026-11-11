"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
} from "lucide-react";
import BorrowingRequestStats from "@/features/borrowings/components/BorrowingRequestStats";
import BorrowingRequestTable from "@/features/borrowings/components/BorrowingRequestTable";
import RequestDetailModal from "@/features/borrowings/components/RequestDetailModal";
import Pagination from "@/components/shared/Pagination";
import Button from "@/components/ui/Button";
import { borrowingService } from "@/features/borrowings/services/borrowingService";

export default function SiswaPengajuanPeminjamanPage() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [detailItem, setDetailItem] = useState(null);
  const [cancelItem, setCancelItem] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Toast notification
  const [notification, setNotification] = useState(null);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      .getStudentRequests({
        search,
        status,
        page,
        limit: pageSize,
      })
      .then((res) => {
        if (!ignore && res.success) {
          setRequests(res.data || []);
          if (res.stats) setStats(res.stats);
          if (res.pagination) setPagination(res.pagination);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Gagal memuat pengajuan peminjaman:", err);
          showToast("error", err.message || "Gagal memuat pengajuan peminjaman.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, status, page, pageSize, refreshTrigger]);

  // Handle Cancel Request
  const handleCancelConfirm = async () => {
    if (!cancelItem) return;
    setIsCancelling(true);
    try {
      const res = await borrowingService.cancelBorrowRequest(cancelItem.id);
      if (res.success) {
        showToast("success", res.message || "Pengajuan peminjaman berhasil dibatalkan.");
        setCancelItem(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      showToast("error", err.message || "Gagal membatalkan pengajuan.");
    } finally {
      setIsCancelling(false);
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
      <div className="pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F5F0FF] text-[#6D28D9]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
            Pengajuan Peminjaman
          </h1>
        </div>
        <p className="text-[13px] text-[#858095] mt-1">
          Pantau dan kelola pengajuan peminjaman buku Anda.
        </p>
      </div>

      {/* Stats */}
      <BorrowingRequestStats
        stats={stats}
        loading={loading && requests.length === 0}
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter status pengajuan"
              className="w-full h-10 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Menunggu Persetujuan</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request Table */}
      <BorrowingRequestTable
        requests={requests}
        role="siswa"
        currentPage={page}
        pageSize={pageSize}
        loading={loading}
        onDetail={(req) => setDetailItem(req)}
        onCancel={(req) => setCancelItem(req)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
      />

      {/* Detail Modal */}
      <RequestDetailModal
        isOpen={Boolean(detailItem)}
        request={detailItem}
        onClose={() => setDetailItem(null)}
      />

      {/* Cancel Confirmation Dialog */}
      {cancelItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-rose-50/70">
              <div className="flex items-center gap-2 text-rose-700">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#27233A]">
                  Batalkan Pengajuan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-[#4B465C] space-y-2">
              <p>
                Apakah Anda yakin ingin membatalkan pengajuan peminjaman untuk buku:
              </p>
              <p className="font-bold text-sm text-[#27233A]">
                &ldquo;{cancelItem.book?.title}&rdquo;?
              </p>
              <p className="text-[11px] text-[#858095]">
                Pengajuan yang dibatalkan akan dihapus dari antrean permohonan.
              </p>
            </div>
            <div className="px-5 py-3.5 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelItem(null)}
                disabled={isCancelling}
              >
                Tidak
              </Button>
              <Button
                type="button"
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isCancelling ? "Membatalkan..." : "Ya, Batalkan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
