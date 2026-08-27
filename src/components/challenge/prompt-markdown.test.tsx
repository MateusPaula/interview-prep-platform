import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptMarkdown } from "./prompt-markdown";

describe("PromptMarkdown", () => {
  it("renders headings", () => {
    render(<PromptMarkdown text={"## Examples\nSome text"} />);
    expect(
      screen.getByRole("heading", { name: "Examples" }),
    ).toBeInTheDocument();
  });

  it("renders fenced code blocks in a code element", () => {
    render(
      <PromptMarkdown
        text={"Intro\n```\nInput: [2,7]\nOutput: [0,1]\n```"}
      />,
    );
    const code = screen.getByText(/Input: \[2,7\]/);
    expect(code.closest("pre")).not.toBeNull();
  });

  it("renders inline code and bold segments", () => {
    render(
      <PromptMarkdown text={"Return the `indices` of the **two** numbers."} />,
    );
    expect(screen.getByText("indices").tagName).toBe("CODE");
    expect(screen.getByText("two").tagName).toBe("STRONG");
  });

  it("renders bullet lists as list items", () => {
    render(
      <PromptMarkdown
        text={"Constraints:\n- 2 <= n <= 10^4\n- one valid answer"}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("2 <= n <= 10^4");
  });

  it("splits paragraphs on blank lines", () => {
    const { container } = render(
      <PromptMarkdown text={"First paragraph.\n\nSecond paragraph."} />,
    );
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });
});
