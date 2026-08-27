import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { redirect } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect({ href: "/login", locale });
  }

  return <AppShell>{children}</AppShell>;
}
