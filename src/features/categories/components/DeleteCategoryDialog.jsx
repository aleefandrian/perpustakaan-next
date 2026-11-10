"use client";

import React, { useState } from "react";
import { AlertCircle, Trash2, X, Loader2, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";

export default function DeleteCategoryDialog({
  isOpen,
  category,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !category) return null;

  const hasBooks = (category._count?.books ?? 0) > 0;

  const handleConfirmClick = async () => {
    setErrorMessage("");
    try {
      await onConfirm(category.id);
    } catch (err) {
      setErrorMessage(err.message || "Gagal menghapus kategori.");
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
              Hapus Kategori Buku
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
          <p className="text-[13px] text-[#4B465C] leading-relaxed">
            Apakah Anda yakin ingin menghapus kategori{" "}
            <span className="font-bold text-[#27233A]">
              &quot;{category.name}&quot;
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>

          {hasBooks && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Penghapusan Dicegah</span>
                Kategori ini masih memiliki{" "}
                <span className="font-bold">{category._count.books} buku</span> di dalam katalog. Pindahkan atau hapus buku terlebih dahulu sebelum menghapus kategori ini.
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
            disabled={isDeleting || hasBooks}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-[7px] bg-[#DC2626] text-white hover:bg-rose-700 active:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Kategori</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
