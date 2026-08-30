import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("common.notFound");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-sm tracking-widest text-ink-muted">404</p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {t("title")}
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">
        {t("body")}
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
