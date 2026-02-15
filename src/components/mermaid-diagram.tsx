"use client";

import { useCallback, useEffect, useState } from "react";
import mermaid from "mermaid";
import { sanitizeMermaidCode } from "@/lib/mermaid-utils";
import { Maximize2, X, ChevronDown, ChevronUp } from "lucide-react";
import { createPortal } from "react-dom";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

/** Remove any DOM elements mermaid injected for a given render ID. */
function cleanupMermaidElements(id: string) {
  document.getElementById(id)?.remove();
  document
    .querySelectorAll(`[data-mermaid-id="${id}"], #d${id}`)
    .forEach((el) => el.remove());
}

/** Strip edge labels (|...|) from mermaid code so dagre doesn't need to position them. */
function stripEdgeLabels(code: string): string {
  return code
    .split("\n")
    .map((line) => line.replace(/\|[^|]*\|/g, ""))
    .join("\n");
}

/** Remove subgraph/end blocks but keep all nodes and edges with labels intact. */
function flattenSubgraphs(code: string): string {
  return code
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        !trimmed.startsWith("subgraph ") &&
        trimmed !== "end"
      );
    })
    .join("\n");
}

/** Replace "graph" with "flowchart" keyword. */
function useFlowchartKeyword(code: string): string {
  return code.replace(/^graph\s+/i, "flowchart ");
}

/** Mermaid config presets. */
const BASE_CONFIG = {
  startOnLoad: false,
  theme: "default" as const,
  securityLevel: "loose" as const,
  fontFamily: "inherit",
};

const RELAXED_CONFIG = {
  ...BASE_CONFIG,
  flowchart: { curve: "basis", nodeSpacing: 60, rankSpacing: 60 },
};

const WIDE_CONFIG = {
  ...BASE_CONFIG,
  flowchart: { curve: "basis", nodeSpacing: 80, rankSpacing: 80 },
};

type DegradationLevel = "none" | "simplified" | "no-labels";

interface RenderAttempt {
  config: typeof BASE_CONFIG & { flowchart?: Record<string, unknown> };
  transformCode?: (code: string) => string;
  degradation: DegradationLevel;
}

const RENDER_ATTEMPTS: RenderAttempt[] = [
  // 1. Default
  { config: BASE_CONFIG, degradation: "none" },
  // 2. Smoother curves + more spacing
  { config: RELAXED_CONFIG, degradation: "none" },
  // 3. Switch to "flowchart" keyword + more spacing
  { config: WIDE_CONFIG, transformCode: useFlowchartKeyword, degradation: "none" },
  // 4. Flatten subgraphs (removes grouping boxes, keeps all labels)
  { config: RELAXED_CONFIG, transformCode: flattenSubgraphs, degradation: "simplified" },
  // 5. Flatten + flowchart
  { config: WIDE_CONFIG, transformCode: (c) => useFlowchartKeyword(flattenSubgraphs(c)), degradation: "simplified" },
  // 6. Last resort: strip edge labels entirely
  { config: RELAXED_CONFIG, transformCode: stripEdgeLabels, degradation: "no-labels" },
];

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [degradation, setDegradation] = useState<DegradationLevel>("none");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render mermaid chart to SVG string, retrying with relaxed configs on failure
  useEffect(() => {
    if (!chart) return;

    const renderDiagram = async () => {
      setError(null);
      setDegradation("none");
      const sanitized = sanitizeMermaidCode(chart);

      for (let attempt = 0; attempt < RENDER_ATTEMPTS.length; attempt++) {
        const id = `mermaid-${Date.now()}-${attempt}`;
        const { config, transformCode, degradation: level } = RENDER_ATTEMPTS[attempt];
        const code = transformCode ? transformCode(sanitized) : sanitized;
        try {
          mermaid.initialize(config);
          const { svg } = await mermaid.render(id, code);
          setSvgContent(svg);
          setDegradation(level);
          return; // success
        } catch (err) {
          cleanupMermaidElements(id);
          if (attempt === RENDER_ATTEMPTS.length - 1) {
            console.error("Mermaid rendering error:", err);
            setError(
              err instanceof Error ? err.message : "Failed to render diagram"
            );
          }
        }
      }
    };

    renderDiagram();
  }, [chart]);

  // Close on Escape + lock body scroll
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const openFullscreen = useCallback(() => setIsFullscreen(true), []);
  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">
          Failed to render diagram. Showing raw Mermaid code:
        </p>
        <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svgContent) return null;

  const degradationMessage =
    degradation === "simplified"
      ? "Subgraph groupings were removed to render this complex diagram."
      : degradation === "no-labels"
        ? "Edge labels were removed to render this complex diagram."
        : null;

  return (
    <>
      {degradationMessage && (
        <div className="mb-3 space-y-2">
          <p className="text-xs text-muted-foreground">{degradationMessage}</p>
          <button
            onClick={() => setShowRawCode((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showRawCode ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showRawCode ? "Hide" : "Show"} raw Mermaid code
          </button>
          {showRawCode && (
            <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
              {chart}
            </pre>
          )}
        </div>
      )}
      {/*
        KEY: Only ONE copy of the SVG is ever in the DOM.
        When fullscreen is open, the inline version is fully unmounted
        to prevent duplicate SVG IDs from breaking rendering.
      */}
      {!isFullscreen && (
        <div className={`relative group ${className ?? ""}`}>
          <button
            onClick={openFullscreen}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-card/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            title="View fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <div
            className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      )}

      {isFullscreen && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          Diagram is shown in fullscreen mode
        </div>
      )}

      {isFullscreen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-background flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0 bg-card">
              <span className="text-sm font-medium text-muted-foreground">
                Architecture Diagram
              </span>
              <button
                onClick={closeFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-background">
              <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="w-full h-full flex items-center justify-center [&_svg]:!w-full [&_svg]:!max-w-full [&_svg]:!h-auto [&_svg]:!max-h-[calc(100vh-6rem)]"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
