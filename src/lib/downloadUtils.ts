
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

`;

  if (problemData.generatedProblemType) {
    markdown += `## System Design Focus
**Problem Type:** ${problemData.generatedProblemType}

`;
  }

  markdown += `## Problem Statement
${problemData.problemStatement}

`;
  
  if (problemData.scaleEstimates) {
    markdown += `## Scale Estimates
${problemData.scaleEstimates}

`;
  }

  markdown += `## Solution
${problemData.solution}

`;

  if (problemData.capacityPlanning) {
    markdown += `## Capacity Planning
${problemData.capacityPlanning}

`;
  }
  
  markdown += `## Reasoning
${problemData.reasoning}

`;
  markdown += `## Key Concepts
${problemData.keyConcepts}

`;

  if (problemData.diagramDescription) {
    markdown += `## Diagram Description
${problemData.diagramDescription}

`;
  }

  // Note: The diagram image itself cannot be directly embedded in a portable way in markdown without hosting it.
  if (problemData.diagramImageUri) {
    markdown += `## Diagram
A diagram image was generated for this problem. Please refer to the application view or the provided image data URI if viewing this outside the application context.
(Image Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)

`;
  } else {
     markdown += `## Diagram
(No diagram image was generated for this problem)

`;
  }

  return markdown;
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
