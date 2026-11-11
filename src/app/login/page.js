"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!identifier.trim() || !password) {
      setError("Username/email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          rememberMe,
          callbackUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Kredensial login tidak valid.");
      }

      // Successful login -> redirect by role
      const destination = data.redirectUrl || (data.user?.role === "ADMIN" ? "/" : "/siswa/dashboard");
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err.message || "Gagal masuk ke sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setInfoMessage("Untuk pemulihan kata sandi akun, silakan hubungi Administrator Perpustakaan Bintang Harapan.");
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FC]">
      {/* LEFT COLUMN: Visual Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#4C1D95] via-[#5B21B6] to-[#1E40AF] p-12 text-white flex-col justify-between overflow-hidden">
        {/* Subtle decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Ambient lighting blur circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">
                  Libra
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/20 backdrop-blur-xs text-white uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-purple-200">Library Management Suite</p>
            </div>
          </div>

          
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg my-auto py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-100 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Platform Akreditasi Perpustakaan Nasional</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Sistem Manajemen Perpustakaan Modern & Terpadu
          </h1>

          <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed">
            Kelola ribuan koleksi buku, sirkulasi peminjaman, dan keanggotaan perpustakaan secara efisien dalam satu platform terintegrasi.
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-xs text-purple-200/80">
          © 2026 Libra Library Management System. Seluruh hak cipta dilindungi.
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E5E7EB] shadow-xl">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 pb-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-[#27233A]">Libra</span>
              <p className="text-xs text-[#858095]">Bintang Harapan</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#27233A]">
              Masuk ke Akun Anda
            </h2>
            <p className="text-[13px] text-[#858095]">
              Silakan masukkan kredensial akun perpustakaan untuk melanjutkan.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-[#6D28D9] text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{infoMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-[#27233A] mb-1.5"
              >
                Alamat Email / Username / NISN
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username atau NISN siswa"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[10px] text-[13.5px] text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#27233A] mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-11 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[10px] text-[13.5px] text-[#27233A] placeholder-[#858095] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#858095] hover:text-[#27233A] transition-colors rounded"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#4B465C] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D28D9] focus:ring-[#6D28D9]/30 cursor-pointer"
                />
                <span>Ingat saya selama 30 hari</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#6D28D9] hover:underline font-semibold transition-colors cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 text-sm font-semibold rounded-[10px] bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] text-white hover:from-[#5B21B6] hover:to-[#4338CA] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="bg-white px-3 text-[#858095]">Autentikasi Aman</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-center gap-2 text-[11px] text-[#6D28D9]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Dilindungi oleh enkripsi SSL 256-bit & 2FA Perpustakaan.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6D28D9]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
