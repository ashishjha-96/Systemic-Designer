/**
 * Sanitizes Mermaid code to fix common AI-generated syntax issues.
 * Handles: unquoted special chars in labels, markdown code fences, etc.
 */
export function sanitizeMermaidCode(code: string): string {
  // Strip markdown code fences if AI wrapped them
  code = code.replace(/^```(?:mermaid)?\s*\n?/gm, '').replace(/\n?\s*```$/gm, '').trim();

  const lines = code.split('\n');
  const sanitized: string[] = [];

  for (const line of lines) {
    let result = line;

    // Quote edge labels |...| that contain special characters
    // Match |text| where text has chars like () {} [] / and isn't already quoted
    result = result.replace(/\|([^"|][^|]*)\|/g, (_match, label: string) => {
      if (/[(){}[\]\/&<>]/.test(label)) {
        return `|"${label}"|`;
      }
      return `|${label}|`;
    });

    // Quote node labels in [...] that contain problematic characters
    // Match ID[Label] or ID[Label text] but NOT shape syntax like [(...)], [(...)]
    result = result.replace(/(\w+)\[([^\]]*)\]/g, (_match, id: string, label: string) => {
      // Skip if already quoted
      if (label.startsWith('"') && label.endsWith('"')) return `${id}[${label}]`;
      // Skip shape definitions: [(...)], [/...\], [\...\/], etc.
      if (/^[({/\\]/.test(label)) return `${id}[${label}]`;
      // Quote if label contains special characters that break parsing
      if (/[(){}\/&<>]/.test(label)) {
        return `${id}["${label}"]`;
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

  // Check for unquoted labels with special chars (most common AI mistake)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments and subgraph/end keywords
    if (line.startsWith('%%') || line === 'end' || line.startsWith('subgraph ') || line.startsWith('style ') || line.startsWith('classDef ')) continue;

    // Check for unquoted edge labels with special chars: |label with (parens)|
    const edgeLabelMatch = line.match(/\|([^"|][^|]*)\|/g);
    if (edgeLabelMatch) {
      for (const match of edgeLabelMatch) {
        const label = match.slice(1, -1);
        if (/[(){}[\]]/.test(label)) {
          return `Line ${i + 1}: Edge label "${label}" contains special characters that must be quoted. Use |"${label}"| instead of |${label}|`;
        }
      }
    }

    // Check for unquoted node labels with special chars: ID[label (with parens)]
    const nodeLabelMatch = line.match(/\w+\[([^\]"]*)\]/g);
    if (nodeLabelMatch) {
      for (const match of nodeLabelMatch) {
        const labelMatch = match.match(/\w+\[([^\]]*)\]/);
        if (labelMatch) {
          const label = labelMatch[1];
          // Skip shape syntax like [(...)], [/...\]
          if (/^[({/\\]/.test(label)) continue;
          if (/[(){}]/.test(label)) {
            return `Line ${i + 1}: Node label "${label}" contains special characters that must be quoted. Wrap it in double quotes.`;
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
