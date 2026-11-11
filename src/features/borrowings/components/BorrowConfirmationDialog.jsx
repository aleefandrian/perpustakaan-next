"use client";

import React, { useState } from "react";
import { BookOpen, CheckCircle2, Clock, AlertCircle, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import BookCover from "@/features/books/components/BookCover";

export default function BorrowConfirmationDialog({
  isOpen,
  book,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const [error, setError] = useState("");

  if (!isOpen || !book) return null;

  const handleConfirm = async () => {
    setError("");
    try {
      await onConfirm(book.id);
    } catch (err) {
      setError(err.message || "Gagal mengajukan peminjaman buku.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F0FF]">
          <div className="flex items-center gap-2 text-[#6D28D9]">
            <div className="p-1.5 rounded-lg bg-purple-100 text-[#6D28D9]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27233A]">
                Konfirmasi Pengajuan Peminjaman
              </h3>
              <p className="text-xs text-[#858095]">
                Peminjaman memerlukan persetujuan dari Administrator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Book Info */}
          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-14 h-20 shrink-0 rounded overflow-hidden shadow-2xs border border-gray-200">
              <BookCover src={book.coverUrl} alt={book.title} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] font-semibold text-[#6D28D9] bg-[#F5F0FF] px-2 py-0.5 rounded mb-1">
                {book.category?.name || "Kategori Umum"}
              </span>
              <h4 className="font-bold text-sm text-[#27233A] line-clamp-2">
                {book.title}
              </h4>
              <p className="text-xs text-[#858095] mt-0.5">
                {book.author} • {book.publishedYear || "-"}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Stok tersedia: {book.availableStock} eksemplar
              </p>
            </div>
          </div>

          {/* Business Rules Explanation */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-[#4B465C] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#6D28D9]">
              <Clock className="w-4 h-4" />
              <span>Ketentuan Peminjaman:</span>
            </div>
            <p>
              1. Pengajuan akan diteruskan ke Administrator perpustakaan untuk ditinjau.
            </p>
            <p>
              2. Batas waktu peminjaman adalah <strong>1 bulan kalender</strong> terhitung sejak permohonan disetujui.
            </p>
            <p>
              3. Denda keterlambatan pengembalian sebesar <strong>Rp2.000 / hari</strong> setelah tanggal jatuh tempo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Mengajukan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Ya, Ajukan Peminjaman</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
