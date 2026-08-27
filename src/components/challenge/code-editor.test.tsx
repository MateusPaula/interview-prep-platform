import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";
import { renderWithIntl } from "../testing/render-with-intl";
import { CodeEditor } from "./code-editor";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (next: string | undefined) => void;
  }) => (
    <textarea
      aria-label="code editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const challenge = {
  id: "ch-1",
  title: "Two Sum",
  prompt: "Find the pair.",
  topic: "arrays",
  difficulty: "easy",
  starterCode: "function twoSum() {}",
} as const;

describe("CodeEditor", () => {
  beforeEach(() => {
    useChallengeSessionStore.getState().clear();
    useChallengeSessionStore.getState().initialize(challenge);
  });

  afterEach(() => {
    useChallengeSessionStore.getState().clear();
  });

  it("seeds the editor with the session code", async () => {
    renderWithIntl(<CodeEditor />);
    const editor = await screen.findByLabelText("code editor");
    expect(editor).toHaveValue("function twoSum() {}");
  });

  it("writes edits back to the session store", async () => {
    const user = userEvent.setup();
    renderWithIntl(<CodeEditor />);
    const editor = await screen.findByLabelText("code editor");
    await user.type(editor, "!");
    expect(useChallengeSessionStore.getState().code).toBe(
      "function twoSum() {}!",
    );
  });
});
