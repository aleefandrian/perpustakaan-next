"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FormActions from "@/components/forms/FormActions";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Kategori Buku" : "Tambah Kategori Baru"}
      subtitle="Kelola nama dan deskripsi klasifikasi buku perpustakaan."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <FormField
          id="cat-name"
          label="Nama Kategori"
          required
          hint="Maksimal 100 karakter."
        >
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Contoh: Sains Populer"
            autoFocus
          />
        </FormField>

        <FormField id="cat-desc" label="Deskripsi (Opsional)">
          <Textarea
            id="cat-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Penjelasan ringkas mengenai kategori ini..."
          />
        </FormField>

        <FormActions
          submitText={isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
          cancelText="Batal"
          onCancel={onClose}
          loading={isSubmitting}
        />
      </form>
    </Modal>
  );
}
