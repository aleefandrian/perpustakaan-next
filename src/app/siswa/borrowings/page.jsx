"use client";

import React, { useState, useEffect } from "react";
import { BookmarkCheck, Clock, AlertTriangle, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import BookCover from "@/features/books/components/BookCover";

export default function SiswaBorrowingsPage() {
  const [borrowingData, setBorrowingData] = useState({
    loans: [],
    stats: { total: 0, active: 0, returned: 0, overdue: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    fetch("/api/siswa/borrowings")
      .then((res) => res.json())
      .then((res) => {
        if (!isCancelled && res.success) {
          setBorrowingData({
            loans: res.data || [],
            stats: res.stats || { total: 0, active: 0, returned: 0, overdue: 0 },
          });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 text-[#858095]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D28D9]" />
        <span className="text-sm font-medium">Memuat riwayat peminjaman...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#E5E7EB]">
        <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
          Riwayat Peminjaman Buku Saya
        </h1>
        <p className="text-[13px] text-[#858095] mt-1">
          Daftar seluruh transaksi peminjaman dan pengembalian buku perpustakaan Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-[#858095]">Total Peminjaman</span>
          <div className="text-2xl font-bold text-[#27233A] mt-1">
            {borrowingData.stats.total}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-blue-600 font-medium">Sedang Dipinjam</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {borrowingData.stats.active}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-emerald-600 font-medium">Selesai Dikembalikan</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {borrowingData.stats.returned}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-rose-600 font-medium">Terlambat</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {borrowingData.stats.overdue}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#F8F9FC] text-[11px] font-bold text-[#858095] uppercase tracking-wider border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5 min-w-[240px]">Judul Buku</th>
                <th className="px-4 py-3.5 text-center">Tanggal Pinjam</th>
                <th className="px-4 py-3.5 text-center">Batas Pengembalian</th>
                <th className="px-4 py-3.5 text-center">Tanggal Kembali</th>
                <th className="px-4 py-3.5 text-center w-28">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB] text-sm">
              {borrowingData.loans.length > 0 ? (
                borrowingData.loans.map((loan, idx) => {
                  const isReturned = loan.status === "RETURNED";
                  const isOverdue = loan.status === "OVERDUE";

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-[#F8F9FC]/80 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center text-xs text-[#858095]">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                            <BookCover
                              src={loan.book?.coverUrl}
                              alt={loan.book?.title}
                              size="sm"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-[13.5px] text-[#27233A] block truncate">
                              {loan.book?.title}
                            </span>
                            <span className="text-[11px] text-[#858095] block truncate">
                              {loan.book?.author} • Rak {loan.book?.location || "A-1"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs text-[#4B465C] whitespace-nowrap">
                        {new Date(loan.borrowDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs font-semibold text-[#27233A] whitespace-nowrap">
                        {new Date(loan.dueDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs text-[#858095] whitespace-nowrap">
                        {loan.returnDate ? (
                          new Date(loan.returnDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isReturned
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isOverdue
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-[#F5F0FF] text-[#6D28D9] border border-[#EBDFFF]"
                          }`}
                        >
                          {isReturned
                            ? "Selesai"
                            : isOverdue
                            ? "Terlambat"
                            : "Dipinjam"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#858095]">
                    <BookmarkCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-[#27233A]">
                      Belum Ada Riwayat Peminjaman
                    </p>
                    <p className="text-xs text-[#858095] mt-1">
                      Buku yang Anda pinjam dari perpustakaan akan tercatat secara otomatis di sini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
