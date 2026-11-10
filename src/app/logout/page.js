import Link from "next/link";
import { LogOut, ArrowRight } from "lucide-react";

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4">
      <div className="bg-white p-8 rounded-xl border border-[#E5E7EB] w-full max-w-md shadow-sm text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#27233A] mb-2">Anda Telah Logout</h1>
        <p className="text-sm text-[#858095] mb-6">Sesi login Anda telah berakhir dengan aman.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#6D28D9] text-white font-medium rounded-lg hover:bg-[#5B21B6] transition-colors"
        >
          <span>Masuk Kembali</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
