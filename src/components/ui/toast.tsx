"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

// ---- Types ----
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

// ---- Context ----
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ---- Icon & styling ----
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />,
  error:   <AlertCircle size={15} className="text-red-400 flex-shrink-0" />,
  info:    <Info size={15} className="text-blue-400 flex-shrink-0" />,
  warning: <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error:   "border-l-red-500",
  info:    "border-l-blue-500",
  warning: "border-l-amber-500",
};

// ---- Single Toast ----
function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const duration = t.duration ?? 4000;
    const timer = setTimeout(() => onDismiss(t.id), duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onDismiss]);

  return (
    <div
      className={clsx(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border border-surface-line bg-surface-raised py-3 pl-3.5 pr-3 shadow-xl",
        "border-l-2",
        borderColors[t.type]
      )}
      role="alert"
    >
      {icons[t.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 leading-snug">{t.title}</p>
        {t.message && (
          <p className="mt-0.5 text-xs text-slate-400 leading-snug">{t.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ---- Provider ----
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const success = useCallback((title: string, message?: string) =>
    toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title: string, message?: string) =>
    toast({ type: "error", title, message }), [toast]);
  const info = useCallback((title: string, message?: string) =>
    toast({ type: "info", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) =>
    toast({ type: "warning", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
