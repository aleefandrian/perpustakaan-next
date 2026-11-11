"use client";

import React from "react";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle,
} from "lucide-react";
import BookCover from "@/features/books/components/BookCover";
import BorrowingStatusBadge from "./BorrowingStatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { formatIndoDate, formatIndoDateTime } from "@/utils/borrowingUtils";

export default function BorrowingRequestTable({
  requests = [],
  role = "admin", // "admin" | "siswa"
  currentPage = 1,
  pageSize = 20,
  onDetail,
  onApprove,
  onReject,
  onCancel,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#6D28D9] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#858095] font-medium">
            Memuat daftar permohonan peminjaman...
          </span>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Belum Ada Pengajuan Peminjaman"
        description={
          role === "admin"
            ? "Tidak ada permohonan peminjaman buku yang sesuai dengan filter pencarian."
            : "Anda belum pernah mengajukan peminjaman buku perpustakaan."
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
                  <th className="px-4 py-3.5 min-w-[200px]">Siswa</th>
                  <th className="px-4 py-3.5 text-center w-24">Kelas</th>
                </>
              )}
              {role === "siswa" && (
                <th className="px-4 py-3.5 text-center w-20">Cover Buku</th>
              )}
              <th className="px-4 py-3.5 min-w-[220px]">Buku</th>
              <th className="px-4 py-3.5 text-center min-w-[140px]">
                Tanggal Pengajuan
              </th>
              <th className="px-4 py-3.5 text-center w-36">Status</th>
              {role === "siswa" && (
                <th className="px-4 py-3.5 min-w-[160px]">Keterangan</th>
              )}
              <th className="px-4 py-3.5 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-[13px] text-[#27233A]">
            {requests.map((item, index) => {
              const rowNumber = (currentPage - 1) * pageSize + index + 1;
              const isPending = item.status === "PENDING";
              const isOutOfStock = (item.book?.availableStock ?? 0) <= 0;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-purple-50/20 transition-colors"
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
                          {role === "admin" && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isOutOfStock
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              Stok: {item.book?.availableStock ?? 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tanggal Pengajuan */}
                  <td className="px-4 py-3.5 text-center text-xs text-[#4B465C] whitespace-nowrap">
                    {formatIndoDateTime(item.requestedAt)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <BorrowingStatusBadge status={item.status} size="sm" />
                  </td>

                  {/* Keterangan (Student view) */}
                  {role === "siswa" && (
                    <td className="px-4 py-3.5 text-xs text-[#4B465C]">
                      {item.status === "PENDING" && (
                        <span className="text-amber-700 font-medium">
                          Sedang ditinjau petugas
                        </span>
                      )}
                      {item.status === "APPROVED" && (
                        <span className="text-emerald-700 font-medium">
                          Peminjaman disetujui
                        </span>
                      )}
                      {item.status === "REJECTED" && (
                        <span className="text-rose-700 block line-clamp-2" title={item.rejectionReason}>
                          Alasan: {item.rejectionReason || "Tidak memenuhi syarat"}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Aksi */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Detail button */}
                      <button
                        type="button"
                        onClick={() => onDetail && onDetail(item)}
                        title="Lihat Detail Pengajuan"
                        className="p-1.5 rounded-lg text-[#6D28D9] hover:bg-[#F5F0FF] transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Admin Approve & Reject */}
                      {role === "admin" && isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove && onApprove(item)}
                            title="Setujui Peminjaman"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject && onReject(item)}
                            title="Tolak Peminjaman"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Student Cancel Pending Request */}
                      {role === "siswa" && isPending && onCancel && (
                        <button
                          type="button"
                          onClick={() => onCancel(item)}
                          title="Batalkan Pengajuan"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
