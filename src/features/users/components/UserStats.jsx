import React from "react";
import { Users, ShieldCheck, GraduationCap, UserCheck } from "lucide-react";
import { StatCard } from "@/features/books/components/BookStats";

export default function UserStats({ stats, loading = false }) {
  const cards = [
    {
      title: "Total User",
      value: stats?.totalUsers ?? 0,
      subtitle: "Akun pengguna terdaftar",
      icon: Users,
      color: { bg: "bg-[#F5F0FF]", text: "text-[#6D28D9]" },
    },
    {
      title: "Total Admin",
      value: stats?.totalAdmin ?? 0,
      subtitle: "Pengelola perpustakaan",
      icon: ShieldCheck,
      color: { bg: "bg-purple-50", text: "text-[#6D28D9]" },
    },
    {
      title: "Total Siswa",
      value: stats?.totalSiswa ?? 0,
      subtitle: "Anggota siswa perpustakaan",
      icon: GraduationCap,
      color: { bg: "bg-blue-50", text: "text-blue-600" },
    },
    {
      title: "User Aktif",
      value: stats?.activeUsers ?? 0,
      subtitle: "Dapat melakukan sirkulasi",
      icon: UserCheck,
      color: { bg: "bg-emerald-50", text: "text-[#16A34A]" },
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
