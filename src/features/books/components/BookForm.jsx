"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import BookCover from "./BookCover";
import Button from "@/components/ui/Button";
import { validateBookInput } from "../schemas/bookSchema";
import { fetchCategories } from "../services/bookService";

const DEFAULT_YEAR = 2026;

export default function BookForm({
  initialData = null,
  isEdit = false,
  onSubmit,
}) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    author: initialData?.author || "",
    isbn: initialData?.isbn || "",
    publisher: initialData?.publisher || "",
    publishedYear: initialData?.publishedYear || DEFAULT_YEAR,
    genre: initialData?.genre || "",
    categoryId: initialData?.categoryId || "",
    description: initialData?.description || "",
    location: initialData?.location || "Rak A-1",
    totalStock: initialData?.totalStock ?? 5,
    availableStock: initialData?.availableStock ?? 5,
    coverUrl: initialData?.coverUrl || "",
    coverId: initialData?.coverId || "",
  });

  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.success) {
          setCategories(res.data);
          if (!isEdit && res.data.length > 0) {
            setFormData((prev) =>
              prev.categoryId ? prev : { ...prev, categoryId: res.data[0].id }
            );
          }
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, [isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto sync availableStock if totalStock is modified and available was equal
    if (name === "totalStock" && !isEdit) {
      setFormData((prev) => ({
        ...prev,
        totalStock: value,
        availableStock: value,
      }));
    }

    // Clear inline field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const { isValid, errors } = validateBookInput(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      router.push("/books");
      router.refresh();
    } catch (err) {
      setSubmitError(err.message || "Gagal menyimpan data buku.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <Link
            href="/books"
            className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#E5E7EB] bg-white text-[#4B465C] hover:bg-gray-50 transition-colors"
            title="Kembali ke Daftar Buku"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#27233A]">
              {isEdit ? "Edit Informasi Buku" : "Tambah Buku Baru"}
            </h1>
            <p className="text-xs text-[#858095]">
              {isEdit
                ? `Perbarui informasi dan inventaris buku #${initialData?.id}`
                : "Tambahkan buku baru ke dalam katalog perpustakaan Libra."}
            </p>
          </div>
        </div>

        <Link
          href="/books"
          className="text-xs text-[#858095] hover:text-[#6D28D9] font-medium"
        >
          Batal & Kembali
        </Link>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Gagal Menyimpan</span>
            {submitError}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Cover Image & Preview */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#27233A] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6D28D9]" />
                <span>Sampul Buku</span>
              </h2>

              <div className="flex flex-col items-center justify-center p-3 bg-[#F8F9FC] rounded-xl border border-dashed border-[#E5E7EB]">
                <BookCover
                  src={formData.coverUrl}
                  alt={formData.title || "Preview Sampul"}
                  size="lg"
                  className="shadow-sm"
                />
                <span className="text-[11px] text-[#858095] mt-3 text-center">
                  Pratinjau sampul buku real-time
                </span>
              </div>

              <div>
                <label
                  htmlFor="coverUrl"
                  className="block text-xs font-semibold text-[#27233A] mb-1.5"
                >
                  URL Gambar Sampul <span className="text-rose-500">*</span>
                </label>
                <input
                  id="coverUrl"
                  type="url"
                  name="coverUrl"
                  value={formData.coverUrl}
                  onChange={handleChange}
                  placeholder="https://covers.openlibrary.org/b/id/..."
                  className={`w-full h-9 px-3 bg-[#F8F9FC] border rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] transition-all ${
                    formErrors.coverUrl ? "border-rose-400" : "border-[#E5E7EB]"
                  }`}
                />
                {formErrors.coverUrl && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {formErrors.coverUrl}
                  </p>
                )}
                <p className="text-[10.5px] text-[#858095] mt-1.5 leading-normal">
                  Gunakan URL publik Open Library atau direct image link (.jpg/.png).
                </p>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#27233A] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6D28D9]" />
                <span>Inventaris Stok</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="totalStock"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Stok Total <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="totalStock"
                    type="number"
                    min="0"
                    name="totalStock"
                    value={formData.totalStock}
                    onChange={handleChange}
                    className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                  />
                  {formErrors.totalStock && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {formErrors.totalStock}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="availableStock"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Tersedia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="availableStock"
                    type="number"
                    min="0"
                    max={formData.totalStock}
                    name="availableStock"
                    value={formData.availableStock}
                    onChange={handleChange}
                    className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                  />
                  {formErrors.availableStock && (
                    <p className="text-[10px] text-rose-600 mt-0.5">
                      {formErrors.availableStock}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Lokasi Rak
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Contoh: Rak A-1"
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Fields */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#27233A] pb-2 border-b border-[#E5E7EB]">
                Informasi Bibliografi Buku
              </h2>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Judul Buku <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Masukkan judul buku..."
                  className={`w-full h-9.5 px-3.5 bg-[#F8F9FC] border rounded-lg text-xs font-medium text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] ${
                    formErrors.title ? "border-rose-400" : "border-[#E5E7EB]"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label
                  htmlFor="subtitle"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Subjudul (Opsional)
                </label>
                <input
                  id="subtitle"
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Subjudul atau keterangan tambahan..."
                  className="w-full h-9 px-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>

              {/* Author & ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="author"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Pengarang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="author"
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Nama penulis/pengarang..."
                    className={`w-full h-9 px-3 bg-[#F8F9FC] border rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] ${
                      formErrors.author ? "border-rose-400" : "border-[#E5E7EB]"
                    }`}
                  />
                  {formErrors.author && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors.author}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="isbn"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    ISBN (ISBN-10 atau ISBN-13)
                  </label>
                  <input
                    id="isbn"
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    placeholder="Contoh: 978-0-123456-78-9"
                    className={`w-full h-9 px-3 bg-[#F8F9FC] border rounded-lg text-xs font-mono text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] ${
                      formErrors.isbn ? "border-rose-400" : "border-[#E5E7EB]"
                    }`}
                  />
                  {formErrors.isbn && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors.isbn}
                    </p>
                  )}
                </div>
              </div>

              {/* Category & Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Kategori Perpustakaan
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] cursor-pointer"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="genre"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Genre / Topik
                  </label>
                  <input
                    id="genre"
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    placeholder="Contoh: Classic Fiction, Drama"
                    className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                  />
                </div>
              </div>

              {/* Publisher & Published Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="publisher"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Penerbit
                  </label>
                  <input
                    id="publisher"
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    placeholder="Nama penerbit..."
                    className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="publishedYear"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Tahun Terbit
                  </label>
                  <input
                    id="publishedYear"
                    type="number"
                    min="1400"
                    max={DEFAULT_YEAR + 1}
                    name="publishedYear"
                    value={formData.publishedYear}
                    onChange={handleChange}
                    placeholder="Contoh: 2024"
                    className={`w-full h-9 px-3 bg-[#F8F9FC] border rounded-lg text-xs font-mono text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] ${
                      formErrors.publishedYear
                        ? "border-rose-400"
                        : "border-[#E5E7EB]"
                    }`}
                  />
                  {formErrors.publishedYear && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors.publishedYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Sinopsis / Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tuliskan deskripsi ringkas atau sinopsis buku..."
                  className="w-full p-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] resize-y"
                />
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push("/books")}
                disabled={isSubmitting}
                className="text-xs"
              >
                Batal
              </Button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 h-9 px-5 text-xs font-semibold rounded-[9px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEdit ? "Simpan Perubahan" : "Simpan Buku"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
