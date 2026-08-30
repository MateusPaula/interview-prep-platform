import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match = pattern.exec(text);
  let key = 0;
  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-raised px-1 py-0.5 font-mono text-[0.85em] text-accent-ink"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    }
    key += 1;
    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

type Block =
  | { kind: "heading"; text: string }
  | { kind: "code"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let index = 0;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  }

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("```")) {
      flushParagraph();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ kind: "code", text: codeLines.join("\n") });
      index += 1;
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      flushParagraph();
      blocks.push({ kind: "heading", text: line.replace(/^#{1,4}\s/, "") });
      index += 1;
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s/, ""));
        index += 1;
      }
      blocks.push({ kind: "list", items });
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      index += 1;
      continue;
    }
    paragraph.push(line);
    index += 1;
  }
  flushParagraph();
  return blocks;
}

interface PromptMarkdownProps {
  text: string;
}

export function PromptMarkdown({ text }: PromptMarkdownProps) {
  const blocks = parseBlocks(text);
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h3
              key={index}
              className="mt-2 text-xs font-semibold uppercase tracking-widest text-ink-secondary"
            >
              {block.text}
            </h3>
          );
        }
        if (block.kind === "code") {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg border border-line bg-raised p-3 font-mono text-xs leading-relaxed text-ink-secondary"
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.kind === "list") {
          return (
            <ul
              key={index}
              className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-ink-secondary marker:text-ink-muted"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={index}
            className="text-sm leading-relaxed text-ink-secondary"
          >
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
