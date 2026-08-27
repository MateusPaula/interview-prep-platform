import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ptBR from "../../messages/pt-BR.json";

type MessageTree = { [key: string]: string | MessageTree };

function collectKeyPaths(tree: MessageTree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      return [path];
    }
    return collectKeyPaths(value, path);
  });
}

function collectLeaves(tree: MessageTree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      return [[path, value] as [string, string]];
    }
    return collectLeaves(value, path);
  });
}

describe("locale messages", () => {
  it("en and pt-BR expose identical key sets", () => {
    const enKeys = collectKeyPaths(en as MessageTree).sort();
    const ptKeys = collectKeyPaths(ptBR as MessageTree).sort();
    expect(ptKeys).toEqual(enKeys);
  });

  it("no message is empty in either locale", () => {
    for (const [path, value] of [
      ...collectLeaves(en as MessageTree),
      ...collectLeaves(ptBR as MessageTree),
    ]) {
      expect(value.trim(), path).not.toBe("");
    }
  });

  it("ICU placeholders match between locales", () => {
    const placeholderPattern = /\{[a-zA-Z]+[,}]/g;
    const enLeaves = new Map(collectLeaves(en as MessageTree));
    for (const [path, ptValue] of collectLeaves(ptBR as MessageTree)) {
      const enValue = enLeaves.get(path);
      expect(enValue, path).toBeDefined();
      const enPlaceholders = (enValue ?? "").match(placeholderPattern) ?? [];
      const ptPlaceholders = ptValue.match(placeholderPattern) ?? [];
      expect(ptPlaceholders.sort(), path).toEqual(enPlaceholders.sort());
    }
  });
});
