import React from "react";
import { ArrowLeftRight, Clock, AlertTriangle, Coins } from "lucide-react";
import { StatCard } from "@/features/books/components/BookStats";
import { formatRupiah } from "@/utils/borrowingUtils";

export default function BorrowingStats({ stats, loading = false }) {
  const cards = [
    {
      title: "Total Peminjaman Aktif",
      value: stats?.totalActive ?? 0,
      subtitle: "Buku dalam sirkulasi siswa",
      icon: ArrowLeftRight,
      color: { bg: "bg-[#F5F0FF]", text: "text-[#6D28D9]" },
    },
    {
      title: "Belum Terlambat",
      value: stats?.onTime ?? 0,
      subtitle: "Dalam masa tenggang 1 bulan",
      icon: Clock,
      color: { bg: "bg-emerald-50", text: "text-emerald-600" },
    },
    {
      title: "Terlambat",
      value: stats?.overdue ?? 0,
      subtitle: "Melewati batas pengembalian",
      icon: AlertTriangle,
      color: { bg: "bg-rose-50", text: "text-rose-600" },
    },
    {
      title: "Total Estimasi Denda",
      value: formatRupiah(stats?.totalFine || 0),
      subtitle: "Akumulasi keterlambatan",
      icon: Coins,
      color: { bg: "bg-amber-50", text: "text-amber-600" },
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
