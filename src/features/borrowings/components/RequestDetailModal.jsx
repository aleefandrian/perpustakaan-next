"use client";

import React from "react";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  X,
  AlertTriangle,
  User,
} from "lucide-react";
import Button from "@/components/ui/Button";
import BookCover from "@/features/books/components/BookCover";
import BorrowingStatusBadge from "./BorrowingStatusBadge";
import { formatIndoDateTime, formatIndoDate } from "@/utils/borrowingUtils";

export default function RequestDetailModal({ isOpen, request, onClose }) {
  if (!isOpen || !request) return null;

  const { user, book, status, requestedAt, approvedAt, rejectedAt, rejectionReason } =
    request;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FC]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F5F0FF] text-[#6D28D9]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27233A]">
                Detail Pengajuan Peminjaman
              </h3>
              <p className="text-xs text-[#858095]">
                ID Pengajuan: #{request.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Header */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[#858095] font-medium">Status Pengajuan:</span>
            <BorrowingStatusBadge status={status} size="md" />
          </div>

          {/* Student Info (if present) */}
          {user && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
              <span className="text-[11px] font-bold text-[#858095] uppercase tracking-wider block">
                Pemohon
              </span>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#27233A]">{user.name}</h4>
                  <p className="text-[#858095]">
                    NISN: {user.nisn || "-"} • Kelas: {user.className || "Siswa"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Book Info */}
          {book && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-2xs border border-gray-200">
                <BookCover src={book.coverUrl} alt={book.title} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#27233A] line-clamp-1">
                  {book.title}
                </h4>
                <p className="text-[#858095] mt-0.5">
                  {book.author} • ISBN: {book.isbn || "-"}
                </p>
                <p className="text-[11px] text-purple-700 font-medium mt-1">
                  Kategori: {book.category?.name || "Kategori Umum"}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 text-[#4B465C]">
            <div className="flex justify-between">
              <span className="text-[#858095]">Tanggal Pengajuan:</span>
              <span className="font-semibold text-[#27233A]">
                {formatIndoDateTime(requestedAt)}
              </span>
            </div>
            {approvedAt && (
              <div className="flex justify-between">
                <span className="text-[#858095]">Tanggal Disetujui:</span>
                <span className="font-semibold text-emerald-700">
                  {formatIndoDateTime(approvedAt)}
                </span>
              </div>
            )}
            {rejectedAt && (
              <div className="flex justify-between">
                <span className="text-[#858095]">Tanggal Ditolak:</span>
                <span className="font-semibold text-rose-700">
                  {formatIndoDateTime(rejectedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Rejection Reason Notice */}
          {status === "REJECTED" && rejectionReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Alasan Penolakan dari Admin:</span>
              </div>
              <p className="pl-5 text-xs text-rose-800 leading-relaxed italic">
                &ldquo;{rejectionReason}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-[#E5E7EB] flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
