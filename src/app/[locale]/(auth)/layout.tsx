import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/components/shell/locale-switcher";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("auth");

  const features = [
    t("brandFeatureDaily"),
    t("brandFeatureTimer"),
    t("brandFeatureFeedback"),
  ];

  return (
    <div className="grid min-h-dvh lg:grid-cols-[5fr_4fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-accent/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-52 -bottom-52 size-[36rem] rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            IP
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Interview Prep
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-ink">
            {t("brandHeadline")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            {t("brandBody")}
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-ink-secondary"
              >
                <span className="flex size-5 items-center justify-center rounded-full border border-accent/40 bg-accent-soft">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3 text-accent-ink"
                    aria-hidden
                  >
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden className="relative" />
      </aside>

      <div className="relative flex flex-col">
        <div className="flex justify-end p-4">
          <LocaleSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}
