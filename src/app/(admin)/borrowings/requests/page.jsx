"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";
import BorrowingRequestStats from "@/features/borrowings/components/BorrowingRequestStats";
import BorrowingRequestTable from "@/features/borrowings/components/BorrowingRequestTable";
import ApprovalDialog from "@/features/borrowings/components/ApprovalDialog";
import RejectionDialog from "@/features/borrowings/components/RejectionDialog";
import RequestDetailModal from "@/features/borrowings/components/RequestDetailModal";
import Pagination from "@/components/shared/Pagination";
import { borrowingService } from "@/features/borrowings/services/borrowingService";

export default function AdminBorrowingRequestsPage() {
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
  const [status, setStatus] = useState("all"); // "all" | "PENDING" | "APPROVED" | "REJECTED"
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Dialog states
  const [detailItem, setDetailItem] = useState(null);
  const [approvalItem, setApprovalItem] = useState(null);
  const [rejectionItem, setRejectionItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      .getAdminRequests({
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
          console.error("Gagal memuat permohonan peminjaman:", err);
          showToast("error", err.message || "Gagal memuat permohonan peminjaman.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, status, page, pageSize, refreshTrigger]);

  // Handle Approve
  const handleApproveConfirm = async (requestId) => {
    setIsProcessing(true);
    try {
      const res = await borrowingService.approveRequest(requestId);
      if (res.success) {
        showToast("success", res.message || "Permohonan berhasil disetujui!");
        setApprovalItem(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleRejectConfirm = async (requestId, reason) => {
    setIsProcessing(true);
    try {
      const res = await borrowingService.rejectRequest(requestId, reason);
      if (res.success) {
        showToast("success", res.message || "Permohonan berhasil ditolak.");
        setRejectionItem(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      throw err;
    } finally {
      setIsProcessing(false);
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
          Periksa dan kelola permohonan peminjaman buku dari siswa.
        </p>
      </div>

      {/* Statistics */}
      <BorrowingRequestStats
        stats={stats}
        loading={loading && requests.length === 0}
      />

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-3">
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter status permohonan"
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

      {/* Table */}
      <BorrowingRequestTable
        requests={requests}
        role="admin"
        currentPage={page}
        pageSize={pageSize}
        loading={loading}
        onDetail={(req) => setDetailItem(req)}
        onApprove={(req) => setApprovalItem(req)}
        onReject={(req) => setRejectionItem(req)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
      />

      {/* Modals */}
      <RequestDetailModal
        isOpen={Boolean(detailItem)}
        request={detailItem}
        onClose={() => setDetailItem(null)}
      />

      <ApprovalDialog
        isOpen={Boolean(approvalItem)}
        request={approvalItem}
        onClose={() => setApprovalItem(null)}
        onConfirm={handleApproveConfirm}
        isProcessing={isProcessing}
      />

      <RejectionDialog
        isOpen={Boolean(rejectionItem)}
        request={rejectionItem}
        onClose={() => setRejectionItem(null)}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessing}
      />
    </div>
  );
}
