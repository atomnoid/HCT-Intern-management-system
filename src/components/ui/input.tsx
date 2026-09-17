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
      <div className="grid gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
            {label}
            {props.required && <span className="ml-0.5 text-slate-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "h-8 rounded-md border bg-surface-raised px-3 text-sm text-slate-100 placeholder-slate-500",
            "border-surface-line focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-700 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
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
      <div className="grid gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
            {label}
            {props.required && <span className="ml-0.5 text-slate-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "min-h-20 rounded-md border bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder-slate-500",
            "border-surface-line focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-red-700 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
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
      <div className="grid gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
            {label}
            {props.required && <span className="ml-0.5 text-slate-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            "h-8 rounded-md border bg-surface-raised px-3 text-sm text-slate-100",
            "border-surface-line focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-700",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
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
    <label htmlFor={htmlFor} className="text-xs font-medium text-slate-300">
      {children}
      {required && <span className="ml-0.5 text-slate-500">*</span>}
    </label>
  );
}
