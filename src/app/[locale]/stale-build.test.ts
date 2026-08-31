import { describe, expect, it } from "vitest";
import { isStaleBuildError } from "./stale-build";

describe("isStaleBuildError", () => {
  it("detects a chunk load error by name", () => {
    const error = new Error("Failed to load chunk");
    error.name = "ChunkLoadError";
    expect(isStaleBuildError(error)).toBe(true);
  });

  it("detects a chunk load failure by message", () => {
    expect(
      isStaleBuildError(new Error("Loading chunk 42 failed. (missing: /a.js)")),
    ).toBe(true);
  });

  it("detects a failed dynamic import", () => {
    expect(
      isStaleBuildError(
        new Error("Failed to fetch dynamically imported module: /b.js"),
      ),
    ).toBe(true);
  });

  it("ignores unrelated application errors", () => {
    expect(isStaleBuildError(new Error("Missing Supabase configuration"))).toBe(
      false,
    );
  });
});
