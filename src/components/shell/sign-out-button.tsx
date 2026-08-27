"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/browser-client";
import { useRouter } from "@/i18n/navigation";

export function SignOutButton() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-raised hover:text-ink disabled:opacity-45"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className="size-4 shrink-0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
        <path d="M10.5 11 14 8l-3.5-3" />
        <path d="M14 8H6" />
      </svg>
      {t("signOut")}
    </button>
  );
}
