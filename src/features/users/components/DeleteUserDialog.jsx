"use client";

import React, { useState } from "react";
import { AlertCircle, Trash2, X, Loader2, ShieldAlert, History } from "lucide-react";
import Button from "@/components/ui/Button";

export default function DeleteUserDialog({
  isOpen,
  user,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !user) return null;

  const hasLoansHistory = (user._count?.loans ?? 0) > 0;
  const isSelf = false; // Checked by backend too

  const handleConfirmClick = async () => {
    setErrorMessage("");
    try {
      await onConfirm(user.id);
    } catch (err) {
      setErrorMessage(err.message || "Gagal menghapus pengguna.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <div className="p-1.5 rounded-lg bg-rose-100">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#27233A]">
              Hapus Data Pengguna
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-sm shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-[#27233A] truncate">
                {user.name}
              </h4>
              <p className="text-xs text-[#858095] truncate">
                @{user.username} • {user.role === "ADMIN" ? (user.employeeId || "Admin") : (user.nisn ? `NISN: ${user.nisn}` : "Siswa")}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                user.role === "ADMIN"
                  ? "bg-[#F5F0FF] text-[#6D28D9] border border-[#EBDFFF]"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {user.role}
            </span>
          </div>

          <p className="text-[13px] text-[#4B465C] leading-relaxed">
            Apakah Anda yakin ingin menghapus pengguna{" "}
            <span className="font-bold text-[#27233A]">
              &quot;{user.name}&quot;
            </span>
            ? Tindakan ini akan menghapus akses akun pengguna.
          </p>

          {hasLoansHistory && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5 text-xs">
              <History className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Catatan Riwayat Transaksi</span>
                Pengguna memiliki data transaksi peminjaman. Sistem akan melakukan{" "}
                <span className="font-bold">Penonaktifan Akun (Soft Delete)</span> untuk tetap menjaga keutuhan riwayat perpustakaan.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-gray-50/70 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            Batal
          </Button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-[7px] bg-[#DC2626] text-white hover:bg-rose-700 active:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Pengguna</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
