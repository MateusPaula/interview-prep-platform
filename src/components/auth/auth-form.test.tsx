import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "../testing/render-with-intl";
import { AuthForm } from "./auth-form";

const { signInMock, signUpMock, replaceMock, refreshMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  signUpMock: vi.fn(),
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/infrastructure/supabase/browser-client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signInWithPassword: signInMock, signUp: signUpMock },
  }),
}));

vi.mock("@/i18n/navigation", () => {
  const router = { replace: replaceMock, push: vi.fn(), refresh: refreshMock };
  return {
    useRouter: () => router,
    Link: (props: { href: string; children: React.ReactNode }) => (
      <a href={props.href}>{props.children}</a>
    ),
  };
});

describe("AuthForm sign-in", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signUpMock.mockReset();
    replaceMock.mockReset();
    refreshMock.mockReset();
  });

  it("shows validation errors without calling supabase on empty submit", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-in" />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-in" />);
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      screen.getByText("That does not look like a valid email"),
    ).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("signs in and routes to the dashboard", async () => {
    signInMock.mockResolvedValue({ data: { session: {} }, error: null });
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-in" />);
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(signInMock).toHaveBeenCalledWith({
      email: "dev@example.com",
      password: "password123",
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it("surfaces invalid credentials", async () => {
    signInMock.mockResolvedValue({
      data: { session: null },
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-in" />);
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

describe("AuthForm sign-up", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signUpMock.mockReset();
    replaceMock.mockReset();
    refreshMock.mockReset();
  });

  it("rejects a short password", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-up" />);
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("routes to the dashboard when sign-up returns a session", async () => {
    signUpMock.mockResolvedValue({ data: { session: {} }, error: null });
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-up" />);
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
  });

  it("asks for email confirmation when no session is returned", async () => {
    signUpMock.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();
    renderWithIntl(<AuthForm mode="sign-up" />);
    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText(
        "Check your inbox to confirm your email, then sign in.",
      ),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
