"use client";

import React from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

export default function UserTable({
  users = [],
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
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-[#F8F9FC] text-[11px] font-bold text-[#858095] uppercase tracking-wider border-b border-[#E5E7EB] select-none">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-12">
                No
              </th>
              <th scope="col" className="px-4 py-3 min-w-[200px]">
                Foto & Nama
              </th>
              <th scope="col" className="px-4 py-3 min-w-[120px]">
                Username
              </th>
              <th scope="col" className="px-4 py-3 min-w-[130px]">
                NISN / ID Pegawai
              </th>
              <th scope="col" className="px-4 py-3 text-center min-w-[90px]">
                Kelas
              </th>
              <th scope="col" className="px-4 py-3 min-w-[180px]">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-center min-w-[90px]">
                Role
              </th>
              <th scope="col" className="px-4 py-3 text-center min-w-[90px]">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-center w-24">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] text-sm">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`user-skeleton-${i}`} className="animate-pulse">
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-4 w-5 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-5 w-14 bg-gray-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="h-7 w-16 bg-gray-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((u, idx) => {
                const rowNo = (page - 1) * pageSize + idx + 1;
                const isAdmin = u.role === "ADMIN";
                const isActive = u.status === "ACTIVE";

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-[#F8F9FC]/80 transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-center text-xs text-[#858095] font-medium">
                      {rowNo}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200/60">
                          {u.photo ? (
                            <Image
                              src={u.photo}
                              alt={u.name}
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span>{u.name?.charAt(0)?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-[13.5px] text-[#27233A] block truncate">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-[#858095] block truncate">
                            {u.phone || "No HP belum diatur"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#4B465C] font-mono">
                      @{u.username}
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono text-[#27233A]">
                      {isAdmin ? (
                        u.employeeId || <span className="text-gray-400 italic">-</span>
                      ) : (
                        u.nisn || <span className="text-gray-400 italic">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center text-xs text-[#4B465C]">
                      {isAdmin ? (
                        <span className="text-gray-400 italic">-</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 font-medium text-[11px] text-gray-700">
                          {u.className || "-"}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#4B465C] truncate max-w-[200px]">
                      {u.email}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                          isAdmin
                            ? "bg-[#F5F0FF] text-[#6D28D9] border border-[#EBDFFF]"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(u)}
                          title="Edit Pengguna"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#858095] hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(u)}
                          title="Hapus Pengguna"
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
                <td colSpan={9} className="p-8 text-center">
                  <EmptyState
                    title="Pengguna Tidak Ditemukan"
                    description="Tidak ada data pengguna yang cocok dengan kriteria pencarian dan filter Anda."
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
