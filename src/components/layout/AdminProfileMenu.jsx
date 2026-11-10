"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound, ChevronDown, User, Settings, LogOut, ShieldCheck } from "lucide-react";

export default function AdminProfileMenu({
  adminName = "Admin Perpustakaan",
  adminRole = "Administrator Sekolah Bintang Harapan",
  onLogout,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState({ name: adminName, role: adminRole });
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setProfile({
            name: data.user.name || adminName,
            role:
              data.user.role === "ADMIN"
                ? "Administrator Sekolah Bintang Harapan"
                : data.user.className
                ? `Siswa - ${data.user.className}`
                : "Siswa Perpustakaan",
          });
        }
      })
      .catch(() => {});
  }, [adminName, adminRole]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleLogoutClick = async () => {
    setIsOpen(false);
    if (onLogout) {
      await onLogout();
    } else {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (err) {
        console.error("Logout request error:", err);
      }
      router.push("/logout");
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 p-1 -mr-1 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 transition-colors group cursor-pointer"
      >
        {/* Purple Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#6D28D9] flex items-center justify-center text-white shrink-0 shadow-xs ring-2 ring-purple-100">
          <UserRound className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
        </div>

        {/* Text Details (Hidden on small mobile screens if space is tight) */}
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-[13px] font-semibold text-[#27233A] group-hover:text-[#6D28D9] transition-colors">
            {profile.name}
          </span>
          <span className="text-[11px] text-[#858095]">
            {profile.role}
          </span>
        </div>

        {/* ChevronDown */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#858095] group-hover:text-[#4B465C] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#6D28D9]" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header on mobile */}
          <div className="px-3.5 py-2.5 border-b border-[#E5E7EB] sm:hidden">
            <p className="text-[13px] font-semibold text-[#27233A] truncate">
              {profile.name}
            </p>
            <p className="text-[11px] text-[#858095] truncate">
              {profile.role}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#4B465C] hover:bg-[#F5F0FF] hover:text-[#6D28D9] transition-colors"
            >
              <User className="w-4 h-4 text-[#858095]" strokeWidth={1.8} />
              <span>Profil Saya</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#4B465C] hover:bg-[#F5F0FF] hover:text-[#6D28D9] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#858095]" strokeWidth={1.8} />
              <span>Pengaturan</span>
            </Link>
          </div>

          <div className="border-t border-[#E5E7EB] my-1" />

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" strokeWidth={1.8} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
