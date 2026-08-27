import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "../testing/render-with-intl";
import { SignOutButton } from "./sign-out-button";

const { signOutMock, replaceMock, refreshMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/infrastructure/supabase/browser-client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: signOutMock },
  }),
}));

vi.mock("@/i18n/navigation", () => {
  const router = {
    replace: replaceMock,
    push: vi.fn(),
    refresh: refreshMock,
  };
  return { useRouter: () => router };
});

describe("SignOutButton", () => {
  beforeEach(() => {
    signOutMock.mockReset().mockResolvedValue({ error: null });
    replaceMock.mockReset();
    refreshMock.mockReset();
  });

  it("signs out and routes to login", async () => {
    const user = userEvent.setup();
    renderWithIntl(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(refreshMock).toHaveBeenCalled();
  });
});
