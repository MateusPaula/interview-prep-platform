import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ApiErrorResponse } from "@/core/contracts";
import { useApiQuery } from "./use-api-query";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));

vi.mock("@/i18n/navigation", () => {
  const router = { replace: replaceMock, push: vi.fn(), refresh: vi.fn() };
  return { useRouter: () => router };
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  replaceMock.mockReset();
});

describe("useApiQuery", () => {
  it("exposes loading then data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ value: 42 }, 200))),
    );
    const { result } = renderHook(() =>
      useApiQuery<{ value: number }>("/api/progress"),
    );
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ value: 42 }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("exposes the error code on failure", async () => {
    const body: ApiErrorResponse = {
      error: { code: "internal_error", message: "boom" },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(body, 500)));
    const { result } = renderHook(() => useApiQuery("/api/progress"));
    await waitFor(() =>
      expect(result.current.error?.code).toBe("internal_error"),
    );
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("redirects to login on unauthorized", async () => {
    const body: ApiErrorResponse = {
      error: { code: "unauthorized", message: "no session" },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(body, 401)));
    renderHook(() => useApiQuery("/api/progress"));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
  });

  it("refetch reloads the data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ value: 1 }, 200))
      .mockResolvedValueOnce(jsonResponse({ value: 2 }, 200));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() =>
      useApiQuery<{ value: number }>("/api/progress"),
    );
    await waitFor(() => expect(result.current.data).toEqual({ value: 1 }));
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toEqual({ value: 2 }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
