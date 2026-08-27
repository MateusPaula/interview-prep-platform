import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseBehavioralRepository } from "./behavioral-repository";

interface QuestionRowFixture {
  id: string;
  category: string;
  question: string;
}

interface QueryLog {
  table?: string;
  columns?: string;
  filters: Array<[string, unknown]>;
}

type ResolveHandler = (value: {
  data: QuestionRowFixture[] | null;
  error: { message: string } | null;
}) => unknown;

function fakeClient(
  rows: QuestionRowFixture[],
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

const row: QuestionRowFixture = {
  id: "bq-1",
  category: "conflict",
  question: "Tell me about a disagreement with a teammate.",
};

describe("SupabaseBehavioralRepository", () => {
  it("lists all questions mapped to the domain shape", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseBehavioralRepository(fakeClient([row], log));
    expect(await repository.listQuestions()).toEqual([
      {
        id: "bq-1",
        category: "conflict",
        question: "Tell me about a disagreement with a teammate.",
      },
    ]);
    expect(log.table).toBe("behavioral_questions");
    expect(log.columns).toBe("id, category, question");
  });

  it("finds a question by id", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseBehavioralRepository(fakeClient([row], log));
    const question = await repository.findQuestionById("bq-1");
    expect(question?.category).toBe("conflict");
    expect(log.filters).toEqual([["id", "bq-1"]]);
  });

  it("returns null when the question is missing", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseBehavioralRepository(fakeClient([row], log));
    expect(await repository.findQuestionById("missing")).toBeNull();
  });

  it("throws when the query fails", async () => {
    const log: QueryLog = { filters: [] };
    const repository = new SupabaseBehavioralRepository(
      fakeClient([row], log, { message: "connection refused" }),
    );
    await expect(repository.listQuestions()).rejects.toThrow(
      "connection refused",
    );
  });
});
