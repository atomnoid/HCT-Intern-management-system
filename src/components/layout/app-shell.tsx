"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
        className={clsx("rounded-full object-cover", sizeClasses[size])}
      />
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-blue-900/60 font-semibold text-blue-300 border border-blue-800/40",
        sizeClasses[size]
      )}
    >
      {initials}
    </span>
  );
}

// ---- Single Nav Link ----
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
        "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-ring",
        isActive
          ? "bg-blue-900/30 text-blue-300 border border-blue-800/40"
          : "text-slate-400 border border-transparent hover:bg-surface-raised hover:text-slate-100"
      )}
    >
      <item.icon
        size={15}
        className={clsx(
          "flex-shrink-0 transition-colors",
          isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

// ---- Sidebar content ----
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
        className="flex items-center gap-3 px-3 py-4 focus-ring rounded-md"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-blue-800/60 bg-blue-900/30">
          <span className="text-xs font-bold text-blue-300">HT</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">HCT Tracker</p>
          <p className="truncate text-xs text-slate-500">Internal operations</p>
        </div>
      </Link>

      {/* Divider */}
      <div className="mx-3 mb-3 border-t border-surface-line" />

      {/* Nav items */}
      <nav className="flex-1 px-2" aria-label="Main navigation">
        <ul className="grid gap-0.5">
          {visibleNav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} onClick={onNavClick} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-3 mt-3 border-t border-surface-line" />

      {/* Profile + Logout */}
      <div className="px-2 py-3">
        <Link
          href="/profile"
          onClick={onNavClick}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-surface-raised hover:text-slate-100 transition-colors duration-150 focus-ring"
        >
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-slate-200">{profile.full_name}</p>
            <p className="truncate text-[10px] text-slate-500">{profile.email}</p>
          </div>
          <UserCircle size={14} className="flex-shrink-0 text-slate-600" />
        </Link>

        <form action={logoutAction} className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-surface-raised hover:text-slate-300 transition-colors duration-150 focus-ring"
          >
            <LogOut size={14} className="flex-shrink-0" />
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
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-slate-500">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={11} className="text-slate-600" />}
          <span className={i === segments.length - 1 ? "text-slate-300" : ""}>{seg.label}</span>
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
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-app">
      {/* ---- Desktop Layout ---- */}
      <div className="hidden md:flex md:h-screen md:overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 overflow-y-auto border-r border-surface-line bg-surface-sidebar">
          <SidebarContent profile={profile} unreadNotificationsCount={unreadNotificationsCount} />
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-surface-line bg-surface-app/95 px-5 backdrop-blur">
            <Breadcrumb pathname={pathname} />
            <div className="flex items-center gap-3">
              <RoleBadge role={profile.role} />
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-md px-2 py-1 text-slate-400 hover:bg-surface-raised hover:text-slate-200 transition-colors focus-ring"
              >
                <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
                <span className="text-xs font-medium text-slate-300">{profile.full_name}</span>
              </Link>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto" id="main-content">
            {children}
          </main>
        </div>
      </div>

      {/* ---- Mobile Layout ---- */}
      <div className="flex flex-col md:hidden">
        {/* Mobile top bar */}
        <header className="flex h-12 items-center justify-between border-b border-surface-line bg-surface-sidebar px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-blue-800/60 bg-blue-900/30">
              <span className="text-[10px] font-bold text-blue-300">HT</span>
            </div>
            <span className="text-sm font-semibold text-slate-100">HCT Tracker</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-slate-400 hover:bg-surface-raised hover:text-slate-200 focus-ring"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="relative z-10 w-72 overflow-y-auto bg-surface-sidebar shadow-xl">
              <div className="flex items-center justify-between border-b border-surface-line px-4 py-3">
                <span className="text-sm font-semibold text-slate-100">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-200"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>
              <SidebarContent profile={profile} onNavClick={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Mobile content */}
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
