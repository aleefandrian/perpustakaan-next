"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, BadgeCheck, X } from "lucide-react";
import SidebarMenu from "./SidebarMenu";
import Badge from "../ui/Badge";

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  className = "",
}) {
  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup Menu"
          onClick={onCloseMobile}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onCloseMobile();
            }
          }}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden transition-opacity duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 h-screen bg-white border-r border-[#E5E7EB] z-50 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-[255px]"
        } ${
          // On mobile (<1024px or <768px): slide in drawer if mobileOpen, else -translate-x-full
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${className}`}
        aria-label="Sidebar"
      >
        {/* Top: Sidebar Header / Brand */}
        <div
          className={`h-[65px] border-b border-[#E5E7EB] flex items-center shrink-0 ${
            collapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
            title="Libra - Bintang Harapan"
          >
            {/* Logo Box with Gradient */}
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20 group-hover:scale-[1.02] transition-transform">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>

            {/* Brand Titles */}
            {!collapsed && (
              <div className="flex flex-col text-left">
                <span className="font-bold text-[17px] text-[#27233A] leading-tight tracking-tight">
                  Libra
                </span>
                <span className="text-[11.5px] font-medium text-[#858095] leading-tight">
                  Bintang Harapan
                </span>
              </div>
            )}
          </Link>

          {/* Close button for mobile drawer */}
          {!collapsed && mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#858095] hover:text-[#27233A] hover:bg-gray-100 transition-colors"
              aria-label="Tutup sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Middle: Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin scrollbar-thumb-gray-200">
          <SidebarMenu
            collapsed={collapsed}
            onItemClick={() => {
              if (mobileOpen && onCloseMobile) {
                onCloseMobile();
              }
            }}
          />
        </div>

        {/* Bottom: Sidebar Footer */}
        <div
          className={`border-t border-[#E5E7EB] p-3.5 bg-white shrink-0 ${
            collapsed ? "px-2.5" : "px-3.5"
          }`}
        >
          {!collapsed ? (
            <div className="bg-[#F0F4FF] rounded-[12px] p-3 flex items-center justify-between border border-[#E0EAFF]">
              <div className="flex items-center gap-2">
                <BadgeCheck
                  className="w-5 h-5 text-[#6D28D9] shrink-0"
                  strokeWidth={2}
                />
                <span className="font-bold text-[13px] text-[#27233A] tracking-tight">
                  v2.4 Pro
                </span>
              </div>
              <Badge variant="success" size="sm">
                Online
              </Badge>
            </div>
          ) : (
            <div
              className="bg-[#F0F4FF] rounded-[10px] p-2 flex flex-col items-center justify-center border border-[#E0EAFF]"
              title="v2.4 Pro (Online)"
            >
              <BadgeCheck
                className="w-5 h-5 text-[#6D28D9]"
                strokeWidth={2}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
