import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/components/testing/render-with-intl";
import LocaleError from "./error";

describe("LocaleError", () => {
  const reloadMock = vi.fn();

  beforeEach(() => {
    reloadMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reloads the page automatically on a stale build chunk error", () => {
    const error = new Error("Loading chunk 42 failed.");
    error.name = "ChunkLoadError";
    renderWithIntl(<LocaleError error={error} reset={vi.fn()} />);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("does not reload for an unrelated application error", () => {
    renderWithIntl(
      <LocaleError
        error={new Error("Missing Supabase environment configuration")}
        reset={vi.fn()}
      />,
    );
    expect(reloadMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls reset when the retry button is clicked", () => {
    const reset = vi.fn();
    renderWithIntl(
      <LocaleError error={new Error("boom")} reset={reset} />,
    );
    screen.getByRole("button").click();
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
