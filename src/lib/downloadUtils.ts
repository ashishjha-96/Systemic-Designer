
import jsPDF from 'jspdf';
import type { GenerateSystemDesignProblemOutput } from "@/ai/flows/generate-system-design-problem";

// Helper function to strip Markdown - enhanced slightly for PDF basic formatting
function stripMarkdown(markdown: string | undefined | null): string {
  if (!markdown) return '';
  let text = markdown;
  // Basic headers -> maybe add newline before
  text = text.replace(/^#+\s+/gm, '\n');
  // Bold/italic
  text = text.replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2');
  // Code blocks - keep content, add separators
  text = text.replace(/```[\s\S]*?```/g, (match) => '\n---\n' + match.replace(/```/g, '').trim() + '\n---\n');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  // Links - keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Images - remove
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  // Horizontal rules
  text = text.replace(/^(---|___|\*\*\*)\s*$/gm, '\n--------------------\n');
  // Blockquotes - remove '>'
  text = text.replace(/^>\s+/gm, '');
  // Lists - basic conversion
  text = text.replace(/^(\*|-|\d+\.)\s+/gm, ' - ');
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim whitespace
  return text.trim();
}

// Generate Markdown content
export function generateMarkdownContent(problemData: GenerateSystemDesignProblemOutput): string {
  let markdown = `# System Design Problem: ${problemData.generatedProblemType || 'Generated Problem'}
`;

  if (problemData.generatedProblemType) {
    markdown += `
## System Design Focus
**Problem Type:** ${problemData.generatedProblemType}
`;
  }

  if (problemData.problemStatement) {
    markdown += `
## Problem Statement
${problemData.problemStatement}
`;
  }

  if (problemData.scaleEstimates) {
    markdown += `
## Scale Estimates
${problemData.scaleEstimates}
`;
  }

  if (problemData.solution) {
    markdown += `
## Solution
${problemData.solution}
`;
  }

  if (problemData.capacityPlanning) {
    markdown += `
## Capacity Planning
${problemData.capacityPlanning}
`;
  }

  if (problemData.reasoning) {
    markdown += `
## Reasoning
${problemData.reasoning}
`;
  }

  if (problemData.keyConcepts) {
    markdown += `
## Key Concepts
${problemData.keyConcepts}
`;
  }

  if (problemData.diagramDescription) {
    markdown += `
## Diagram Description
${problemData.diagramDescription}
`;
  }

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

  return markdown.trim() + '\n';
}

// Generate Plain Text content
export function generatePlainTextContent(problemData: GenerateSystemDesignProblemOutput): string {
  let text = `SYSTEM DESIGN PROBLEM: ${problemData.generatedProblemType || 'Generated Problem'}
========================================
`;

  if (problemData.generatedProblemType) {
    text += `
SYSTEM DESIGN FOCUS
-------------------
Problem Type: ${problemData.generatedProblemType}

`;
  }

  text += `PROBLEM STATEMENT
-----------------
${stripMarkdown(problemData.problemStatement)}

`;

  if (problemData.scaleEstimates) {
    text += `SCALE ESTIMATES
---------------
${stripMarkdown(problemData.scaleEstimates)}

`;
  }

  if (problemData.solution) {
    text += `SOLUTION
--------
${stripMarkdown(problemData.solution)}

`;
  }

  if (problemData.capacityPlanning) {
    text += `CAPACITY PLANNING
-----------------
${stripMarkdown(problemData.capacityPlanning)}

`;
  }

  if (problemData.reasoning) {
    text += `REASONING
---------
${stripMarkdown(problemData.reasoning)}

`;
  }

  if (problemData.keyConcepts) {
    text += `KEY CONCEPTS
------------
${stripMarkdown(problemData.keyConcepts)}

`;
  }

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


// Generate PDF content using jsPDF (Text-based approach)
export function generatePdfContent(problemData: GenerateSystemDesignProblemOutput, filename: string): void {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15; // mm
  const usableWidth = pageWidth - 2 * margin;
  let y = margin; // Start Y position

  const addText = (text: string, size: number, style: 'bold' | 'normal', spacingAfter: number = 5): void => {
      if (y + size / 72 * 25.4 + spacingAfter > pageHeight - margin) { // Check if text fits, rough conversion points to mm
          doc.addPage();
          y = margin;
      }
      doc.setFontSize(size);
      doc.setFont(undefined, style);
      const splitText = doc.splitTextToSize(stripMarkdown(text), usableWidth);
      doc.text(splitText, margin, y);
      y += (splitText.length * size * 0.352778) + spacingAfter; // Move Y down (line height approx size * 0.35 mm) + spacing
  };

  addText(`System Design Problem: ${problemData.generatedProblemType || 'Generated Problem'}`, 18, 'bold', 10);

  if (problemData.generatedProblemType) {
      addText('System Design Focus', 14, 'bold');
      addText(`Problem Type: ${problemData.generatedProblemType}`, 11, 'normal');
  }

  if (problemData.problemStatement) {
      addText('Problem Statement', 14, 'bold');
      addText(problemData.problemStatement, 11, 'normal');
  }

  if (problemData.scaleEstimates) {
      addText('Scale Estimates', 14, 'bold');
      // Attempt to keep markdown formatting for lists/code if simple
      addText(problemData.scaleEstimates, 11, 'normal');
  }

   if (problemData.solution) {
      addText('Solution', 14, 'bold');
       addText(problemData.solution, 11, 'normal');
   }

    if (problemData.capacityPlanning) {
      addText('Capacity Planning', 14, 'bold');
       addText(problemData.capacityPlanning, 11, 'normal');
   }

   if (problemData.reasoning) {
      addText('Reasoning', 14, 'bold');
      addText(problemData.reasoning, 11, 'normal');
  }

  if (problemData.keyConcepts) {
      addText('Key Concepts', 14, 'bold');
      addText(problemData.keyConcepts, 11, 'normal');
  }

  if (problemData.diagramDescription) {
      addText('Diagram Description', 14, 'bold');
      addText(problemData.diagramDescription, 11, 'normal');
  }

  addText('Diagram', 14, 'bold');
  if (problemData.diagramImageUri) {
      addText(`A diagram image was generated. Please refer to the application view. (Image Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)`, 9, 'normal');
  } else {
     addText('(No diagram image was generated for this problem)', 9, 'normal');
  }

  doc.save(filename);
}
