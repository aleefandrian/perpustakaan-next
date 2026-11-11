"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Calendar, X, Loader2, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import BookCover from "@/features/books/components/BookCover";
import { addCalendarMonth, formatIndoDate } from "@/utils/borrowingUtils";

export default function ApprovalDialog({
  isOpen,
  request,
  onClose,
  onConfirm,
  isProcessing = false,
}) {
  const [error, setError] = useState("");

  if (!isOpen || !request) return null;

  const { user, book } = request;
  const isOutOfStock = (book?.availableStock ?? 0) <= 0;
  const simulatedDueDate = addCalendarMonth(new Date(), 1);

  const handleConfirm = async () => {
    setError("");
    try {
      await onConfirm(request.id);
    } catch (err) {
      setError(err.message || "Gagal menyetujui permohonan.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F0FF]">
          <div className="flex items-center gap-2.5 text-[#6D28D9]">
            <div className="p-1.5 rounded-lg bg-purple-100 text-[#6D28D9]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27233A]">
                Setujui Pengajuan Peminjaman
              </h3>
              <p className="text-xs text-[#858095]">
                Peminjaman akan aktif dengan batas waktu 1 bulan kalender
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Info Box */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-[#858095] uppercase tracking-wider block">
              Informasi Siswa
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#27233A] truncate">
                  {user?.name}
                </h4>
                <p className="text-xs text-[#858095]">
                  NISN: {user?.nisn || "-"} • Kelas: {user?.className || "Siswa"}
                </p>
              </div>
            </div>
          </div>

          {/* Book Info Box */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-[#858095] uppercase tracking-wider block">
              Buku yang Dipinjam
            </span>
            <div className="flex items-start gap-3">
              <div className="w-12 h-16 shrink-0 rounded overflow-hidden shadow-2xs border border-gray-200">
                <BookCover src={book?.coverUrl} alt={book?.title} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#27233A] line-clamp-1">
                  {book?.title}
                </h4>
                <p className="text-xs text-[#858095] mt-0.5">
                  {book?.author || "Penulis Tidak Diketahui"}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isOutOfStock
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                  >
                    Stok Tersedia: {book?.availableStock ?? 0}
                  </span>
                  <span className="text-[11px] text-[#858095]">
                    Rak {book?.location || "A-1"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Due Date & Rules Notice */}
          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-100 text-xs text-[#4B465C] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#6D28D9]">
              <Calendar className="w-4 h-4" />
              <span>Ketentuan Batas Pengembalian:</span>
            </div>
            <p>
              • Batas pengembalian dihitung <strong>1 bulan kalender</strong> dari tanggal persetujuan hari ini:{" "}
              <strong className="text-[#6D28D9]">{formatIndoDate(simulatedDueDate, true)}</strong>.
            </p>
            <p>
              • Stok buku akan otomatis dikurangi 1 eksemplar.
            </p>
            <p>
              • Denda keterlambatan berlaku <strong>Rp2.000 / hari</strong> setelah batas pengembalian.
            </p>
          </div>

          {isOutOfStock && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Stok buku saat ini habis. Anda tidak dapat menyetujui pengajuan ini.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isProcessing || isOutOfStock}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Menyetujui...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Setujui Peminjaman</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
