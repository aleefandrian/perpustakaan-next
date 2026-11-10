"use client";

import React from "react";
import BookTableRow from "./BookTableRow";
import EmptyState from "@/components/shared/EmptyState";

export default function BookTable({
  books = [],
  loading = false,
  page = 1,
  pageSize = 20,
  onDelete,
  onResetFilters,
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          {/* Table Head */}
          <thead className="bg-[#F8F9FC] text-[11px] font-bold text-[#858095] uppercase tracking-wider border-b border-[#E5E7EB] select-none">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-12">
                No
              </th>
              <th scope="col" className="px-3 py-3 w-16">
                Cover
              </th>
              <th scope="col" className="px-4 py-3 min-w-[220px]">
                Judul Buku
              </th>
              <th scope="col" className="px-4 py-3 min-w-[140px]">
                Pengarang
              </th>
              <th scope="col" className="px-4 py-3">
                ISBN
              </th>
              <th scope="col" className="px-4 py-3">
                Genre
              </th>
              <th scope="col" className="px-4 py-3">
                Kategori
              </th>
              <th scope="col" className="px-4 py-3">
                Penerbit
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Tahun
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Stok
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Tersedia
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Aksi
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#E5E7EB] text-sm">
            {loading ? (
              // Loading Skeleton Rows (5 rows)
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-5 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="w-[45px] h-[62px] bg-gray-200 rounded-md" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-44 bg-gray-200 rounded mb-1.5" />
                    <div className="h-3 w-28 bg-gray-150 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded font-mono" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-10 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-6 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-6 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-5 w-18 bg-gray-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-7 w-20 bg-gray-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : books.length > 0 ? (
              books.map((book, idx) => (
                <BookTableRow
                  key={book.id}
                  book={book}
                  index={idx}
                  page={page}
                  pageSize={pageSize}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={13} className="p-8 text-center">
                  <EmptyState onReset={onResetFilters} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
