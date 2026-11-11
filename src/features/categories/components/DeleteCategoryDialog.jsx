"use client";

import React, { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ShieldAlert, AlertCircle } from "lucide-react";

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
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirmClick}
      title="Hapus Kategori Buku"
      description={`Apakah Anda yakin ingin menghapus kategori "${category.name}"? Tindakan ini tidak dapat dibatalkan.`}
      confirmText="Hapus Kategori"
      cancelText="Batal"
      variant="danger"
      loading={isDeleting}
    >
      <div className="space-y-3 mt-2">
        {hasBooks && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Penghapusan Dicegah</span>
              Kategori ini masih memiliki{" "}
              <span className="font-bold">{category._count.books} buku</span> di dalam katalog. Pindahkan atau hapus buku terlebih dahulu sebelum menghapus kategori ini.
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
