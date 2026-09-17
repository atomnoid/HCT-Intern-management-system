"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        className={clsx(
          "relative z-10 w-full rounded-lg border border-surface-line bg-surface-panel shadow-2xl",
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-surface-line px-5 py-4">
            <div>
              {title && (
                <h2
                  id="dialog-title"
                  className="text-sm font-semibold text-slate-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={onClose}
              aria-label="Close dialog"
              className="ml-4 -mr-1 -mt-1"
            >
              <X size={14} />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-surface-line px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
