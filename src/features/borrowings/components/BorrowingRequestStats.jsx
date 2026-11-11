import React from "react";
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";
import { StatCard } from "@/features/books/components/BookStats";

export default function BorrowingRequestStats({ stats, loading = false }) {
  const cards = [
    {
      title: "Total Pengajuan",
      value: stats?.total ?? 0,
      subtitle: "Seluruh permohonan peminjaman",
      icon: ClipboardList,
      color: { bg: "bg-[#F5F0FF]", text: "text-[#6D28D9]" },
    },
    {
      title: "Menunggu Persetujuan",
      value: stats?.pending ?? 0,
      subtitle: "Perlu ditinjau Administrator",
      icon: Clock,
      color: { bg: "bg-amber-50", text: "text-amber-600" },
    },
    {
      title: "Disetujui",
      value: stats?.approved ?? 0,
      subtitle: "Peminjaman aktif diterbitkan",
      icon: CheckCircle2,
      color: { bg: "bg-emerald-50", text: "text-emerald-600" },
    },
    {
      title: "Ditolak",
      value: stats?.rejected ?? 0,
      subtitle: "Permohonan tidak disetujui",
      icon: XCircle,
      color: { bg: "bg-rose-50", text: "text-rose-600" },
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
