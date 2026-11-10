import React from "react";
import { Tag, BookCheck, FolderMinus } from "lucide-react";
import { StatCard } from "@/features/books/components/BookStats";

export default function CategoryStats({ stats, loading = false }) {
  const cards = [
    {
      title: "Total Kategori",
      value: stats?.totalCategories ?? 0,
      subtitle: "Klasifikasi subjek terdaftar",
      icon: Tag,
      color: { bg: "bg-[#F5F0FF]", text: "text-[#6D28D9]" },
    },
    {
      title: "Kategori Digunakan",
      value: stats?.usedCategories ?? 0,
      subtitle: "Memiliki koleksi buku aktif",
      icon: BookCheck,
      color: { bg: "bg-emerald-50", text: "text-[#16A34A]" },
    },
    {
      title: "Kategori Kosong",
      value: stats?.emptyCategories ?? 0,
      subtitle: "Belum memiliki koleksi buku",
      icon: FolderMinus,
      color: { bg: "bg-amber-50", text: "text-[#D97706]" },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
