import { forwardRef } from "react";
import { clsx } from "clsx";

// ---- Input ----
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="grid gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 tracking-tight">
            {label}
            {props.required && <span className="ml-0.5 text-rose-400">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "h-9 rounded-lg border bg-surface-app/70 px-3.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-150",
            "border-white/10 focus:border-blue-500/70 focus:bg-surface-app focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
      </div>
    );
  }
);

// ---- Textarea ----
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="grid gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 tracking-tight">
            {label}
            {props.required && <span className="ml-0.5 text-rose-400">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "min-h-24 rounded-lg border bg-surface-app/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-150",
            "border-white/10 focus:border-blue-500/70 focus:bg-surface-app focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
      </div>
    );
  }
);

// ---- Select ----
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, hint, className, id, children, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="grid gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 tracking-tight">
            {label}
            {props.required && <span className="ml-0.5 text-rose-400">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            "h-9 rounded-lg border bg-surface-app/70 px-3.5 text-sm text-slate-100 transition-all duration-150",
            "border-white/10 focus:border-blue-500/70 focus:bg-surface-app focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
      </div>
    );
  }
);

// ---- Label ----
export function Label({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-300 tracking-tight">
      {children}
      {required && <span className="ml-0.5 text-rose-400">*</span>}
    </label>
  );
}

