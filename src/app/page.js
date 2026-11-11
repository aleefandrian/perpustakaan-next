import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import prisma from "@/lib/prisma";
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  CircleCheck,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import BookCover from "@/features/books/components/BookCover";

export const instant = false;

export default async function Home() {
  const [totalBooks, activeLoans, totalCategories, recentLoans, recentBooks] =
    await Promise.all([
      prisma.book.count(),
      prisma.borrowing.count({ where: { status: "ACTIVE" } }),
      prisma.category.count(),
      prisma.borrowing.findMany({
        take: 5,
        orderBy: { borrowedAt: "desc" },
        include: { book: true, user: true },
      }),
      prisma.book.findMany({
        take: 4,
        orderBy: { id: "desc" },
        include: { category: true },
      }),
    ]);

  const stats = [
    {
      label: "Total Buku",
      value: totalBooks.toLocaleString("id-ID"),
      change: `${totalCategories} kategori katalog`,
      icon: BookOpen,
      color: "bg-[#F5F0FF] text-[#6D28D9]",
    },
    {
      label: "Peminjaman Aktif",
      value: activeLoans.toLocaleString("id-ID"),
      change: "Sirkulasi operasional",
      icon: ArrowLeftRight,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Koleksi Baru",
      value: recentBooks.length,
      change: "Koleksi terverifikasi",
      icon: CircleCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Kategori Perpustakaan",
      value: totalCategories,
      change: "Klasifikasi subjek aktif",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" /> Libra v2.4 Pro
              </span>
              <span className="text-white/80 text-xs">Tahun Ajaran 2026/2027</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Selamat Datang di Libra Admin
            </h1>
            <p className="text-purple-100 text-sm mt-1 max-w-xl">
              Sistem Manajemen Perpustakaan Sekolah Bintang Harapan. Kelola {totalBooks} koleksi buku nyata dan peminjaman secara terintegrasi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#6D28D9] font-semibold text-xs rounded-xl shadow-xs hover:bg-purple-50 transition-colors"
            >
              <span>Buka Daftar Buku</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-[#858095]">
                    {item.label}
                  </span>
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#27233A] tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs text-[#858095] mt-1 flex items-center gap-1">
                  <span>{item.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlights: Recent Books Grid */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
            <div>
              <h2 className="font-bold text-base text-[#27233A]">
                Koleksi Buku Terbaru
              </h2>
              <p className="text-xs text-[#858095]">
                Daftar buku Open Library yang baru ditambahkan ke katalog
              </p>
            </div>
            <Link
              href="/books"
              className="text-xs font-semibold text-[#6D28D9] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua ({totalBooks})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentBooks.map((b) => (
              <Link
                key={b.id}
                href={`/books/${b.id}`}
                className="group flex gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-purple-200 hover:bg-[#F8F9FC]/60 transition-all"
              >
                <BookCover src={b.coverUrl} alt={b.title} size="sm" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-[#27233A] group-hover:text-[#6D28D9] transition-colors truncate">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-[#858095] truncate mt-0.5">
                    {b.author}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-medium text-[#6D28D9] bg-[#F5F0FF] px-1.5 py-0.5 rounded">
                      {b.category?.name || "Umum"}
                    </span>
                    <span className="text-[11px] font-semibold text-[#16A34A] font-mono">
                      Stok: {b.availableStock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-[#27233A]">
                Sirkulasi & Peminjaman Terbaru
              </h2>
              <p className="text-xs text-[#858095] mt-0.5">
                Aktivitas transaksi peminjaman buku perpustakaan
              </p>
            </div>
            <Badge variant="purple" size="sm">
              Operasional Aktif
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold text-[#858095] uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3.5">ID Transaksi</th>
                  <th className="px-5 py-3.5">Peminjam</th>
                  <th className="px-5 py-3.5">Judul Buku</th>
                  <th className="px-5 py-3.5">Tenggat Waktu</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
                {recentLoans.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#4B465C]">
                      TRX-2026-00{trx.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#27233A]">{trx.user?.name || trx.borrower || "Siswa"}</div>
                      <div className="text-[11px] text-[#858095]">{trx.user?.className ? `Kelas ${trx.user.className}` : (trx.role || "Siswa")}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[#4B465C]">
                      {trx.book?.title || "Buku"}
                    </td>
                    <td className="px-5 py-3.5 text-[#858095] text-xs">
                      {new Date(trx.dueDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge
                        variant={
                          trx.status === "ACTIVE"
                            ? "purple"
                            : trx.status === "OVERDUE"
                            ? "danger"
                            : "success"
                        }
                        size="sm"
                      >
                        {trx.status === "ACTIVE"
                          ? "Dipinjam"
                          : trx.status === "OVERDUE"
                          ? "Terlambat"
                          : "Kembali"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
