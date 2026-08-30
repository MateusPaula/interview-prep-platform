import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseChallengeRepository } from "./challenge-repository";

interface ChallengeRowFixture {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  difficulty: string;
  starter_code: string;
}

interface QueryLog {
  table?: string;
  columns?: string;
  filters: Array<[string, unknown]>;
}

type ResolveHandler = (value: {
  data: ChallengeRowFixture[] | null;
  error: { message: string } | null;
}) => unknown;

function fakeClient(
  rows: ChallengeRowFixture[],
  log: QueryLog,
  error: { message: string } | null = null,
): SupabaseClient {
  return {
    from(table: string) {
      log.table = table;
      return {
        select(columns: string) {
          log.columns = columns;
          return {
            then(resolve: ResolveHandler) {
              return Promise.resolve({
                data: error ? null : rows,
                error,
              }).then(resolve);
            },
            eq(column: string, value: unknown) {
              log.filters.push([column, value]);
              return {
                async maybeSingle() {
                  if (error) {
                    return { data: null, error };
                  }
                  const match =
                    rows.find((row) => row.id === value) ?? null;
                  return { data: match, error: null };
                },
              };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
}

const row: ChallengeRowFixture = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Find two numbers adding up to the target.",
  topic: "arrays",
  difficulty: "easy",
  starter_code: "function twoSum() {}",
};

describe("SupabaseChallengeRepository", () => {
  it("lists all challenges mapped to the domain shape", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseChallengeRepository(fakeClient([row], log));
    const challenges = await repository.listAll();
    expect(challenges).toEqual([
      {
        id: "ch-1",
        title: "Two Sum",
        prompt: "Find two numbers adding up to the target.",
        topic: "arrays",
        difficulty: "easy",
        starterCode: "function twoSum() {}",
      },
    ]);
    expect(log.table).toBe("challenges");
    expect(log.columns).toBe(
      "id, title, prompt, topic, difficulty, starter_code",
    );
  });

  it("finds a challenge by id", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseChallengeRepository(fakeClient([row], log));
    const challenge = await repository.findById("ch-1");
    expect(challenge?.title).toBe("Two Sum");
    expect(log.filters).toEqual([["id", "ch-1"]]);
  });

  it("returns null when the challenge is missing", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseChallengeRepository(fakeClient([row], log));
    expect(await repository.findById("missing")).toBeNull();
  });

  it("throws when the query fails", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseChallengeRepository(
      fakeClient([row], log, { message: "connection refused" }),
    );
    await expect(repository.listAll()).rejects.toThrow("connection refused");
    await expect(repository.findById("ch-1")).rejects.toThrow(
      "connection refused",
    );
  });
});
