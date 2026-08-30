import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "../testing/render-with-intl";
import { LocaleSwitcher } from "./locale-switcher";

const { replaceMock, state } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  state: { locale: "en", pathname: "/challenge" },
}));

vi.mock("@/i18n/navigation", () => {
  const router = { replace: replaceMock, push: vi.fn(), refresh: vi.fn() };
  return {
    useRouter: () => router,
    usePathname: () => state.pathname,
  };
});

vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return {
    ...actual,
    useLocale: () => state.locale,
  };
});

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    state.locale = "en";
    state.pathname = "/challenge";
  });

  it("marks the active locale", () => {
    renderWithIntl(<LocaleSwitcher />);
    expect(screen.getByRole("radio", { name: "EN" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "PT-BR" })).not.toBeChecked();
  });

  it("switches to pt-BR keeping the current path", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LocaleSwitcher />);
    await user.click(screen.getByRole("radio", { name: "PT-BR" }));
    expect(replaceMock).toHaveBeenCalledWith("/challenge", {
      locale: "pt-BR",
    });
  });

  it("does not navigate when the active locale is clicked", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LocaleSwitcher />);
    await user.click(screen.getByRole("radio", { name: "EN" }));
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
