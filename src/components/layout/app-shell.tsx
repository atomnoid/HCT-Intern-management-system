import { ClipboardList, LayoutDashboard, LogOut, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import type { Profile } from "@/types/database";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const nav = [["/dashboard", LayoutDashboard, "Dashboard"], ["/tasks", ClipboardList, "Tasks"], ["/interns", Users, "Interns"]];

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <aside className="border-b border-surface-line bg-surface-sidebar p-4 md:min-h-screen md:border-b-0 md:border-r">
        <Link href="/dashboard" className="mb-5 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-sky-900 bg-surface-raised font-bold text-sky-300">IT</span>
          <span><strong className="block text-sm">Intern Tracker</strong><small className="text-xs text-slate-400">Internal operations</small></span>
        </Link>
        <nav className="flex gap-2 overflow-x-auto md:grid md:overflow-visible">
          {nav.map(([href, Icon, label]) => (
            <Link key={href as string} href={href as string} className="focus-ring flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-surface-raised hover:text-white">
              <Icon size={17} /> {label as string}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="mt-5 hidden md:block">
          <button className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-surface-raised hover:text-white"><LogOut size={16} /> Sign out</button>
        </form>
      </aside>
      <main>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-surface-line bg-surface-app/95 px-4 backdrop-blur">
          <div>
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs capitalize text-slate-400">{profile.role}</p>
          </div>
          <Link href="/profile" className="focus-ring rounded-md border border-surface-line p-2 text-slate-300 hover:bg-surface-raised"><UserRound size={18} /></Link>
        </header>
        {children}
      </main>
    </div>
  );
}
