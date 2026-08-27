"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useChallengeSessionStore } from "@/stores/challenge-session-store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

function EditorLoading() {
  return (
    <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-line bg-raised">
      <EditorLoadingLabel />
    </div>
  );
}

function EditorLoadingLabel() {
  const t = useTranslations("challenge");
  return <span className="text-sm text-ink-muted">{t("editorLoading")}</span>;
}

export function CodeEditor() {
  const code = useChallengeSessionStore((state) => state.code);
  const setCode = useChallengeSessionStore((state) => state.setCode);

  return (
    <div className="h-full min-h-64 overflow-hidden rounded-lg border border-line">
      <MonacoEditor
        height="100%"
        defaultLanguage="typescript"
        theme="prep-dark"
        value={code}
        onChange={(next) => setCode(next ?? "")}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("prep-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#141419",
              "editor.lineHighlightBackground": "#1b1b23",
              "editorLineNumber.foreground": "#4a4a56",
              "editorLineNumber.activeForeground": "#a2a2b0",
              "editorGutter.background": "#141419",
            },
          });
        }}
        options={{
          fontSize: 14,
          fontFamily:
            'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "line",
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}
