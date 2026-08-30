import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseConfidenceRepository } from "./confidence-repository";

interface RatingRowFixture {
  id: string;
  user_id: string;
  topic: string;
  level: number;
  rated_at: string;
}

interface InsertLog {
  table?: string;
  payload?: Record<string, unknown>;
}

interface ListLog {
  table?: string;
  filters: Array<[string, unknown]>;
  order?: [string, { ascending: boolean }];
}

const storedRow: RatingRowFixture = {
  id: "rating-1",
  user_id: "user-1",
  topic: "trees",
  level: 4,
  rated_at: "2026-08-27T12:00:00+00:00",
};

function fakeInsertClient(
  log: InsertLog,
  error: { message: string } | null = null,
): SupabaseClient {
  return {
    from(table: string) {
      log.table = table;
      return {
        insert(payload: Record<string, unknown>) {
          log.payload = payload;
          return {
            select() {
              return {
                async single() {
                  return error
                    ? { data: null, error }
                    : { data: storedRow, error: null };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

function fakeListClient(
  rows: RatingRowFixture[],
  log: ListLog,
  error: { message: string } | null = null,
): SupabaseClient {
  return {
    from(table: string) {
      log.table = table;
      return {
        select() {
          return {
            eq(column: string, value: unknown) {
              log.filters.push([column, value]);
              return {
                async order(
                  orderColumn: string,
                  options: { ascending: boolean },
                ) {
                  log.order = [orderColumn, options];
                  return error
                    ? { data: null, error }
                    : { data: rows, error: null };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

describe("SupabaseConfidenceRepository", () => {
  it("inserts a snake_case row and returns the mapped rating", async () => {
    const log: InsertLog = {};
    const repository = new SupabaseConfidenceRepository(fakeInsertClient(log));
    const rating = await repository.add({
      userId: "user-1",
      topic: "trees",
      level: 4,
    });
    expect(log.table).toBe("confidence_ratings");
    expect(log.payload).toEqual({
      user_id: "user-1",
      topic: "trees",
      level: 4,
    });
    expect(rating).toEqual({
      id: "rating-1",
      userId: "user-1",
      topic: "trees",
      level: 4,
      ratedAt: "2026-08-27T12:00:00.000Z",
    });
  });

  it("lists ratings for a user ordered by rated_at", async () => {
    const log: ListLog = { filters: [] };
    const repository = new SupabaseConfidenceRepository(
      fakeListClient([storedRow], log),
    );
    const ratings = await repository.listByUser("user-1");
    expect(ratings).toEqual([
      {
        id: "rating-1",
        userId: "user-1",
        topic: "trees",
        level: 4,
        ratedAt: "2026-08-27T12:00:00.000Z",
      },
    ]);
    expect(log.filters).toEqual([["user_id", "user-1"]]);
    expect(log.order).toEqual(["rated_at", { ascending: true }]);
  });

  it("throws when the insert fails", async () => {
    const log: InsertLog = {};
    const repository = new SupabaseConfidenceRepository(
      fakeInsertClient(log, { message: "row violates policy" }),
    );
    await expect(
      repository.add({ userId: "user-1", topic: "trees", level: 4 }),
    ).rejects.toThrow("row violates policy");
  });
});
