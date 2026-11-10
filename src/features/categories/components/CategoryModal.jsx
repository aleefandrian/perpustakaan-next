"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, Loader2, Save } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CategoryModal({
  isOpen,
  category = null,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [prevCategory, setPrevCategory] = useState(category);
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [error, setError] = useState("");

  const isEdit = Boolean(category);

  if (category !== prevCategory) {
    setPrevCategory(category);
    setName(category?.name || "");
    setDescription(category?.description || "");
    setError("");
  }

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Nama kategori maksimal 100 karakter.");
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Gagal menyimpan kategori.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FC]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F5F0FF] text-[#6D28D9]">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#27233A]">
              {isEdit ? "Edit Kategori Buku" : "Tambah Kategori Baru"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="cat-name"
                className="block text-xs font-semibold text-[#27233A] mb-1"
              >
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="Contoh: Sains Populer"
                className="w-full h-9.5 px-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
                autoFocus
              />
              <span className="text-[10px] text-[#858095] mt-1 block">
                Maksimal 100 karakter.
              </span>
            </div>

            <div>
              <label
                htmlFor="cat-desc"
                className="block text-xs font-semibold text-[#27233A] mb-1"
              >
                Deskripsi (Opsional)
              </label>
              <textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan ringkas mengenai kategori ini..."
                className="w-full p-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] resize-none transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 bg-gray-50/70 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-4 text-xs font-semibold rounded-[7px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEdit ? "Simpan Perubahan" : "Tambah Kategori"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
