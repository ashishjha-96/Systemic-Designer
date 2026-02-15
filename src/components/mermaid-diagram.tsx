"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { sanitizeMermaidCode } from "@/lib/mermaid-utils";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    const renderDiagram = async () => {
      try {
        setError(null);

        // Apply client-side sanitization as a safety net
        const sanitized = sanitizeMermaidCode(chart);

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, sanitized);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram"
        );
      }
    };

    renderDiagram();
  }, [chart]);

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

  return (
    <div
      ref={containerRef}
      className={`flex justify-center [&_svg]:max-w-full [&_svg]:h-auto ${className ?? ""}`}
    />
  );
}
