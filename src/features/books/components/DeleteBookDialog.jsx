"use client";

import React, { useState } from "react";
import { AlertCircle, Trash2, X, Loader2, ShieldAlert } from "lucide-react";
import BookCover from "./BookCover";
import Button from "@/components/ui/Button";

export default function DeleteBookDialog({
  isOpen,
  book,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !book) return null;

  const hasActiveLoans = book._count?.loans > 0 || book.activeLoansCount > 0;

  const handleConfirmClick = async () => {
    setErrorMessage("");
    try {
      await onConfirm(book.id);
    } catch (err) {
      setErrorMessage(err.message || "Gagal menghapus buku.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <div className="p-1.5 rounded-lg bg-rose-100">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 id="modal-title" className="font-bold text-sm text-[#27233A]">
              Konfirmasi Hapus Buku
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-[13px] text-[#4B465C] leading-relaxed">
            Apakah Anda yakin ingin menghapus buku ini dari basis data perpustakaan? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
          </p>

          {/* Book Preview Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
            <BookCover src={book.coverUrl} alt={book.title} size="sm" />
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-bold text-[#27233A] truncate">
                {book.title}
              </h4>
              <p className="text-xs text-[#858095] truncate mt-0.5">
                Pengarang: {book.author}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#858095]">
                <span>Tahun: {book.publishedYear || "-"}</span>
                <span>•</span>
                <span>Stok: {book.availableStock}/{book.totalStock}</span>
              </div>
            </div>
          </div>

          {/* Warning if book has active loans */}
          {hasActiveLoans && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Peminjaman Terkait</span>
                Buku ini memiliki catatan transaksi peminjaman di sistem. Pastikan seluruh buku telah dikembalikan sebelum melakukan penghapusan.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50/70 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-[13px]"
          >
            Batal
          </Button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-[7px] bg-[#DC2626] text-white hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Buku</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
