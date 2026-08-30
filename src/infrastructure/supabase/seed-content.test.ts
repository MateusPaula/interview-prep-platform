import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BEHAVIORAL_CATEGORIES,
  DIFFICULTIES,
  TOPICS,
  isDifficulty,
  isTopic,
} from "@/core/domain";

const seedSql = readFileSync(
  path.join(process.cwd(), "supabase", "seed.sql"),
  "utf8",
);

interface SeededChallenge {
  title: string;
  topic: string;
  difficulty: string;
  prompt: string;
  starterCode: string;
}

function parseChallenges(sql: string): SeededChallenge[] {
  const pattern =
    /\('((?:[^']|'')+)', '([a-z-]+)', '([a-z]+)', \$md\$([\s\S]*?)\$md\$, \$ts\$([\s\S]*?)\$ts\$\)/g;
  const challenges: SeededChallenge[] = [];
  for (const match of sql.matchAll(pattern)) {
    challenges.push({
      title: match[1],
      topic: match[2],
      difficulty: match[3],
      prompt: match[4],
      starterCode: match[5],
    });
  }
  return challenges;
}

function parseQuestionCategories(sql: string): string[] {
  const pattern = /\('([a-z]+)', \$q\$[\s\S]*?\$q\$\)/g;
  return [...sql.matchAll(pattern)].map((match) => match[1]);
}

describe("seeded challenges", () => {
  const challenges = parseChallenges(seedSql);

  it("contains at least 24 challenges", () => {
    expect(challenges.length).toBeGreaterThanOrEqual(24);
  });

  it("only uses topics and difficulties from the domain", () => {
    for (const challenge of challenges) {
      expect(isTopic(challenge.topic)).toBe(true);
      expect(isDifficulty(challenge.difficulty)).toBe(true);
    }
  });

  it("covers every topic at least twice", () => {
    for (const topic of TOPICS) {
      const count = challenges.filter(
        (challenge) => challenge.topic === topic,
      ).length;
      expect(count, topic).toBeGreaterThanOrEqual(2);
    }
  });

  it("covers every difficulty", () => {
    for (const difficulty of DIFFICULTIES) {
      expect(
        challenges.some((challenge) => challenge.difficulty === difficulty),
        difficulty,
      ).toBe(true);
    }
  });

  it("gives every challenge a markdown prompt with examples and constraints", () => {
    for (const challenge of challenges) {
      const exampleCount =
        challenge.prompt.match(/### Example \d/g)?.length ?? 0;
      expect(exampleCount, challenge.title).toBeGreaterThanOrEqual(2);
      expect(challenge.prompt, challenge.title).toContain("## Constraints");
    }
  });

  it("gives every challenge typed TypeScript starter code", () => {
    for (const challenge of challenges) {
      expect(challenge.starterCode, challenge.title).toContain(
        "export function",
      );
    }
  });

  it("has unique titles", () => {
    const titles = challenges.map((challenge) => challenge.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("seeded behavioral questions", () => {
  const categories = parseQuestionCategories(seedSql);

  it("contains at least 12 questions", () => {
    expect(categories.length).toBeGreaterThanOrEqual(12);
  });

  it("covers every category", () => {
    for (const category of BEHAVIORAL_CATEGORIES) {
      expect(categories, category).toContain(category);
    }
  });
});
