"use client";

import React from "react";
import { Pencil, Trash2, Tag, BookOpen } from "lucide-react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

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
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="text-center w-12">No</TableHead>
            <TableHead className="min-w-[180px]">Nama Kategori</TableHead>
            <TableHead className="min-w-[260px]">Deskripsi</TableHead>
            <TableHead className="text-center">Jumlah Buku</TableHead>
            <TableHead className="text-center">Dibuat Pada</TableHead>
            <TableHead className="text-center w-28">Aksi</TableHead>
          </tr>
        </TableHeader>

        <TableBody
          loading={loading}
          empty={!loading && categories.length === 0}
          emptyMessage="Tidak ada kategori buku yang ditemukan."
          colSpan={6}
        >
          {categories.map((cat, idx) => {
            const rowNo = (page - 1) * pageSize + idx + 1;
            const bookCount = cat._count?.books ?? 0;

            return (
              <TableRow key={cat.id}>
                <TableCell className="text-center text-xs text-[#858095] font-medium">
                  {rowNo}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F0FF] text-[#6D28D9] flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#27233A] block">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-[#858095] font-mono">
                        /{cat.slug}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-xs text-[#4B465C]">
                  <p className="line-clamp-2 max-w-md leading-relaxed">
                    {cat.description || (
                      <span className="text-gray-400 italic">
                        Tidak ada deskripsi
                      </span>
                    )}
                  </p>
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant={bookCount > 0 ? "purple" : "default"}>
                    <BookOpen className="w-3 h-3 mr-1" />
                    <span>{bookCount} buku</span>
                  </Badge>
                </TableCell>

                <TableCell className="text-center text-xs text-[#858095] font-mono whitespace-nowrap">
                  {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>

                <TableCell className="text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onEdit(cat)}
                      title="Edit Kategori"
                      className="hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onDelete(cat)}
                      title="Hapus Kategori"
                      className="hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
