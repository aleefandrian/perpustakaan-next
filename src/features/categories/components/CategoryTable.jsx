"use client";

import React from "react";
import { Pencil, Trash2, Tag, BookOpen } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function CategoryTable({
  categories = [],
  loading = false,
  page = 1,
  pageSize = 20,
  onEdit,
  onDelete,
  onResetFilters,
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-[#F8F9FC] text-[11px] font-bold text-[#858095] uppercase tracking-wider border-b border-[#E5E7EB] select-none">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-12">
                No
              </th>
              <th scope="col" className="px-4 py-3 min-w-[180px]">
                Nama Kategori
              </th>
              <th scope="col" className="px-4 py-3 min-w-[260px]">
                Deskripsi
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Jumlah Buku
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Dibuat Pada
              </th>
              <th scope="col" className="px-4 py-3 text-center w-28">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] text-sm">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-4 w-5 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-56 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-5 w-12 bg-gray-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-7 w-16 bg-gray-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat, idx) => {
                const rowNo = (page - 1) * pageSize + idx + 1;
                const bookCount = cat._count?.books ?? 0;

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-[#F8F9FC]/80 transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-center text-xs text-[#858095] font-medium">
                      {rowNo}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F5F0FF] text-[#6D28D9] flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-[13.5px] text-[#27233A] block">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-[#858095] font-mono">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#4B465C]">
                      <p className="line-clamp-2 max-w-md leading-relaxed">
                        {cat.description || (
                          <span className="text-gray-400 italic">
                            Tidak ada deskripsi
                          </span>
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          bookCount > 0
                            ? "bg-[#EBDFFF] text-[#6D28D9]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{bookCount} buku</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center text-xs text-[#858095] font-mono whitespace-nowrap">
                      {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(cat)}
                          title="Edit Kategori"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#858095] hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(cat)}
                          title="Hapus Kategori"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#858095] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <EmptyState
                    title="Kategori Tidak Ditemukan"
                    description="Tidak ada kategori yang cocok dengan kriteria pencarian Anda."
                    onReset={onResetFilters}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
