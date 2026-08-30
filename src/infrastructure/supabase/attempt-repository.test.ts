import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewAttempt } from "@/core/domain";
import { SupabaseAttemptRepository } from "./attempt-repository";

interface AttemptRowFixture {
  id: string;
  user_id: string;
  challenge_id: string;
  topic: string;
  difficulty: string;
  outcome: string;
  hints_used: number;
  time_spent_seconds: number;
  attempted_at: string;
}

interface InsertLog {
  table?: string;
  payload?: Record<string, unknown>;
  columns?: string;
}

interface ListLog {
  table?: string;
  columns?: string;
  filters: Array<[string, unknown]>;
  order?: [string, { ascending: boolean }];
}

const storedRow: AttemptRowFixture = {
  id: "attempt-1",
  user_id: "user-1",
  challenge_id: "ch-2",
  topic: "graphs",
  difficulty: "medium",
  outcome: "solved_with_hints",
  hints_used: 2,
  time_spent_seconds: 900,
  attempted_at: "2026-08-27T12:00:00+00:00",
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
            select(columns: string) {
              log.columns = columns;
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
  rows: AttemptRowFixture[],
  log: ListLog,
  error: { message: string } | null = null,
): SupabaseClient {
  return {
    from(table: string) {
      log.table = table;
      return {
        select(columns: string) {
          log.columns = columns;
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

const newAttempt: NewAttempt = {
  userId: "user-1",
  challengeId: "ch-2",
  topic: "graphs",
  difficulty: "medium",
  outcome: "solved_with_hints",
  hintsUsed: 2,
  timeSpentSeconds: 900,
};

describe("SupabaseAttemptRepository", () => {
  it("inserts a snake_case row and returns the mapped attempt", async () => {
    const log: InsertLog = {};
    const repository = new SupabaseAttemptRepository(fakeInsertClient(log));
    const attempt = await repository.add(newAttempt);
    expect(log.table).toBe("attempts");
    expect(log.payload).toEqual({
      user_id: "user-1",
      challenge_id: "ch-2",
      topic: "graphs",
      difficulty: "medium",
      outcome: "solved_with_hints",
      hints_used: 2,
      time_spent_seconds: 900,
    });
    expect(attempt).toEqual({
      id: "attempt-1",
      userId: "user-1",
      challengeId: "ch-2",
      topic: "graphs",
      difficulty: "medium",
      outcome: "solved_with_hints",
      hintsUsed: 2,
      timeSpentSeconds: 900,
      attemptedAt: "2026-08-27T12:00:00.000Z",
    });
  });

  it("lists attempts for a user ordered by attempted_at", async () => {
    const log: ListLog = { filters: [] };
    const repository = new SupabaseAttemptRepository(
      fakeListClient([storedRow], log),
    );
    const attempts = await repository.listByUser("user-1");
    expect(attempts).toHaveLength(1);
    expect(attempts[0].attemptedAt).toBe("2026-08-27T12:00:00.000Z");
    expect(log.filters).toEqual([["user_id", "user-1"]]);
    expect(log.order).toEqual(["attempted_at", { ascending: true }]);
  });

  it("throws when the insert fails", async () => {
    const log: InsertLog = {};
    const repository = new SupabaseAttemptRepository(
      fakeInsertClient(log, { message: "row violates policy" }),
    );
    await expect(repository.add(newAttempt)).rejects.toThrow(
      "row violates policy",
    );
  });

  it("throws when the list query fails", async () => {
    const log: ListLog = { filters: [] };
    const repository = new SupabaseAttemptRepository(
      fakeListClient([], log, { message: "connection refused" }),
    );
    await expect(repository.listByUser("user-1")).rejects.toThrow(
      "connection refused",
    );
  });
});
