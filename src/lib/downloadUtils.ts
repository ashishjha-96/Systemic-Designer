
import type { GenerateSystemDesignProblemOutput } from "@/ai/flows/generate-system-design-problem";

// Helper function to strip Markdown
function stripMarkdown(markdown: string): string {
  // Remove headers (e.g., #, ##, ###)
  let text = markdown.replace(/^#+\s+/gm, '');
  // Remove bold/italic (e.g., **, __, *, _)
  text = text.replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2');
  // Remove code blocks (```...```) - Keep content
   text = text.replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '\n---\n')); // Replace fences with separators
  // Remove inline code (`)
  text = text.replace(/`([^`]+)`/g, '$1');
  // Remove links but keep text ([text](url))
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove images (![alt](url))
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  // Remove horizontal rules (---, ***, ___)
  text = text.replace(/^(---|___|\*\*\*)\s*$/gm, '\n--------------------\n');
  // Remove blockquotes (> )
  text = text.replace(/^>\s+/gm, '');
  // Handle lists (*, -, 1.) - basic conversion
  text = text.replace(/^(\*|-|\d+\.)\s+/gm, '- '); 
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim whitespace
  text = text.trim();
  return text;
}


export function generateMarkdownContent(problemData: GenerateSystemDesignProblemOutput): string {
  let markdown = `# System Design Problem: ${problemData.generatedProblemType || 'Generated Problem'}
`; // Main title

  if (problemData.generatedProblemType) {
    // Add a specific section for the problem type if it exists
    markdown += `
## System Design Focus
**Problem Type:** ${problemData.generatedProblemType}
`;
  }

  // Append content directly from problemData, assuming headers are included in the AI response
  markdown += `
${problemData.problemStatement}
`;
  
  if (problemData.scaleEstimates) {
    markdown += `
${problemData.scaleEstimates}
`;
  }

  markdown += `
${problemData.solution}
`;

  if (problemData.capacityPlanning) {
    markdown += `
${problemData.capacityPlanning}
`;
  }
  
  markdown += `
${problemData.reasoning}
`;
  markdown += `
## Key Concepts
${problemData.keyConcepts} 
`; // Key concepts might not have a header from AI, so keep it

  if (problemData.diagramDescription) {
    markdown += `
## Diagram Description 
${problemData.diagramDescription} 
`; // Diagram description might not have a header from AI
  }

  // Handle Diagram section separately
  markdown += `
## Diagram
`;
  if (problemData.diagramImageUri) {
    markdown += `A diagram image was generated for this problem. Please refer to the application view or the provided image data URI if viewing this outside the application context.
(Image Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)
`;
  } else {
     markdown += `(No diagram image was generated for this problem)
`;
  }

  return markdown.trim() + '\n'; // Ensure a single newline at the end
}


export function generatePlainTextContent(problemData: GenerateSystemDesignProblemOutput): string {
  let text = `SYSTEM DESIGN PROBLEM: ${problemData.generatedProblemType || 'Generated Problem'}
========================================

SYSTEM DESIGN FOCUS
-------------------
Problem Type: ${problemData.generatedProblemType || 'N/A'}

PROBLEM STATEMENT
-----------------
${stripMarkdown(problemData.problemStatement)}

`;
  
  if (problemData.scaleEstimates) {
    text += `SCALE ESTIMATES
---------------
${stripMarkdown(problemData.scaleEstimates)}

`;
  }

  text += `SOLUTION
--------
${stripMarkdown(problemData.solution)}

`;

  if (problemData.capacityPlanning) {
    text += `CAPACITY PLANNING
-----------------
${stripMarkdown(problemData.capacityPlanning)}

`;
  }
  
  text += `REASONING
---------
${stripMarkdown(problemData.reasoning)}

`;
  text += `KEY CONCEPTS
------------
${stripMarkdown(problemData.keyConcepts)}

`;

  if (problemData.diagramDescription) {
    text += `DIAGRAM DESCRIPTION
-------------------
${stripMarkdown(problemData.diagramDescription)}

`;
  }

  if (problemData.diagramImageUri) {
    text += `DIAGRAM
-------
A diagram image was generated for this problem. Please refer to the application view.
(Image Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)

`;
  } else {
     text += `DIAGRAM
-------
(No diagram image was generated for this problem)

`;
  }

  return text;
}
