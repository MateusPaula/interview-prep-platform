import { describe, expect, it } from "vitest";
import type { ConfidenceRating, NewConfidenceRating } from "@/core/domain";
import type { ConfidenceRepository } from "@/core/application/ports";
import { listConfidenceRatings } from "./list-confidence-ratings";
import { rateConfidence } from "./rate-confidence";

function confidenceRepository(store: ConfidenceRating[]): ConfidenceRepository {
  return {
    async add(rating: NewConfidenceRating) {
      const stored: ConfidenceRating = {
        ...rating,
        id: `rating-${store.length + 1}`,
        ratedAt: `2026-08-0${store.length + 1}T12:00:00Z`,
      };
      store.push(stored);
      return stored;
    },
    async listByUser(userId) {
      return store.filter((rating) => rating.userId === userId);
    },
  };
}

describe("rateConfidence", () => {
  it("appends a new rating for the user", async () => {
    const store: ConfidenceRating[] = [];
    const rating = await rateConfidence(confidenceRepository(store), {
      userId: "user-1",
      topic: "trees",
      level: 4,
    });
    expect(rating).toEqual({
      id: "rating-1",
      userId: "user-1",
      topic: "trees",
      level: 4,
      ratedAt: "2026-08-01T12:00:00Z",
    });
    expect(store).toHaveLength(1);
  });
});

describe("listConfidenceRatings", () => {
  it("returns only the requesting user's ratings", async () => {
    const store: ConfidenceRating[] = [];
    const repository = confidenceRepository(store);
    await rateConfidence(repository, { userId: "user-1", topic: "trees", level: 2 });
    await rateConfidence(repository, { userId: "user-2", topic: "graphs", level: 5 });
    const ratings = await listConfidenceRatings(repository, "user-1");
    expect(ratings).toHaveLength(1);
    expect(ratings[0]).toMatchObject({ userId: "user-1", topic: "trees", level: 2 });
  });
});
