import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";
import { useTimerStore } from "@/stores/timer-store";
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

  it("clears the challenge session and timer on sign out", async () => {
    useChallengeSessionStore.getState().initialize({
      id: "ch-1",
      title: "Two Sum",
      prompt: "Find two numbers adding to target.",
      topic: "arrays",
      difficulty: "easy",
      starterCode: "function twoSum() {}",
    });
    useChallengeSessionStore
      .getState()
      .addHint({ level: 1, hint: "Consider a map." });
    useTimerStore.getState().configure(1200);
    useTimerStore.getState().start();

    const user = userEvent.setup();
    renderWithIntl(<SignOutButton />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));

    expect(useChallengeSessionStore.getState().challengeId).toBeNull();
    expect(useChallengeSessionStore.getState().code).toBe("");
    expect(useChallengeSessionStore.getState().hints).toEqual([]);
    expect(useTimerStore.getState().status).toBe("idle");
    expect(useTimerStore.getState().totalSeconds).toBe(0);
  });
});
