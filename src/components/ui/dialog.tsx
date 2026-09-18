"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? "dialog-title" : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className={clsx(
              "relative z-10 w-full rounded-2xl border border-white/10 bg-surface-panel shadow-2xl overflow-hidden backdrop-blur-xl",
              sizeClasses[size]
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
                <div>
                  {title && (
                    <h2
                      id="dialog-title"
                      className="text-base font-semibold text-slate-100 tracking-tight"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-xs text-slate-400">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="ml-4 -mr-2 -mt-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </Button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] bg-surface-app/50 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

