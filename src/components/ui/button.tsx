"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm shadow-blue-900/30 border border-blue-500/60 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-900/40 disabled:text-blue-300/50 disabled:border-blue-900/20",
  secondary:
    "bg-surface-raised text-slate-200 border border-white/10 hover:bg-surface-panel hover:text-white hover:border-white/20 active:bg-surface-app disabled:opacity-40 disabled:pointer-events-none",
  outline:
    "bg-transparent text-slate-300 border border-white/10 hover:bg-white/[0.04] hover:text-white hover:border-white/20 active:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none",
  ghost:
    "bg-transparent text-slate-400 border border-transparent hover:bg-white/[0.05] hover:text-slate-200 active:bg-white/[0.1] disabled:opacity-40 disabled:pointer-events-none",
  danger:
    "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 active:bg-rose-500/30 disabled:opacity-40 disabled:pointer-events-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5 rounded-md font-medium",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md font-medium tracking-wide",
  md: "h-9 px-4 text-sm gap-2 rounded-lg font-medium",
  lg: "h-10 px-5 text-sm gap-2 rounded-lg font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={clsx(
          "inline-flex items-center justify-center transition-colors duration-150 focus-ring select-none relative overflow-hidden",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
            {children && <span>{children}</span>}
          </motion.div>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="shrink-0 transition-transform group-hover:scale-105">{icon}</span>
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === "right" && (
              <span className="shrink-0 transition-transform group-hover:scale-105">{icon}</span>
            )}
          </>
        )}
      </motion.button>
    );
  }
);

