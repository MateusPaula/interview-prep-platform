import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ApiErrorResponse,
  DailyChallengeResponse,
} from "@/core/contracts";
import { ApiError, apiFetch, isApiError } from "./api-client";

const dailyChallenge: DailyChallengeResponse = {
  dayKey: "2026-08-27",
  challenge: {
    id: "ch-1",
    title: "Two Sum",
    prompt: "Find two numbers adding up to the target.",
    topic: "arrays",
    difficulty: "easy",
    starterCode: "function twoSum() {}",
  },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns the typed body on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(dailyChallenge, 200));
    vi.stubGlobal("fetch", fetchMock);
    const result = await apiFetch<DailyChallengeResponse>(
      "/api/challenges/daily",
    );
    expect(result.challenge.title).toBe("Two Sum");
    expect(fetchMock).toHaveBeenCalledWith("/api/challenges/daily", undefined);
  });

  it("posts JSON bodies with the right headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }, 201));
    vi.stubGlobal("fetch", fetchMock);
    await apiFetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: "ch-1" }),
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/attempts",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws an ApiError carrying the contract error code", async () => {
    const body: ApiErrorResponse = {
      error: { code: "ai_unavailable", message: "Mentor is offline" },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(body, 502)));
    const failure = await apiFetch("/api/hints", { method: "POST" }).catch(
      (error: unknown) => error,
    );
    expect(isApiError(failure)).toBe(true);
    expect((failure as ApiError).code).toBe("ai_unavailable");
    expect((failure as ApiError).message).toBe("Mentor is offline");
  });

  it("maps a malformed error body to internal_error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("boom", { status: 500 })),
    );
    const failure = await apiFetch("/api/progress").catch(
      (error: unknown) => error,
    );
    expect(isApiError(failure)).toBe(true);
    expect((failure as ApiError).code).toBe("internal_error");
  });

  it("maps a network failure to internal_error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("network down")),
    );
    const failure = await apiFetch("/api/progress").catch(
      (error: unknown) => error,
    );
    expect(isApiError(failure)).toBe(true);
    expect((failure as ApiError).code).toBe("internal_error");
  });
});
