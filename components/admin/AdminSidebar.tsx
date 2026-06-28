"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/actions/auth";

interface AdminSidebarProps {
  role: string;
  email: string;
  name: string;
}

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard overview",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/admin/dashboard/children",
    label: "Children",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/dashboard/ledger",
    label: "Ledger",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    superAdminOnly: true,
  },
  {
    href: "/admin/dashboard/admins",
    label: "Manage admins",
    icon: <Users className="w-4 h-4" />,
    superAdminOnly: true,
  },
  {
    href: "/admin/dashboard/profile",
    label: "Profile settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

function Avatar({ name, email }: { name: string; email: string }) {
  const letter = (name || email).charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] flex items-center justify-center text-sm font-bold shrink-0">
      {letter}
    </div>
  );
}

export function AdminSidebar({ role, email, name }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-64 shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] min-h-screen flex flex-col">
      {/* Brand */}
      <Link href="/admin/dashboard" className="block p-6 border-b border-[var(--color-border)] hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo/openhearts_logo.png"
            alt="Open Hearts Foundation"
            width={36}
            height={36}
            className="rounded-full object-cover shrink-0"
          />
          <div>
            <h1 className="font-bold text-sm text-[var(--color-foreground)]">Open Hearts</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Admin panel</p>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (item.superAdminOnly && role !== "super_admin") return null;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-colors",
                active
                  ? "bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border)] space-y-3">
        <Link
          href="/admin/dashboard/profile"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <Avatar name={name} email={email} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
              {name || email.split("@")[0]}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{email}</p>
          </div>
        </Link>
        <form action={adminLogout}>
          <button
            type="submit"
            className="w-full text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
