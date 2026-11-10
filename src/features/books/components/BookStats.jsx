import React from "react";
import { BookOpen, Library, BookCheck, AlertTriangle } from "lucide-react";

export function StatCard({ title, value, subtitle, icon: Icon, color, loading = false }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:border-purple-200 hover:shadow-xs transition-all duration-150">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[13px] font-medium text-[#858095] tracking-tight">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#27233A] tracking-tight">
        {loading ? (
          <div className="h-7 w-20 bg-gray-200 animate-pulse rounded" />
        ) : (
          typeof value === "number" ? value.toLocaleString("id-ID") : value
        )}
      </div>
      {subtitle && (
        <p className="text-[11.5px] text-[#858095] mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function BookStats({ stats, loading = false }) {
  const cards = [
    {
      title: "Total Buku",
      value: stats?.totalBooks ?? 0,
      subtitle: "Koleksi buku terdaftar",
      icon: BookOpen,
      color: { bg: "bg-[#F5F0FF]", text: "text-[#6D28D9]" },
    },
    {
      title: "Total Judul",
      value: stats?.totalTitles ?? 0,
      subtitle: "Katalog judul unik",
      icon: Library,
      color: { bg: "bg-blue-50", text: "text-blue-600" },
    },
    {
      title: "Stok Tersedia",
      value: stats?.availableStock ?? 0,
      subtitle: "Eksemplar siap dipinjam",
      icon: BookCheck,
      color: { bg: "bg-emerald-50", text: "text-[#16A34A]" },
    },
    {
      title: "Stok Menipis",
      value: stats?.lowStock ?? 0,
      subtitle: "Stok tersisa ≤ 2 eksemplar",
      icon: AlertTriangle,
      color: { bg: "bg-amber-50", text: "text-[#D97706]" },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <StatCard
          key={idx}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          color={card.color}
          loading={loading}
        />
      ))}
    </div>
  );
}
