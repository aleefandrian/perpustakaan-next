import AdminLayout from "@/components/layout/AdminLayout";
import { ArrowLeftRight } from "lucide-react";

export default function LoansPage() {
  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-[#F5F0FF] text-[#6D28D9]">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#27233A]">Data Peminjaman</h1>
            <p className="text-sm text-[#858095]">Kelola transaksi peminjaman buku aktif dan riwayat peminjaman.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
