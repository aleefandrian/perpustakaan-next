"use client";

import React, { useState } from "react";
import { XCircle, AlertTriangle, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RejectionDialog({
  isOpen,
  request,
  onClose,
  onConfirm,
  isProcessing = false,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !request) return null;

  const { user, book } = request;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Alasan penolakan permohonan wajib diisi.");
      return;
    }

    setError("");
    try {
      await onConfirm(request.id, reason.trim());
    } catch (err) {
      setError(err.message || "Gagal menolak permohonan.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2 text-rose-700">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#27233A]">
                Tolak Pengajuan Peminjaman
              </h3>
              <p className="text-xs text-[#858095]">
                Berikan alasan penolakan yang jelas kepada siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-[#858095] hover:text-[#27233A] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-[#4B465C]">
            <p>
              <strong>Siswa:</strong> {user?.name} (NISN: {user?.nisn || "-"})
            </p>
            <p className="mt-1">
              <strong>Buku:</strong> {book?.title}
            </p>
          </div>

          <div>
            <label
              htmlFor="rejection-reason"
              className="block text-xs font-bold text-[#27233A] mb-1.5"
            >
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Contoh: Stok fisik buku sedang dalam proses perbaikan / pemeliharaan."
              className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#27233A] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-gray-400"
            />
            <p className="text-[11px] text-[#858095] mt-1">
              Alasan ini akan ditampilkan pada halaman pengajuan siswa.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Menolak...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1.5" />
                <span>Tolak Pengajuan</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
