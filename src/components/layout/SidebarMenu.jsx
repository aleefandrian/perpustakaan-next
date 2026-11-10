"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  ArrowLeftRight,
  CircleCheck,
  Users,
  UserRoundCog,
} from "lucide-react";

export const MENU_GROUPS = [
  {
    group: "MAIN MENU",
    items: [
      {
        label: "Dashboard",
        href: "/",
        alternateHrefs: ["/dashboard"],
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "MANAJEMEN PERPUSTAKAAN",
    items: [
      {
        label: "Data Buku",
        href: "/books",
        matchPrefix: true,
        excludePrefixes: ["/books/categories"],
        icon: BookOpen,
      },
      {
        label: "Kategori Buku",
        href: "/categories",
        alternateHrefs: ["/books/categories"],
        matchPrefix: true,
        icon: Tag,
      },
      {
        label: "Data Peminjaman",
        href: "/loans",
        matchPrefix: true,
        icon: ArrowLeftRight,
      },
      {
        label: "Pengembalian",
        href: "/return",
        matchPrefix: true,
        icon: CircleCheck,
      },
    ],
  },
  {
    group: "MANAJEMEN PENGGUNA",
    items: [
      {
        label: "Data User",
        href: "/users",
        matchPrefix: true,
        icon: Users,
      },
    ],
  },
  {
    group: "PENGATURAN",
    items: [
      {
        label: "Profil",
        href: "/profile",
        matchPrefix: true,
        icon: UserRoundCog,
      },
    ],
  },
];

export default function SidebarMenu({
  collapsed = false,
  onItemClick,
  className = "",
}) {
  const pathname = usePathname();

  const isItemActive = (item) => {
    if (!pathname) return item.href === "/";

    // Direct match
    if (pathname === item.href) return true;

    // Alternate matches
    if (item.alternateHrefs && item.alternateHrefs.includes(pathname)) {
      return true;
    }

    // Prefix match
    if (item.matchPrefix && item.href !== "/") {
      if (
        item.excludePrefixes &&
        item.excludePrefixes.some((prefix) => pathname.startsWith(prefix))
      ) {
        return false;
      }
      return pathname.startsWith(item.href);
    }

    // Default dashboard active if on root
    if (item.href === "/" && (pathname === "/" || pathname === "/dashboard")) {
      return true;
    }

    return false;
  };

  return (
    <nav className={`flex flex-col space-y-4 ${className}`} aria-label="Sidebar Navigation">
      {MENU_GROUPS.map((group, groupIdx) => (
        <div key={groupIdx} className="flex flex-col">
          {/* Group Header */}
          {!collapsed ? (
            <div className="px-3 pt-2 pb-2 text-[11px] font-bold tracking-wider text-[#858095] uppercase select-none">
              {group.group}
            </div>
          ) : (
            groupIdx > 0 && (
              <div className="my-2 border-t border-[#E5E7EB]/60 mx-2" />
            )
          )}

          {/* Menu Items */}
          <ul className="space-y-1">
            {group.items.map((item, itemIdx) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              return (
                <li key={itemIdx}>
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-[9px] text-[14px] transition-colors duration-150 select-none group ${
                      collapsed
                        ? "justify-center p-2.5"
                        : "gap-[10px] px-3.5 py-2.5"
                    } ${
                      active
                        ? "bg-[#EBDFFF] text-[#6D28D9] font-semibold"
                        : "text-[#4B465C] font-normal hover:bg-[#F5F0FF] hover:text-[#6D28D9]"
                    }`}
                  >
                    <Icon
                      className={`w-[19px] h-[19px] shrink-0 transition-colors ${
                        active
                          ? "text-[#6D28D9]"
                          : "text-[#4B465C] group-hover:text-[#6D28D9]"
                      }`}
                      strokeWidth={active ? 2.2 : 1.8}
                    />

                    {!collapsed && (
                      <span className="truncate leading-none">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
