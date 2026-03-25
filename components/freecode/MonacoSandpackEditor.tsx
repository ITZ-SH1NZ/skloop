"use client";

import { useActiveCode, useSandpack } from "@codesandbox/sandpack-react";
import React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";

// Configure Monaco loader
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } });

const skloopTheme = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: 'A1A1AA', fontStyle: 'italic' },
    { token: 'keyword', foreground: '000000', fontStyle: 'bold' },
    { token: 'string', foreground: '16A34A' },
    { token: 'number', foreground: 'D97706' },
    { token: 'delimiter', foreground: '71717A' },
    { token: 'tag', foreground: '000000', fontStyle: 'bold' },
    { token: 'attribute.name', foreground: '4F46E5' },
    { token: 'attribute.value', foreground: '16A34A' },
  ],
  colors: {
    'editor.background': '#FDFCF8',
    'editor.foreground': '#1A1A1A',
    'editorCursor.foreground': '#1A1A1A',
    'editor.lineHighlightBackground': '#F3F4F6',
    'editorLineNumber.foreground': '#D1D5DB',
    'editorLineNumber.activeForeground': '#1A1A1A',
    'editor.selectionBackground': '#D4F268',
    'editorBracketMatch.background': '#D4F268',
    'editorBracketMatch.border': '#D4F268',
  }
};

export function MonacoSandpackEditor() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const activeFile = sandpack.activeFile;

  const handleBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme('skloop-theme', skloopTheme);
    emmetHTML(monaco);
    emmetCSS(monaco);
  };

  return (
    <div className="absolute inset-0">
      <Editor
        path={activeFile}
        height="100%"
        language={activeFile.endsWith('.ts') || activeFile.endsWith('.tsx') ? "typescript" : activeFile.endsWith('.html') ? "html" : activeFile.endsWith('.css') ? "css" : activeFile.endsWith('.json') ? "json" : "javascript"}
        value={code}
        onChange={(value: string | undefined) => updateCode(value || "")}
        theme="skloop-theme"
        beforeMount={handleBeforeMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          renderLineHighlight: "all",
        }}
      />
    </div>
  );
}
