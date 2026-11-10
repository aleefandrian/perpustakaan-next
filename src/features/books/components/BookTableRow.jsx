"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import BookCover from "./BookCover";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatIsbn } from "@/utils/bookUtils";

export default function BookTableRow({
  book,
  index,
  page = 1,
  pageSize = 20,
  onDelete,
}) {
  const rowNumber = (page - 1) * pageSize + index + 1;

  return (
    <tr className="hover:bg-[#F8F9FC]/80 transition-colors group">
      {/* 1. No */}
      <td className="px-4 py-3 text-center text-xs text-[#858095] font-medium w-12">
        {rowNumber}
      </td>

      {/* 2. Cover Thumbnail */}
      <td className="px-3 py-2.5 w-16">
        <Link href={`/books/${book.id}`} className="block focus:outline-none">
          <BookCover src={book.coverUrl} alt={book.title} size="md" />
        </Link>
      </td>

      {/* 3. Judul Buku & Subtitle */}
      <td className="px-4 py-3 min-w-[220px] max-w-[280px]">
        <Link
          href={`/books/${book.id}`}
          className="font-semibold text-[13.5px] text-[#27233A] hover:text-[#6D28D9] transition-colors line-clamp-2 leading-snug"
          title={book.title}
        >
          {book.title}
        </Link>
        {book.subtitle && (
          <p className="text-[11px] text-[#858095] line-clamp-1 mt-0.5">
            {book.subtitle}
          </p>
        )}
        {book.location && (
          <span className="inline-block mt-1 text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
            {book.location}
          </span>
        )}
      </td>

      {/* 4. Pengarang */}
      <td className="px-4 py-3 text-[13px] text-[#4B465C] min-w-[140px] max-w-[180px]">
        <span className="line-clamp-2" title={book.author}>
          {book.author}
        </span>
      </td>

      {/* 5. ISBN */}
      <td className="px-4 py-3 text-xs font-mono text-[#858095] whitespace-nowrap">
        {formatIsbn(book.isbn)}
      </td>

      {/* 6. Genre */}
      <td className="px-4 py-3 text-xs text-[#4B465C] max-w-[140px]">
        <span className="line-clamp-1" title={book.genre || "-"}>
          {book.genre || "-"}
        </span>
      </td>

      {/* 7. Kategori */}
      <td className="px-4 py-3 text-xs whitespace-nowrap">
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F5F0FF] text-[#6D28D9] font-medium text-[11px]">
          {book.category?.name || "Umum"}
        </span>
      </td>

      {/* 8. Penerbit */}
      <td className="px-4 py-3 text-xs text-[#4B465C] max-w-[140px]">
        <span className="line-clamp-1" title={book.publisher || "-"}>
          {book.publisher || "-"}
        </span>
      </td>

      {/* 9. Tahun */}
      <td className="px-4 py-3 text-xs text-[#858095] text-center font-mono">
        {book.publishedYear || "-"}
      </td>

      {/* 10. Stok Total */}
      <td className="px-4 py-3 text-xs font-semibold text-[#27233A] text-center font-mono">
        {book.totalStock}
      </td>

      {/* 11. Stok Tersedia */}
      <td className="px-4 py-3 text-xs font-bold text-[#6D28D9] text-center font-mono">
        {book.availableStock}
      </td>

      {/* 12. Status Stok Badge */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <StatusBadge availableStock={book.availableStock} />
      </td>

      {/* 13. Aksi (Detail, Edit, Delete) */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-1">
          {/* Detail Link */}
          <Link
            href={`/books/${book.id}`}
            aria-label={`Detail ${book.title}`}
            title="Lihat Detail"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#858095] hover:text-[#6D28D9] hover:bg-[#F5F0FF] hover:border-purple-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Edit Link */}
          <Link
            href={`/books/${book.id}/edit`}
            aria-label={`Edit ${book.title}`}
            title="Edit Buku"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#858095] hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(book)}
            aria-label={`Hapus ${book.title}`}
            title="Hapus Buku"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#858095] hover:text-[#DC2626] hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
