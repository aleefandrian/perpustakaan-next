"use client";

import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Aksi",
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger", // danger, warning, primary
  loading = false,
  children,
}) {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      bg: "bg-red-50",
      color: "text-red-600",
      btnVariant: "danger",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-50",
      color: "text-amber-600",
      btnVariant: "primary",
    },
    primary: {
      icon: Info,
      bg: "bg-[#F5F0FF]",
      color: "text-[#6D28D9]",
      btnVariant: "primary",
    },
    success: {
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
      btnVariant: "success",
    },
  };

  const config = iconConfig[variant] || iconConfig.danger;
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={!loading}
      footer={
        <>
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.btnVariant}
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#27233A]">{title}</h4>
          {description && (
            <p className="text-xs text-[#858095] leading-relaxed">{description}</p>
          )}
          {children}
        </div>
      </div>
    </Modal>
  );
}
