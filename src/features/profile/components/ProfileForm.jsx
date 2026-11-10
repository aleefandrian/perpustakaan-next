"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Trash2,
  Lock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  GraduationCap,
  Briefcase,
} from "lucide-react";

export default function ProfileForm({ user, onProfileUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [photo, setPhoto] = useState(user?.photo || "");

  const [photoInputOpen, setPhotoInputOpen] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const handleOpenPhotoInput = () => {
    setPhotoInputUrl(photo || "");
    setPhotoInputOpen(true);
  };

  const handleApplyPhotoUrl = () => {
    setPhoto(photoInputUrl.trim());
    setPhotoInputOpen(false);
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setPhotoInputUrl("");
    setPhotoInputOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await onProfileUpdated({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        photo: photo.trim() || null,
      });
      setSuccess("Profil Anda berhasil diperbarui.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-gradient-to-r from-white to-purple-50/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F0FF] text-[#6D28D9] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#27233A]">Informasi Profil</h2>
            <p className="text-xs text-[#858095]">
              Kelola detail identitas akun resmi perpustakaan.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#858095] bg-gray-100 px-2.5 py-1 rounded-full">
          Bagian 1/2
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-2xl border-2 border-purple-200 shadow-xs">
              {photo ? (
                <Image
                  src={photo}
                  alt={name || "Avatar"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span>{name?.charAt(0)?.toUpperCase() || "U"}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenPhotoInput}
              title="Ganti Foto"
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-[#6D28D9] text-white shadow-md hover:bg-[#5B21B6] transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-semibold text-[#27233A]">Foto Profil</h4>
              <p className="text-xs text-[#858095]">
                Gunakan URL gambar publik atau biarkan kosong untuk menggunakan inisial otomatis.
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenPhotoInput}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white text-[#4B465C] hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
              >
                Ganti Foto URL
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photo URL Input Modal / Popdown */}
        {photoInputOpen && (
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2.5 animate-in fade-in duration-150">
            <label className="block text-xs font-semibold text-[#27233A]">
              URL Foto Baru:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={photoInputUrl}
                onChange={(e) => setPhotoInputUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 h-9 px-3 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#27233A] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9]"
              />
              <button
                type="button"
                onClick={handleApplyPhotoUrl}
                className="px-3 h-9 text-xs font-semibold rounded-lg bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-colors cursor-pointer"
              >
                Terapkan
              </button>
              <button
                type="button"
                onClick={() => setPhotoInputOpen(false)}
                className="px-3 h-9 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white text-[#4B465C] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Grid of Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full h-10 px-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#858095] font-mono">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="username"
                className="w-full h-10 pl-8 pr-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#858095] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="nama@email.com"
                className="w-full h-10 pl-10 pr-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
              />
            </div>
          </div>

          {/* Telepon */}
          <div>
            <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
              Nomor Telepon
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#858095] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full h-10 pl-10 pr-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
            Alamat Domisili
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#858095] absolute left-3.5 top-3 pointer-events-none" />
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap tempat tinggal..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all resize-none"
            />
          </div>
        </div>

        {/* Read-Only Identity Section */}
        <div className="pt-4 border-t border-[#E5E7EB]">
          <h4 className="text-xs font-bold text-[#858095] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Kredensial & Atribut Terkunci</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            {/* Role */}
            <div>
              <span className="text-[11px] text-[#858095] block mb-1">Role Akun</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAdmin
                    ? "bg-[#F5F0FF] text-[#6D28D9] border border-[#EBDFFF]"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {user?.role}
              </span>
            </div>

            {/* NISN or ID Pegawai */}
            <div>
              <span className="text-[11px] text-[#858095] block mb-1">
                {isAdmin ? "ID Pegawai" : "NISN"}
              </span>
              <span className="text-xs font-mono font-medium text-[#27233A]">
                {isAdmin ? (user?.employeeId || "-") : (user?.nisn || "-")}
              </span>
            </div>

            {/* Kelas (if SISWA) or Role Description */}
            <div>
              <span className="text-[11px] text-[#858095] block mb-1">
                {isAdmin ? "Hak Akses" : "Kelas"}
              </span>
              <span className="text-xs font-semibold text-[#27233A]">
                {isAdmin ? "Administrator Penuh" : (user?.className || "-")}
              </span>
            </div>

            {/* Registration Date */}
            <div>
              <span className="text-[11px] text-[#858095] block mb-1">Terdaftar Sejak</span>
              <span className="text-xs text-[#4B465C] flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3 text-[#858095]" />
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 h-10 px-6 text-sm font-semibold rounded-[9px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] disabled:opacity-50 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
