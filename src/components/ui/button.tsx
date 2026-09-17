import { forwardRef } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white border border-blue-600 hover:bg-blue-500 hover:border-blue-500 active:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-400 disabled:border-blue-900",
  secondary:
    "bg-surface-raised text-slate-200 border border-surface-line hover:bg-[#1e2d3d] hover:text-white active:bg-[#1a2535] disabled:text-slate-500 disabled:border-surface-line",
  outline:
    "bg-transparent text-slate-300 border border-surface-line hover:bg-surface-raised hover:text-white active:bg-surface-panel disabled:text-slate-600",
  ghost:
    "bg-transparent text-slate-400 border border-transparent hover:bg-surface-raised hover:text-slate-200 active:bg-surface-panel disabled:text-slate-600",
  danger:
    "bg-red-900/30 text-red-300 border border-red-800/60 hover:bg-red-900/50 hover:text-red-200 active:bg-red-900/70 disabled:text-red-600 disabled:border-red-900/30",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-xs gap-1 rounded",
  sm: "h-7 px-3 text-xs gap-1.5 rounded",
  md: "h-8 px-3.5 text-sm gap-2 rounded-md",
  lg: "h-9 px-4 text-sm gap-2 rounded-md",
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
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-ring",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-3.5 w-3.5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children && <span>{children}</span>}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </button>
    );
  }
);
