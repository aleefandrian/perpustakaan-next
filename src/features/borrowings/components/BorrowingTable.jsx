"use client";

import React from "react";
import { BookOpen, Calendar, Clock, AlertTriangle, Coins } from "lucide-react";
import BookCover from "@/features/books/components/BookCover";
import BorrowingStatusBadge from "./BorrowingStatusBadge";
import OverdueBadge from "./OverdueBadge";
import EmptyState from "@/components/shared/EmptyState";
import { formatIndoDate, formatRupiah } from "@/utils/borrowingUtils";

export default function BorrowingTable({
  borrowings = [],
  role = "admin", // "admin" | "siswa"
  currentPage = 1,
  pageSize = 20,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#6D28D9] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#858095] font-medium">
            Memuat data peminjaman buku...
          </span>
        </div>
      </div>
    );
  }

  if (borrowings.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Tidak Ada Peminjaman Aktif"
        description={
          role === "admin"
            ? "Belum ada transaksi peminjaman buku yang aktif saat ini."
            : "Anda sedang tidak meminjam buku apapun dari perpustakaan."
        }
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead className="bg-[#F8F9FC] text-[11px] font-bold text-[#858095] uppercase tracking-wider border-b border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-3.5 text-center w-12">No</th>
              {role === "admin" && (
                <>
                  <th className="px-4 py-3.5 min-w-[190px]">Siswa</th>
                  <th className="px-4 py-3.5 text-center w-24">Kelas</th>
                </>
              )}
              {role === "siswa" && (
                <th className="px-4 py-3.5 text-center w-20">Cover Buku</th>
              )}
              <th className="px-4 py-3.5 min-w-[220px]">Buku</th>
              <th className="px-4 py-3.5 text-center min-w-[130px]">
                {role === "admin" ? "Tanggal Peminjaman" : "Tanggal Disetujui"}
              </th>
              <th className="px-4 py-3.5 text-center min-w-[130px]">
                Batas Pengembalian
              </th>
              <th className="px-4 py-3.5 text-center min-w-[130px]">
                {role === "admin" ? "Keterlambatan" : "Sisa Waktu"}
              </th>
              <th className="px-4 py-3.5 text-center w-28">Status</th>
              <th className="px-4 py-3.5 text-right w-32">Denda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-[13px] text-[#27233A]">
            {borrowings.map((item, index) => {
              const rowNumber = (currentPage - 1) * pageSize + index + 1;
              const isOverdue = item.isOverdue;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isOverdue
                      ? "bg-rose-50/30 hover:bg-rose-50/50"
                      : "hover:bg-purple-50/20"
                  }`}
                >
                  {/* No */}
                  <td className="px-4 py-3.5 text-center text-[#858095] font-mono text-xs">
                    {rowNumber}
                  </td>

                  {/* Siswa (Admin view) */}
                  {role === "admin" && (
                    <>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.user?.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-[#27233A] block truncate max-w-[180px]">
                              {item.user?.name}
                            </span>
                            <span className="text-[11px] text-[#858095] block font-mono">
                              NISN: {item.user?.nisn || "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {item.user?.className || "Siswa"}
                        </span>
                      </td>
                    </>
                  )}

                  {/* Cover Buku (Student view) */}
                  {role === "siswa" && (
                    <td className="px-4 py-3.5 text-center">
                      <div className="w-10 h-14 mx-auto rounded overflow-hidden shadow-2xs border border-gray-100 bg-gray-50 flex items-center justify-center">
                        <BookCover
                          src={item.book?.coverUrl}
                          alt={item.book?.title}
                          size="sm"
                        />
                      </div>
                    </td>
                  )}

                  {/* Buku Info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {role === "admin" && (
                        <div className="w-9 h-12 shrink-0 rounded overflow-hidden shadow-2xs border border-gray-100 bg-gray-50 flex items-center justify-center">
                          <BookCover
                            src={item.book?.coverUrl}
                            alt={item.book?.title}
                            size="sm"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-[#27233A] line-clamp-1">
                          {item.book?.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#858095] mt-0.5">
                          <span>{item.book?.author}</span>
                          <span className="text-gray-300">•</span>
                          <span>Rak {item.book?.location || "A-1"}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tanggal Pinjam / Disetujui */}
                  <td className="px-4 py-3.5 text-center text-xs text-[#4B465C] whitespace-nowrap">
                    {formatIndoDate(item.borrowedAt)}
                  </td>

                  {/* Batas Pengembalian */}
                  <td className="px-4 py-3.5 text-center text-xs font-semibold whitespace-nowrap text-[#27233A]">
                    {formatIndoDate(item.dueDate)}
                  </td>

                  {/* Keterlambatan / Sisa Waktu */}
                  <td className="px-4 py-3.5 text-center">
                    <OverdueBadge
                      isOverdue={item.isOverdue}
                      overdueDays={item.overdueDays}
                      daysRemaining={item.daysRemaining}
                      fineAmount={item.fineAmount}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <BorrowingStatusBadge
                      status={item.isOverdue ? "TERLAMBAT" : "AKTIF"}
                      size="sm"
                    />
                  </td>

                  {/* Denda */}
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-xs whitespace-nowrap">
                    {item.fineAmount > 0 ? (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {item.formattedFine || formatRupiah(item.fineAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">Rp0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
