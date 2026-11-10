"use client";

import React, { useState, useEffect } from "react";
import { X, User, Loader2, Save, ShieldCheck, GraduationCap } from "lucide-react";
import Button from "@/components/ui/Button";

const AVAILABLE_CLASSES = ["X-A", "X-B", "XI-A", "XI-B", "XII-A", "XII-B"];

export default function UserModal({
  isOpen,
  user = null,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const isEdit = Boolean(user);

  const [prevUser, setPrevUser] = useState(user);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "SISWA",
    status: user?.status || "ACTIVE",
    nisn: user?.nisn || "",
    employeeId: user?.employeeId || "",
    className: user?.className || "X-A",
    phone: user?.phone || "",
    address: user?.address || "",
    photo: user?.photo || "",
  });

  const [error, setError] = useState("");

  if (user !== prevUser) {
    setPrevUser(user);
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "SISWA",
      status: user?.status || "ACTIVE",
      nisn: user?.nisn || "",
      employeeId: user?.employeeId || "",
      className: user?.className || "X-A",
      phone: user?.phone || "",
      address: user?.address || "",
      photo: user?.photo || "",
    });
    setError("");
  }

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Alamat email tidak valid.");
      return;
    }

    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      setError("Password minimal 6 karakter untuk akun baru.");
      return;
    }

    if (isEdit && formData.password && formData.password.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (formData.role === "SISWA" && !formData.className) {
      setError("Kelas wajib dipilih untuk role Siswa.");
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Gagal menyimpan data pengguna.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FC]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F5F0FF] text-[#6D28D9]">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#27233A]">
              {isEdit ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
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
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Role & Status */}
            <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-[#F8F9FC] rounded-xl border border-[#E5E7EB]">
              <div>
                <label
                  htmlFor="user-role"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Role Pengguna <span className="text-rose-500">*</span>
                </label>
                <select
                  id="user-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#27233A] focus:outline-none focus:ring-1 focus:ring-[#6D28D9] cursor-pointer"
                >
                  <option value="SISWA">SISWA (Siswa Sekolah)</option>
                  <option value="ADMIN">ADMIN (Pengelola)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="user-status"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Status Akun <span className="text-rose-500">*</span>
                </label>
                <select
                  id="user-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#27233A] focus:outline-none focus:ring-1 focus:ring-[#6D28D9] cursor-pointer"
                >
                  <option value="ACTIVE">Aktif (Bisa Pinjam)</option>
                  <option value="INACTIVE">Nonaktif (Dibekukan)</option>
                </select>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="user-name"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap pengguna..."
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>

              <div>
                <label
                  htmlFor="user-username"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username_pengguna"
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs font-mono text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="user-email"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@libra.local"
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>

              <div>
                <label
                  htmlFor="user-password"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  {isEdit ? "Password Baru (Opsional)" : "Password"}{" "}
                  {!isEdit && <span className="text-rose-500">*</span>}
                </label>
                <input
                  id="user-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>
            </div>

            {/* Dynamic Role-specific Fields */}
            {formData.role === "SISWA" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div>
                  <label
                    htmlFor="user-nisn"
                    className="block text-xs font-semibold text-[#27233A] mb-1 flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>NISN (10 Digit)</span>
                  </label>
                  <input
                    id="user-nisn"
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleChange}
                    placeholder="Contoh: 0081234567"
                    maxLength={10}
                    className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-mono text-[#27233A] focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="user-class"
                    className="block text-xs font-semibold text-[#27233A] mb-1"
                  >
                    Kelas Siswa <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="user-class"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#27233A] focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
                <label
                  htmlFor="user-empid"
                  className="block text-xs font-semibold text-[#27233A] mb-1 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6D28D9]" />
                  <span>ID Pegawai / NIP</span>
                </label>
                <input
                  id="user-empid"
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Contoh: ADM001 atau NIP-1988..."
                  className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-mono text-[#27233A] focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>
            )}

            {/* Additional Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="user-phone"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  Nomor Telepon
                </label>
                <input
                  id="user-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>

              <div>
                <label
                  htmlFor="user-photo"
                  className="block text-xs font-semibold text-[#27233A] mb-1"
                >
                  URL Foto Profil (Opsional)
                </label>
                <input
                  id="user-photo"
                  type="url"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full h-9 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="user-address"
                className="block text-xs font-semibold text-[#27233A] mb-1"
              >
                Alamat Rumah (Opsional)
              </label>
              <textarea
                id="user-address"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat domisili pengguna..."
                className="w-full p-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
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
                  <span>{isEdit ? "Simpan Perubahan" : "Tambah User"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
