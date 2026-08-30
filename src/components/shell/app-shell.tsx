"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { SignOutButton } from "./sign-out-button";

interface NavItem {
  href: string;
  labelKey: "dashboard" | "dailyChallenge" | "behavioral" | "progress";
  icon: ReactNode;
}

const iconProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-4 shrink-0",
  "aria-hidden": true,
} as const;

const navItems: NavItem[] = [
  {
    href: "/",
    labelKey: "dashboard",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/challenge",
    labelKey: "dailyChallenge",
    icon: (
      <svg {...iconProps}>
        <path d="m5.5 5-3 3 3 3" />
        <path d="m10.5 5 3 3-3 3" />
        <path d="M9 3.5 7 12.5" />
      </svg>
    ),
  },
  {
    href: "/behavioral",
    labelKey: "behavioral",
    icon: (
      <svg {...iconProps}>
        <path d="M14 8a6 6 0 1 0-11.1 3.2L2 14l2.9-.8A6 6 0 0 0 14 8Z" />
        <path d="M5.5 7h5" />
        <path d="M5.5 9.5h3" />
      </svg>
    ),
  },
  {
    href: "/progress",
    labelKey: "progress",
    icon: (
      <svg {...iconProps}>
        <path d="M2 14h12" />
        <path d="M4 14V8" />
        <path d="M8 14V4" />
        <path d="M12 14V6" />
      </svg>
    ),
  },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
        IP
      </span>
      <span className="text-sm font-semibold tracking-tight text-ink">
        Interview Prep
      </span>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              active
                ? "bg-raised text-ink shadow-[inset_2px_0_0_var(--color-accent)]"
                : "text-ink-muted hover:bg-raised/60 hover:text-ink-secondary"
            }`}
          >
            {item.icon}
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-3 px-3 pb-2">
      <div className="px-3">
        <LocaleSwitcher />
      </div>
      <SignOutButton />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="sticky top-0 flex h-dvh flex-col gap-6 py-5">
          <BrandMark />
          <NavLinks />
          <div className="mt-auto">
            <SidebarFooter />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
          <BrandMark />
          <button
            type="button"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-line bg-raised p-2 text-ink-secondary hover:text-ink"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              className="size-4"
              aria-hidden
            >
              {menuOpen ? (
                <>
                  <path d="m4 4 8 8" />
                  <path d="m12 4-8 8" />
                </>
              ) : (
                <>
                  <path d="M2.5 4.5h11" />
                  <path d="M2.5 8h11" />
                  <path d="M2.5 11.5h11" />
                </>
              )}
            </svg>
          </button>
        </header>

        {menuOpen ? (
          <div className="border-b border-line bg-surface py-4 lg:hidden">
            <NavLinks onNavigate={() => setMenuOpen(false)} />
            <div className="mt-4">
              <SidebarFooter />
            </div>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
