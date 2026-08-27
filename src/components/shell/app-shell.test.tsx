import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { renderWithIntl } from "../testing/render-with-intl";
import { AppShell } from "./app-shell";

const { state } = vi.hoisted(() => ({
  state: { pathname: "/" },
}));

vi.mock("@/i18n/navigation", () => {
  const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
  function Link({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return {
    Link,
    usePathname: () => state.pathname,
    useRouter: () => router,
  };
});

vi.mock("@/infrastructure/supabase/browser-client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({ error: null }) },
  }),
}));

describe("AppShell", () => {
  beforeEach(() => {
    state.pathname = "/";
  });

  it("marks the dashboard link active on the root path", () => {
    renderWithIntl(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("aria-current", "page");
    const challenge = screen.getByRole("link", { name: "Daily Challenge" });
    expect(challenge).not.toHaveAttribute("aria-current");
  });

  it("marks the challenge link active on /challenge", () => {
    state.pathname = "/challenge";
    renderWithIntl(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );
    const challenge = screen.getByRole("link", { name: "Daily Challenge" });
    expect(challenge).toHaveAttribute("aria-current", "page");
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).not.toHaveAttribute("aria-current");
  });

  it("renders its children and toggles the mobile menu", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <AppShell>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.getByText("page content")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);
    expect(
      screen.getByRole("button", { name: "Close menu" }),
    ).toBeInTheDocument();
  });
});
