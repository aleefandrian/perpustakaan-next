"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  BookmarkCheck,
  X,
  FileText,
  Building,
} from "lucide-react";
import Button from "@/components/ui/Button";
import BookCover from "@/features/books/components/BookCover";

export default function BookDetailModal({
  isOpen,
  book,
  onClose,
  onBorrowClick,
  isPending = false,
  isActiveBorrowed = false,
}) {
  if (!isOpen || !book) return null;

  const isOutOfStock = (book.availableStock ?? 0) <= 0;

  // Determine borrowing button state
  let buttonDisabled = false;
  let buttonText = "Pinjam Buku";
  let buttonIcon = BookOpen;
  let buttonVariant = "primary";
  let buttonClass = "bg-[#6D28D9] hover:bg-[#5B21B6] text-white";

  if (isActiveBorrowed) {
    buttonDisabled = true;
    buttonText = "Sedang Dipinjam";
    buttonIcon = BookmarkCheck;
    buttonClass = "bg-blue-100 text-blue-700 cursor-not-allowed border border-blue-200";
  } else if (isPending) {
    buttonDisabled = true;
    buttonText = "Menunggu Persetujuan";
    buttonIcon = Clock;
    buttonClass = "bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-200";
  } else if (isOutOfStock) {
    buttonDisabled = true;
    buttonText = "Stok Habis";
    buttonIcon = XCircle;
    buttonClass = "bg-rose-100 text-rose-700 cursor-not-allowed border border-rose-200";
  }

  const ButtonIconComponent = buttonIcon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-[#6D28D9]">
            <div className="p-1.5 rounded-lg bg-[#F5F0FF]">
              <BookOpen className="w-5 h-5 text-[#6D28D9]" />
            </div>
            <h3 className="font-bold text-base text-[#27233A]">Detail Buku</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Book Cover */}
            <div className="w-full sm:w-44 shrink-0 flex flex-col items-center">
              <div className="w-40 h-56 rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                <BookCover src={book.coverUrl} alt={book.title} size="lg" />
              </div>

              {/* Stock Status Badge */}
              <div className="mt-3 w-full text-center">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                    isOutOfStock
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Stok Habis</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tersedia: {book.availableStock} / {book.totalStock}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Book Metadata */}
            <div className="flex-1 space-y-3">
              <div>
                <span className="inline-block text-[11px] font-bold text-[#6D28D9] bg-[#F5F0FF] px-2.5 py-0.5 rounded-md mb-1.5 border border-purple-100">
                  {book.category?.name || "Kategori Umum"}
                </span>
                <h2 className="text-xl font-bold text-[#27233A] leading-snug">
                  {book.title}
                </h2>
                {book.subtitle && (
                  <p className="text-xs text-[#858095] mt-0.5 italic">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-sm text-[#4B465C] font-medium mt-1">
                  Penulis: <span className="font-bold text-[#27233A]">{book.author}</span>
                </p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-gray-100 text-xs">
                <div>
                  <span className="text-[#858095] block">ISBN:</span>
                  <span className="font-semibold text-[#27233A]">
                    {book.isbn || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[#858095] block">Genre / Subyek:</span>
                  <span className="font-semibold text-[#27233A]">
                    {book.genre || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[#858095] block">Penerbit:</span>
                  <span className="font-semibold text-[#27233A]">
                    {book.publisher || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[#858095] block">Tahun Terbit:</span>
                  <span className="font-semibold text-[#27233A]">
                    {book.publishedYear || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[#858095] block">Lokasi Rak:</span>
                  <span className="font-semibold text-[#27233A]">
                    {book.location || "Rak A-1"}
                  </span>
                </div>
                <div>
                  <span className="text-[#858095] block">Total Koleksi:</span>
                  <span className="font-semibold text-[#27233A]">
                    {book.totalStock || 5} Eksemplar
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-[#27233A] uppercase tracking-wider mb-1">
                  Sinopsis / Deskripsi
                </h4>
                <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-4">
                  {book.description ||
                    "Tidak ada deskripsi rinci untuk buku ini. Silakan baca langsung di perpustakaan atau ajukan peminjaman."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#858095]">
            Maksimal peminjaman: <strong>1 Bulan Kalender</strong>
          </div>
          <div className="flex items-center gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              Tutup
            </Button>
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={() => onBorrowClick(book)}
              className={`inline-flex items-center justify-center font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs ${buttonClass}`}
            >
              <ButtonIconComponent className="w-4 h-4 mr-1.5" />
              <span>{buttonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
