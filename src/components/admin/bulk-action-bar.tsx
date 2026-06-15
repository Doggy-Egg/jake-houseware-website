"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type BulkActionBarProps = {
  selectedCount: number;
  submitting?: boolean;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel?: string;
  disabled?: boolean;
  variant?: "default" | "danger";
};

export function BulkActionBar({
  selectedCount,
  submitting = false,
  onSubmit,
  submitLabel,
  submittingLabel = "处理中…",
  disabled = false,
  variant = "default",
}: BulkActionBarProps) {
  const showBar = selectedCount > 0 || submitting;

  if (!showBar) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm"
      role="region"
      aria-label="批量操作"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="text-sm text-muted">
          已选{" "}
          <span className="font-medium text-foreground">{selectedCount}</span>{" "}
          个产品
        </p>
        <Button
          type="button"
          variant={variant === "danger" ? "outline" : "default"}
          disabled={disabled || submitting || selectedCount === 0}
          onClick={onSubmit}
          className={cn(
            variant === "danger" &&
              "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50",
          )}
        >
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
}
