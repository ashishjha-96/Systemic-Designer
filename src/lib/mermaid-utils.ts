/**
 * Sanitizes Mermaid code to fix common AI-generated syntax issues.
 * Handles: malformed arrows, unquoted special chars, inner quotes,
 * markdown code fences, incomplete edges, duplicate node definitions, etc.
 */
export function sanitizeMermaidCode(code: string): string {
  // Strip markdown code fences if AI wrapped them
  code = code.replace(/^```(?:mermaid)?\s*\n?/gm, '').replace(/\n?\s*```$/gm, '').trim();

  const lines = code.split('\n');
  const sanitized: string[] = [];

  for (const line of lines) {
    let result = line;

    // --- Fix malformed arrow syntax (before other transforms) ---

    // Fix "--.->": extra dash before dotted arrow → "-.->"
    result = result.replace(/-{2,}\.\->/g, '-.->');
    // Fix "--..->": double dots → "-.->"
    result = result.replace(/-+\.{2,}-*>/g, '-.->');
    // Fix stray arrow fragments after edge labels: "|label|.->", "|label|-->" etc.
    result = result.replace(/(\|[^|]*\|)\s*\.?-+>/g, '$1');

    // Fix incomplete edges: "NodeA -- "some label"" with no target node → drop the line
    // (An edge like `Node -- "text"` without a target is invalid)
    if (/^\s*\w+\s+--\s+"[^"]*"\s*$/.test(result)) {
      continue; // skip this line entirely
    }

    // --- Fix quoted strings used as node IDs ---
    // AI sometimes writes: -->|label| "Some Name"([...]) or "Some Name"[...]
    // Node IDs can't be quoted strings — convert to valid camelCase IDs.
    result = result.replace(/"([^"]+)"\s*(\(?\[|\(?\()/g, (_match, name: string, shape: string) => {
      const id = name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
      return `${id}${shape}`;
    });

    // --- Quote edge labels |...| that contain special characters or inner quotes ---
    result = result.replace(/\|([^|]+)\|/g, (_match, label: string) => {
      const trimmed = label.trim();
      // Already properly quoted
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return `|${label}|`;
      // Contains special chars or inner quotes — strip inner quotes and wrap
      if (/[(){}[\]\/&<>"]/.test(trimmed)) {
        const cleaned = trimmed.replace(/"/g, "'");
        return `|"${cleaned}"|`;
      }
      return `|${label}|`;
    });

    // --- Quote node labels in [...] that contain problematic characters or inner quotes ---
    result = result.replace(/(\w+)\[([^\]]*)\]/g, (_match, id: string, label: string) => {
      // Already properly quoted (starts and ends with ")
      if (label.startsWith('"') && label.endsWith('"')) {
        // Check for inner quotes that would break it: ["foo "bar" baz"]
        const inner = label.slice(1, -1);
        if (inner.includes('"')) {
          return `${id}["${inner.replace(/"/g, "'")}"]`;
        }
        return `${id}[${label}]`;
      }
      // Skip shape definitions: [(...)], [/...\], [\...\/], etc.
      if (/^[({/\\]/.test(label)) return `${id}[${label}]`;
      // Contains special chars or inner quotes — strip inner quotes and wrap
      if (/[(){}\/&<>"]/.test(label)) {
        const cleaned = label.replace(/"/g, "'");
        return `${id}["${cleaned}"]`;
      }
      return `${id}[${label}]`;
    });

    sanitized.push(result);
  }

  return sanitized.join('\n');
}

/**
 * Lightweight server-side Mermaid syntax validator.
 * Returns an error message if issues are detected, null if it looks valid.
 * This doesn't fully parse Mermaid but catches common AI-generated mistakes.
 */
export function validateMermaidSyntax(code: string): string | null {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length === 0) return 'Empty diagram code';

  // Must start with a valid diagram type
  const firstLine = lines[0].toLowerCase();
  if (!/^(graph|flowchart|sequencediagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitgraph)\s/i.test(lines[0]) &&
      !firstLine.startsWith('graph ') && !firstLine.startsWith('flowchart ')) {
    return `Diagram must start with a valid type (e.g., "graph TD" or "flowchart TD"), but starts with: "${lines[0]}"`;
  }

  // Check for problematic labels (most common AI mistakes)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments and subgraph/end keywords
    if (line.startsWith('%%') || line === 'end' || line.startsWith('subgraph ') || line.startsWith('style ') || line.startsWith('classDef ')) continue;

    // Check for unquoted edge labels with special chars or inner quotes
    const edgeLabelMatch = line.match(/\|([^|]+)\|/g);
    if (edgeLabelMatch) {
      for (const match of edgeLabelMatch) {
        const label = match.slice(1, -1).trim();
        if (label.startsWith('"') && label.endsWith('"')) continue; // properly quoted
        if (/[(){}[\]"]/.test(label)) {
          return `Line ${i + 1}: Edge label "${label}" contains special characters that must be quoted.`;
        }
      }
    }

    // Check for unquoted node labels with special chars or inner quotes
    const nodeLabelMatch = line.match(/\w+\[([^\]]*)\]/g);
    if (nodeLabelMatch) {
      for (const match of nodeLabelMatch) {
        const labelMatch = match.match(/\w+\[([^\]]*)\]/);
        if (labelMatch) {
          const label = labelMatch[1];
          // Skip shape syntax like [(...)], [/...\]
          if (/^[({/\\]/.test(label)) continue;
          // Skip properly quoted
          if (label.startsWith('"') && label.endsWith('"') && !label.slice(1, -1).includes('"')) continue;
          if (/[(){}"]/.test(label)) {
            return `Line ${i + 1}: Node label "${label}" contains special characters or inner quotes that must be fixed.`;
          }
        }
      }
    }
  }

  // Check balanced subgraphs
  let subgraphCount = 0;
  for (const line of lines) {
    if (line.startsWith('subgraph ')) subgraphCount++;
    if (line === 'end') subgraphCount--;
  }
  if (subgraphCount > 0) return `${subgraphCount} unclosed subgraph block(s) - missing 'end' keyword(s)`;
  if (subgraphCount < 0) return `${Math.abs(subgraphCount)} extra 'end' keyword(s) without matching subgraph`;

  return null; // Looks valid
}
