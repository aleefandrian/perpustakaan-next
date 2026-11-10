"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, BookOpen, Clock, AlertCircle } from "lucide-react";
import Badge from "../ui/Badge";

export default function NotificationButton({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const containerRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "Buku terlambat dikembalikan",
      desc: "Ahmad Fauzi - 'Laskar Pelangi' (Jatuh tempo 2 hari lalu)",
      time: "10 menit lalu",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      id: 2,
      title: "Permintaan Peminjaman Baru",
      desc: "Siti Rahma mengajukan peminjaman 'Bumi Manusia'",
      time: "1 jam lalu",
      icon: BookOpen,
      color: "text-[#6D28D9] bg-[#F5F0FF]",
    },
    {
      id: 3,
      title: "Peringatan Stok Buku",
      desc: "Stok 'Algoritma Pemrograman' tersisa 1 eksemplar",
      time: "3 jam lalu",
      icon: AlertCircle,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifikasi"
        aria-expanded={isOpen}
        className="relative w-[38px] h-[38px] flex items-center justify-center bg-white border border-[#E5E7EB] rounded-[9px] text-[#4B465C] hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20"
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] text-[#27233A]">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <Badge variant="purple" size="xs">
                  {unreadCount} baru
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#6D28D9] hover:underline font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="divide-y divide-[#E5E7EB] max-h-80 overflow-y-auto">
            {notifications.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-3.5 hover:bg-[#F8F9FC] transition-colors cursor-pointer flex items-start gap-3"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${item.color}`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#27233A] leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11.5px] text-[#858095] truncate mt-0.5">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-[#858095] mt-1 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 text-center border-t border-[#E5E7EB] bg-gray-50/50">
            <button
              type="button"
              className="text-xs text-[#6D28D9] font-medium hover:underline"
            >
              Lihat semua notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
