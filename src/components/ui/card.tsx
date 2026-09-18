"use client";

import { clsx } from "clsx";
import { motion, HTMLMotionProps } from "framer-motion";

// ---- Card ----
export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function Card({
  children,
  className,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={clsx(
        "rounded-xl border border-white/10 bg-surface-panel/80 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between border-b border-white/[0.06] px-5 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={clsx("text-base font-semibold text-slate-100 tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center border-t border-white/[0.06] px-5 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

