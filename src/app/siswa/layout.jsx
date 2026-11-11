"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  BookmarkCheck,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

export default function SiswaLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setStudent(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/siswa/dashboard", icon: LayoutDashboard },
    { label: "Katalog Buku", href: "/siswa/books", icon: BookOpen },
    {
      label: "Pengajuan Peminjaman",
      href: "/siswa/pengajuan-peminjaman",
      icon: ClipboardList,
    },
    {
      label: "Peminjaman Saya",
      href: "/siswa/peminjaman",
      alternateHrefs: ["/siswa/borrowings"],
      icon: BookmarkCheck,
    },
    { label: "Profil Saya", href: "/siswa/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/siswa/dashboard"
              className="flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[16px] text-[#27233A]">Libra</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    SISWA
                  </span>
                </div>
                <span className="text-[11px] text-[#858095]">Bintang Harapan</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.alternateHrefs && item.alternateHrefs.includes(pathname));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                    active
                      ? "bg-[#EBDFFF] text-[#6D28D9] font-semibold"
                      : "text-[#4B465C] hover:bg-gray-100 hover:text-[#27233A]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Student Profile Info & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {student?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-semibold text-[#27233A] block truncate max-w-[130px]">
                  {student?.name || "Siswa"}
                </span>
                <span className="text-[10px] text-[#858095] block">
                  {student?.className ? `Kelas ${student.className}` : "Siswa"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari akun"
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#4B465C] hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.alternateHrefs && item.alternateHrefs.includes(pathname));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-[#EBDFFF] text-[#6D28D9] font-semibold"
                      : "text-[#4B465C] hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-[#27233A]">
                {student?.name} ({student?.className || "Siswa"})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-4 text-center text-xs text-[#858095]">
        © 2026 Libra Bintang Harapan • Portal Siswa Perpustakaan
      </footer>
    </div>
  );
}
