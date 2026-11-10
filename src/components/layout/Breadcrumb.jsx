"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const DEFAULT_BREADCRUMBS = [
  { label: "Sistem", href: "#" },
  { label: "Perpustakaan", href: "#" },
  { label: "Manajemen Operasional", href: "#", active: true },
];

const ROUTE_LABELS = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/books": "Daftar Buku",
  "/books/create": "Tambah Buku",
  "/categories": "Kategori Buku",
  "/loans": "Data Peminjaman",
  "/return": "Pengembalian",
  "/users": "Data User",
  "/profile": "Profil",
};

export default function Breadcrumb({ items, className = "" }) {
  const pathname = usePathname();

  // If items prop is provided, use it. Otherwise derive or use standard default.
  let resolvedItems = items;

  if (!resolvedItems || resolvedItems.length === 0) {
    if (pathname && pathname !== "/" && pathname !== "/dashboard") {
      const activeLabel = ROUTE_LABELS[pathname] || "Manajemen Operasional";
      resolvedItems = [
        { label: "Sistem", href: "#" },
        { label: "Perpustakaan", href: "#" },
        { label: activeLabel, active: true },
      ];
    } else {
      resolvedItems = DEFAULT_BREADCRUMBS;
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-[13px] select-none ${className}`}
    >
      <ol className="flex items-center space-x-1.5">
        {resolvedItems.map((item, index) => {
          const isLast = index === resolvedItems.length - 1;
          const isActive = item.active || isLast;

          return (
            <li key={index} className="flex items-center space-x-1.5">
              {index > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-[#858095] shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}

              {isActive ? (
                <span
                  className="text-[#6D28D9] font-semibold tracking-normal"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href && item.href !== "#" ? (
                <Link
                  href={item.href}
                  className="text-[#4B465C] hover:text-[#6D28D9] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#4B465C] transition-colors">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
