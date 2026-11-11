import React from "react";
import Button from "@/components/ui/Button";

export default function FormActions({
  submitText = "Simpan",
  cancelText = "Batal",
  onCancel,
  loading = false,
  disabled = false,
  className = "",
  submitVariant = "primary",
}) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] ${className}`}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        variant={submitVariant}
        size="md"
        loading={loading}
        disabled={disabled || loading}
      >
        {submitText}
      </Button>
    </div>
  );
}
