"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  en: "EN",
  "pt-BR": "PT-BR",
};

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      role="radiogroup"
      aria-label={t("localeSwitcherLabel")}
      className="inline-flex rounded-lg border border-line bg-raised p-0.5"
    >
      {routing.locales.map((candidate) => {
        const active = candidate === locale;
        return (
          <button
            key={candidate}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (!active) {
                router.replace(pathname, { locale: candidate });
              }
            }}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-150 ${
              active
                ? "bg-overlay text-ink"
                : "text-ink-muted hover:text-ink-secondary"
            }`}
          >
            {localeLabels[candidate]}
          </button>
        );
      })}
    </div>
  );
}
