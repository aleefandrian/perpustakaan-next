"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookmarkCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Calendar,
  Loader2,
} from "lucide-react";
import BookCover from "@/features/books/components/BookCover";

export default function SiswaDashboardPage() {
  const [student, setStudent] = useState(null);
  const [borrowingData, setBorrowingData] = useState({
    loans: [],
    stats: { total: 0, active: 0, returned: 0, overdue: 0 },
  });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/siswa/borrowings").then((r) => r.json()),
      fetch("/api/books?limit=4").then((r) => r.json()),
    ])
      .then(([meRes, borrowingsRes, booksRes]) => {
        if (!isCancelled) {
          if (meRes?.user) setStudent(meRes.user);
          if (borrowingsRes?.data) {
            setBorrowingData({
              loans: borrowingsRes.data,
              stats: borrowingsRes.stats || {
                total: 0,
                active: 0,
                returned: 0,
                overdue: 0,
              },
            });
          }
          if (booksRes?.data) setFeaturedBooks(booksRes.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#858095]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D28D9]" />
        <span className="text-sm font-medium">Memuat portal siswa...</span>
      </div>
    );
  }

  const activeLoansList = borrowingData.loans.filter(
    (l) => l.status === "ACTIVE" || l.status === "OVERDUE"
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
              <GraduationCap className="w-3.5 h-3.5" /> Portal Siswa Libra
            </span>
            <span className="text-white/80 text-xs">
              NISN: {student?.nisn || "-"} • Kelas {student?.className || "-"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Selamat Datang, {student?.name || "Siswa"}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Jelajahi koleksi buku perpustakaan sekolah dan pantau batas waktu pengembalian buku Anda.
          </p>
        </div>

        <Link
          href="/siswa/books"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#6D28D9] font-semibold text-xs rounded-xl shadow-xs hover:bg-purple-50 transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Katalog Buku</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858095]">
              Sedang Dipinjam
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#27233A]">
            {borrowingData.stats.active}
          </div>
          <p className="text-[11px] text-[#858095] mt-1">Buku dalam pinjaman aktif</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858095]">
              Sudah Dikembalikan
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#27233A]">
            {borrowingData.stats.returned}
          </div>
          <p className="text-[11px] text-[#858095] mt-1">Selesai dikembalikan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858095]">
              Terlambat
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#DC2626]">
            {borrowingData.stats.overdue}
          </div>
          <p className="text-[11px] text-[#858095] mt-1">Perlu segera dikembalikan</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858095]">
              Total Riwayat
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-[#6D28D9]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#27233A]">
            {borrowingData.stats.total}
          </div>
          <p className="text-[11px] text-[#858095] mt-1">Total transaksi peminjaman</p>
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#27233A]">
              Peminjaman Aktif Saya
            </h2>
            <p className="text-xs text-[#858095]">
              Buku perpustakaan yang sedang Anda pinjam saat ini
            </p>
          </div>
          <Link
            href="/siswa/borrowings"
            className="text-xs font-semibold text-[#6D28D9] hover:underline flex items-center gap-1"
          >
            <span>Semua Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeLoansList.length > 0 ? (
          <div className="divide-y divide-[#E5E7EB]">
            {activeLoansList.map((loan) => (
              <div
                key={loan.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                    <BookCover
                      src={loan.book?.coverUrl}
                      alt={loan.book?.title}
                      size="sm"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#27233A]">
                      {loan.book?.title}
                    </h3>
                    <p className="text-xs text-[#858095] mt-0.5">
                      {loan.book?.author} • Rak: {loan.book?.location || "A-1"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#4B465C]">
                      <Calendar className="w-3.5 h-3.5 text-[#858095]" />
                      <span>
                        Dipinjam: {new Date(loan.borrowDate).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      loan.status === "OVERDUE"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-purple-50 text-[#6D28D9] border border-purple-200"
                    }`}
                  >
                    {loan.status === "OVERDUE" ? "Terlambat" : "Sedang Dipinjam"}
                  </span>
                  <span className="text-xs text-[#858095]">
                    Tenggat:{" "}
                    <strong className="text-[#27233A]">
                      {new Date(loan.dueDate).toLocaleDateString("id-ID")}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[#858095]">
            <BookmarkCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-[#27233A]">
              Tidak Ada Pinjaman Aktif
            </p>
            <p className="text-xs text-[#858095] mt-1 max-w-sm mx-auto">
              Anda sedang tidak memiliki buku yang dipinjam. Temukan buku bacaan menarik di katalog perpustakaan!
            </p>
          </div>
        )}
      </div>

      {/* Featured Books Recommendations */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
          <div>
            <h2 className="font-bold text-base text-[#27233A]">
              Koleksi Buku Rekomendasi
            </h2>
            <p className="text-xs text-[#858095]">
              Buku-buku terbaru yang tersedia untuk dipinjam
            </p>
          </div>
          <Link
            href="/siswa/books"
            className="text-xs font-semibold text-[#6D28D9] hover:underline flex items-center gap-1"
          >
            <span>Buka Katalog Lengkap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredBooks.map((b) => (
            <div
              key={b.id}
              className="flex gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-purple-200 hover:bg-[#F8F9FC]/60 transition-all"
            >
              <BookCover src={b.coverUrl} alt={b.title} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-[#27233A] truncate">
                  {b.title}
                </h3>
                <p className="text-[11px] text-[#858095] truncate mt-0.5">
                  {b.author}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] font-medium text-[#6D28D9] bg-[#F5F0FF] px-1.5 py-0.5 rounded truncate max-w-[80px]">
                    {b.category?.name || "Umum"}
                  </span>
                  <span className="text-[11px] font-semibold text-[#16A34A] font-mono">
                    Stok: {b.availableStock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
