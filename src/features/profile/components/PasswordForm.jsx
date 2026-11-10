"use client";

import React, { useState } from "react";
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { changePassword } from "../services/profileService";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Password saat ini wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess(res.message || "Password berhasil diperbarui dengan aman.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-gradient-to-r from-white to-purple-50/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F0FF] text-[#6D28D9] flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#27233A]">Keamanan Akun</h2>
            <p className="text-xs text-[#858095]">
              Perbarui kata sandi untuk melindungi keamanan akses Anda.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#858095] bg-gray-100 px-2.5 py-1 rounded-full">
          Bagian 2/2
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
            Password Saat Ini <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini..."
              className="w-full h-10 px-3.5 pr-10 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858095] hover:text-[#27233A] p-0.5"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
              Password Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full h-10 px-3.5 pr-10 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858095] hover:text-[#27233A] p-0.5"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#27233A] mb-1.5">
              Konfirmasi Password Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full h-10 px-3.5 pr-10 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858095] hover:text-[#27233A] p-0.5"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-2.5 text-xs text-[#4B465C]">
          <ShieldCheck className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
          <p>
            Pastikan password Anda menggunakan kombinasi karakter yang unik dan tidak dibagikan kepada siapa pun untuk melindungi integritas sistem Libra.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 h-10 px-6 text-sm font-semibold rounded-[9px] bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] disabled:opacity-50 transition-all cursor-pointer shadow-xs hover:shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memperbarui Password...</span>
              </>
            ) : (
              <span>Perbarui Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
