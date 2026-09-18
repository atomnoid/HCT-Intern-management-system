"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Handshake,
  Bell,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { logoutAction } from "@/actions/auth";
import { RoleBadge } from "@/components/ui/badges";
import type { Profile } from "@/types/database";

// ---- Nav item type ----
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  leadOnly?: boolean;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { href: "/tasks",         label: "Tasks",        icon: CheckSquare },
  { href: "/my-progress",   label: "My Progress",  icon: TrendingUp },
  { href: "/promises",      label: "Promises",     icon: Handshake },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/employees",     label: "Employees",    icon: Users,    leadOnly: true },
];

// ---- Top Route Progress Bar Component ----
function RouteSwitchLoader({ isNavigating }: { isNavigating: boolean }) {
  if (!isNavigating) return null;
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: 0.7 }}
      exit={{ scaleX: 1, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 h-0.5 bg-blue-500 origin-left z-50 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
    />
  );
}

// ---- Avatar ----
function Avatar({
  name,
  avatarUrl,
  size = "sm",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-10 w-10 text-sm",
  };

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={clsx("rounded-full object-cover ring-1 ring-white/10", sizeClasses[size])}
      />
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-blue-600/20 font-semibold text-blue-300 border border-blue-500/30",
        sizeClasses[size]
      )}
    >
      {initials}
    </span>
  );
}

// ---- Single Nav Link with Framer Motion Pill ----
function NavLink({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={clsx(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors duration-150 focus-ring select-none",
        isActive
          ? "text-white"
          : "text-slate-400 hover:text-slate-200"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute inset-0 rounded-lg bg-blue-600/15 border border-blue-500/30"
        />
      )}
      <item.icon
        size={16}
        className={clsx(
          "relative z-10 shrink-0 transition-colors duration-200",
          isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
        )}
      />
      <span className="relative z-10 flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="relative z-10 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-semibold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

// ---- Sidebar Content ----
function SidebarContent({
  profile,
  unreadNotificationsCount = 0,
  onNavClick,
}: {
  profile: Profile;
  unreadNotificationsCount?: number;
  onNavClick?: () => void;
}) {
  const isLead = profile.role === "lead";
  const visibleNav = NAV_ITEMS.map((item) =>
    item.href === "/notifications" ? { ...item, badge: unreadNotificationsCount } : item
  ).filter((item) => !item.leadOnly || isLead);

  return (
    <div className="flex h-full flex-col">
      {/* Branding */}
      <Link
        href="/dashboard"
        onClick={onNavClick}
        className="flex items-center gap-3 px-4 py-5 focus-ring rounded-lg group"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 transition-transform group-hover:scale-105">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-100 tracking-tight">HCT Intern</p>
          <p className="truncate text-[11px] text-slate-400 font-medium">Management System</p>
        </div>

      </Link>

      <div className="mx-3 mb-4 border-t border-white/[0.06]" />

      {/* Nav items */}
      <nav className="flex-1 px-3" aria-label="Main navigation">
        <ul className="grid gap-1">
          {visibleNav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} onClick={onNavClick} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-3 mt-4 border-t border-white/[0.06]" />

      {/* Profile + Logout */}
      <div className="px-3 py-4 space-y-1">
        <Link
          href="/profile"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.04] hover:text-slate-100 transition-colors focus-ring"
        >
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-slate-200">{profile.full_name}</p>
            <p className="truncate text-[10px] text-slate-400">{profile.email}</p>
          </div>
          <UserCircle size={15} className="shrink-0 text-slate-500" />
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors focus-ring"
          >
            <LogOut size={15} className="shrink-0 text-slate-500 hover:text-rose-400" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Breadcrumb ----
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({
      href: "",
      label: seg
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }));

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="text-slate-600" />}
          <span className={i === segments.length - 1 ? "font-semibold text-slate-200" : ""}>
            {seg.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

// ---- Main AppShell ----
export function AppShell({
  profile,
  unreadNotificationsCount = 0,
  children,
}: {
  profile: Profile;
  unreadNotificationsCount?: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Page Switch Loading bar effect
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 250);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface-app text-slate-100 selection:bg-blue-600/30">
      <RouteSwitchLoader isNavigating={isNavigating} />

      {/* ---- Desktop Layout ---- */}
      <div className="hidden md:flex md:h-screen md:overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-white/[0.08] bg-surface-sidebar">
          <SidebarContent profile={profile} unreadNotificationsCount={unreadNotificationsCount} />
        </aside>

        {/* Main Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-surface-app/80 px-6 backdrop-blur-md z-10">
            <Breadcrumb pathname={pathname} />
            <div className="flex items-center gap-4">
              <RoleBadge role={profile.role} />
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1 text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors focus-ring"
              >
                <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
                <span className="text-xs font-semibold">{profile.full_name}</span>
              </Link>
            </div>
          </header>

          {/* Content Area with Page Motion */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8" id="main-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="max-w-7xl mx-auto space-y-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ---- Mobile Layout ---- */}
      <div className="flex flex-col md:hidden min-h-screen">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-white/[0.08] bg-surface-sidebar px-4 sticky top-0 z-30">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm font-bold text-slate-100 tracking-tight">HCT Tracker</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 focus-ring"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="relative z-10 w-72 overflow-y-auto bg-surface-sidebar shadow-2xl border-r border-white/[0.08]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
                  <span className="text-sm font-semibold text-slate-100">Navigation</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>
                <SidebarContent profile={profile} onNavClick={() => setMobileOpen(false)} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Mobile Content */}
        <main className="flex-1 p-4" id="main-content">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

