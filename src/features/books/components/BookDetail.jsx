"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  BookOpen,
  MapPin,
  Calendar,
  Building,
  Barcode,
  ExternalLink,
  Layers,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";
import BookCover from "./BookCover";
import StatusBadge from "@/components/shared/StatusBadge";
import DeleteBookDialog from "./DeleteBookDialog";
import { deleteBook } from "../services/bookService";
import { formatIsbn } from "@/utils/bookUtils";

export default function BookDetail({ book }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBook(book.id);
      router.push("/books");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <Link
            href="/books"
            className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#E5E7EB] bg-white text-[#4B465C] hover:bg-gray-50 transition-colors"
            title="Kembali ke Daftar Buku"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#27233A]">Detail Buku</h1>
            <p className="text-xs text-[#858095]">
              Informasi lengkap katalog dan ketersediaan stok
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/books/${book.id}/edit`}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-[9px] bg-white border border-[#E5E7EB] text-[#4B465C] hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-600" />
            <span>Edit Buku</span>
          </Link>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-[9px] bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Section */}
          <div className="flex flex-col items-center shrink-0 space-y-3">
            <BookCover
              src={book.coverUrl}
              alt={book.title}
              size="lg"
              className="w-44 h-60 rounded-xl shadow-md border border-gray-200"
            />
            <div className="text-center">
              <StatusBadge availableStock={book.availableStock} />
            </div>
            {book.sourceUrl && (
              <a
                href={book.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-[#6D28D9] hover:underline pt-1"
              >
                <span>Lihat di Open Library</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-[#6D28D9] bg-[#F5F0FF] px-2.5 py-0.5 rounded-full border border-purple-100">
                  {book.category?.name || "Umum"}
                </span>
                {book.genre && (
                  <span className="text-[11px] text-[#858095] bg-gray-100 px-2 py-0.5 rounded-full">
                    {book.genre}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#27233A] leading-tight">
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="text-sm text-[#858095] mt-1 font-medium">
                  {book.subtitle}
                </p>
              )}
              <p className="text-sm text-[#4B465C] mt-2">
                Oleh <span className="font-semibold text-[#27233A]">{book.author}</span>
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[#E5E7EB]">
              <div>
                <span className="text-[11px] text-[#858095] block mb-0.5">ISBN</span>
                <span className="text-xs font-mono font-semibold text-[#27233A]">
                  {formatIsbn(book.isbn)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#858095] block mb-0.5">Penerbit</span>
                <span className="text-xs font-medium text-[#27233A] truncate block" title={book.publisher}>
                  {book.publisher || "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#858095] block mb-0.5">Tahun Terbit</span>
                <span className="text-xs font-mono font-semibold text-[#27233A]">
                  {book.publishedYear || "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#858095] block mb-0.5">Lokasi Rak</span>
                <span className="text-xs font-medium text-[#27233A]">
                  {book.location || "-"}
                </span>
              </div>
            </div>

            {/* Stock Counts */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E5E7EB]">
              <div className="text-center">
                <span className="text-[11px] text-[#858095] block">Total Stok</span>
                <span className="text-lg font-bold text-[#27233A] font-mono">
                  {book.totalStock}
                </span>
              </div>
              <div className="text-center border-x border-[#E5E7EB]">
                <span className="text-[11px] text-[#858095] block">Tersedia</span>
                <span className="text-lg font-bold text-[#16A34A] font-mono">
                  {book.availableStock}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-[#858095] block">Dipinjam</span>
                <span className="text-lg font-bold text-[#6D28D9] font-mono">
                  {Math.max(0, book.totalStock - book.availableStock)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#858095] mb-1.5">
                Sinopsis & Deskripsi
              </h3>
              <p className="text-xs text-[#4B465C] leading-relaxed whitespace-pre-line">
                {book.description || "Belum ada deskripsi yang ditambahkan untuk buku ini."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowing History */}
      {book.loans && book.loans.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#6D28D9]" />
            <h3 className="text-sm font-bold text-[#27233A]">
              Riwayat Transaksi Peminjaman
            </h3>
          </div>

          <div className="divide-y divide-[#E5E7EB] text-xs">
            {book.loans.map((loan) => (
              <div key={loan.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-50 text-[#6D28D9] flex items-center justify-center font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#27233A]">{loan.borrower}</span>
                    <span className="text-[#858095] ml-2">({loan.role || "Anggota"})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#858095]">
                  <span>Pinjam: {new Date(loan.borrowDate).toLocaleDateString("id-ID")}</span>
                  <span>Jatuh Tempo: {new Date(loan.dueDate).toLocaleDateString("id-ID")}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      loan.status === "ACTIVE"
                        ? "bg-blue-50 text-blue-700"
                        : loan.status === "OVERDUE"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteBookDialog
        isOpen={deleteOpen}
        book={book}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
