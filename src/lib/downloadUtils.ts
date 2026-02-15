
import jsPDF from 'jspdf';
import type { GenerateSystemDesignProblemOutput } from "@/ai/flows/generate-system-design-problem";

// Constants for PDF generation
const FONT_SIZES = {
    h1: 18,
    h2: 14,
    h3: 12,
    p: 10,
    code: 9,
};
const LINE_SPACING = {
    h1: 8,
    h2: 6,
    h3: 5,
    p: 4,
    code: 3,
};
const MARGIN = 15; // mm
const CODE_BG_COLOR = '#f0f0f0'; // Light gray for code blocks

// Generate Markdown content (No changes needed here)
export function generateMarkdownContent(problemData: GenerateSystemDesignProblemOutput): string {
  let markdown = `# System Design Problem: ${problemData.generatedProblemType || 'Generated Problem'}`;

  if (problemData.generatedProblemType) {
    markdown += `\n\n## System Design Focus\n**Problem Type:** ${problemData.generatedProblemType}`;
  }
  if (problemData.problemStatement) {
    markdown += `\n\n## Problem Statement\n${problemData.problemStatement}`;
  }
  if (problemData.scaleEstimates) {
    markdown += `\n\n## Scale Estimates\n${problemData.scaleEstimates}`;
  }
  if (problemData.solution) {
    markdown += `\n\n## Solution\n${problemData.solution}`;
  }
  if (problemData.capacityPlanning) {
    markdown += `\n\n## Capacity Planning\n${problemData.capacityPlanning}`;
  }
  if (problemData.reasoning) {
    markdown += `\n\n## Reasoning\n${problemData.reasoning}`;
  }
  if (problemData.keyConcepts) {
    markdown += `\n\n## Key Concepts\n${problemData.keyConcepts}`;
  }
  if (problemData.mermaidDiagram) {
    markdown += `\n\n## System Architecture Diagram\n\`\`\`mermaid\n${problemData.mermaidDiagram}\n\`\`\``;
  }

  return markdown.trim() + '\n';
}


// Generate Plain Text content (No changes needed here)
export function generatePlainTextContent(problemData: GenerateSystemDesignProblemOutput): string {
   // Helper function to strip Markdown for plain text
  const stripMarkdownForTxt = (markdown: string | undefined | null): string => {
    if (!markdown) return '';
    let text = markdown;
    // Basic headers -> add newline before
    text = text.replace(/^#+\s+/gm, '\n');
    // Bold/italic/strikethrough/etc.
    text = text.replace(/(\*\*|__|\*|_|~~)(.*?)\1/g, '$2');
    // Code blocks - keep content, add separators
    text = text.replace(/```([\s\S]*?)```/g, (match, p1) => `\n---\nCODE BLOCK:\n${p1.trim()}\n---\n`);
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
  };

  let text = `SYSTEM DESIGN PROBLEM: ${problemData.generatedProblemType || 'Generated Problem'}
========================================
`;

  if (problemData.generatedProblemType) {
    text += `\nSYSTEM DESIGN FOCUS\n-------------------\nProblem Type: ${problemData.generatedProblemType}\n`;
  }
  if (problemData.problemStatement) {
    text += `\nPROBLEM STATEMENT\n-----------------\n${stripMarkdownForTxt(problemData.problemStatement)}\n`;
  }
  if (problemData.scaleEstimates) {
    text += `\nSCALE ESTIMATES\n---------------\n${stripMarkdownForTxt(problemData.scaleEstimates)}\n`;
  }
  if (problemData.solution) {
    text += `\nSOLUTION\n--------\n${stripMarkdownForTxt(problemData.solution)}\n`;
  }
  if (problemData.capacityPlanning) {
    text += `\nCAPACITY PLANNING\n-----------------\n${stripMarkdownForTxt(problemData.capacityPlanning)}\n`;
  }
  if (problemData.reasoning) {
    text += `\nREASONING\n---------\n${stripMarkdownForTxt(problemData.reasoning)}\n`;
  }
  if (problemData.keyConcepts) {
    text += `\nKEY CONCEPTS\n------------\n${stripMarkdownForTxt(problemData.keyConcepts)}\n`;
  }
  if (problemData.mermaidDiagram) {
    text += `\nSYSTEM ARCHITECTURE DIAGRAM (Mermaid)\n-------------------------------------\n${problemData.mermaidDiagram}\n`;
  }

  return text;
}


// Generate PDF content using jsPDF with improved Markdown handling
export function generatePdfContent(problemData: GenerateSystemDesignProblemOutput, filename: string): void {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const usableWidth = pageWidth - 2 * MARGIN;
  let y = MARGIN; // Current Y position

  const checkAddPage = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Basic Markdown Parser for PDF generation
  const renderMarkdown = (markdown: string | undefined | null): void => {
    if (!markdown) return;

    const lines = markdown.split('\n');
    let inCodeBlock = false;

    for (const line of lines) {
      // --- Code Blocks ---
      if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          if (!inCodeBlock) { // End of code block
             y += LINE_SPACING.code; // Add a bit of space after code block
          } else { // Start of code block
              checkAddPage(FONT_SIZES.code * 0.35 + LINE_SPACING.code); // Check space for first line + spacing
              // Draw background rectangle - slightly complex with page breaks
              // For simplicity, we'll just change font for now.
              doc.setFont('courier', 'normal'); // Use a monospace font
              doc.setFontSize(FONT_SIZES.code);
          }
          continue; // Skip the ``` line itself
      }

      if (inCodeBlock) {
          checkAddPage(FONT_SIZES.code * 0.35);
          // Handle potential line wrapping within code block
          const codeLines = doc.splitTextToSize(line, usableWidth);
          doc.text(codeLines, MARGIN, y);
          y += codeLines.length * FONT_SIZES.code * 0.35; // Approximate line height in mm
          continue;
      }

      // --- Headers ---
      if (line.startsWith('# ')) { // H1
        checkAddPage(FONT_SIZES.h1 * 0.35 + LINE_SPACING.h1);
        doc.setFontSize(FONT_SIZES.h1);
        doc.setFont(undefined, 'bold');
        const text = line.substring(2);
        const splitText = doc.splitTextToSize(text, usableWidth);
        doc.text(splitText, MARGIN, y);
        y += (splitText.length * FONT_SIZES.h1 * 0.35) + LINE_SPACING.h1;
      } else if (line.startsWith('## ')) { // H2
        checkAddPage(FONT_SIZES.h2 * 0.35 + LINE_SPACING.h2);
        doc.setFontSize(FONT_SIZES.h2);
        doc.setFont(undefined, 'bold');
        const text = line.substring(3);
        const splitText = doc.splitTextToSize(text, usableWidth);
        doc.text(splitText, MARGIN, y);
        y += (splitText.length * FONT_SIZES.h2 * 0.35) + LINE_SPACING.h2;
      } else if (line.startsWith('### ')) { // H3
        checkAddPage(FONT_SIZES.h3 * 0.35 + LINE_SPACING.h3);
        doc.setFontSize(FONT_SIZES.h3);
        doc.setFont(undefined, 'bold');
        const text = line.substring(4);
        const splitText = doc.splitTextToSize(text, usableWidth);
        doc.text(splitText, MARGIN, y);
        y += (splitText.length * FONT_SIZES.h3 * 0.35) + LINE_SPACING.h3;
      // --- Lists ---
      } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().match(/^(\d+\.)\s/)) {
        checkAddPage(FONT_SIZES.p * 0.35);
        doc.setFontSize(FONT_SIZES.p);
        doc.setFont(undefined, 'normal');
        const itemText = line.replace(/^(\*|-|\d+\.)\s+/, '');
        const prefix = line.trim().startsWith('*') || line.trim().startsWith('-') ? '• ' : '  '; // Indent numbered lists slightly more maybe
        const splitText = doc.splitTextToSize(itemText, usableWidth - 5); // Indent list item text
        doc.text(prefix + splitText[0], MARGIN, y);
        if (splitText.length > 1) {
             doc.text(splitText.slice(1), MARGIN + 5, y + FONT_SIZES.p * 0.35); // Add subsequent lines indented
        }
        y += splitText.length * FONT_SIZES.p * 0.35;
      // --- Paragraphs (and catch-all) ---
      } else {
        // Treat empty lines as paragraph breaks
        if (line.trim() === '') {
            y += LINE_SPACING.p / 2; // Add smaller spacing for blank lines
            continue;
        }
        checkAddPage(FONT_SIZES.p * 0.35 + LINE_SPACING.p);
        doc.setFontSize(FONT_SIZES.p);
        doc.setFont(undefined, 'normal');
        // Basic bold/italic handling - limitations apply
        // This is very basic and won't handle nested or complex cases well.
        const text = line.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Crude bold removal for length calculation
        // TODO: jsPDF doesn't easily support inline style changes. Might need advanced processing or accept limitations.
        const splitText = doc.splitTextToSize(line.replace(/(\*\*|__)(.*?)\1/g, '$2'), usableWidth); // Render without markdown markers for now
        doc.text(splitText, MARGIN, y);
        y += (splitText.length * FONT_SIZES.p * 0.35) + LINE_SPACING.p;
      }
    }
     // Reset font after processing markdown section
     doc.setFont(undefined, 'normal');
  };

  // --- Document Title ---
  checkAddPage(FONT_SIZES.h1 * 0.35 + LINE_SPACING.h1);
  doc.setFontSize(FONT_SIZES.h1);
  doc.setFont(undefined, 'bold');
  doc.text(`System Design Problem: ${problemData.generatedProblemType || 'Generated Problem'}`, MARGIN, y);
  y += FONT_SIZES.h1 * 0.35 + LINE_SPACING.h1;

  // --- Render Sections ---
  if (problemData.generatedProblemType) {
     renderMarkdown(`## System Design Focus\n**Problem Type:** ${problemData.generatedProblemType}`);
  }
  if (problemData.problemStatement) {
     renderMarkdown(`## Problem Statement\n${problemData.problemStatement}`);
  }
   if (problemData.scaleEstimates) {
     renderMarkdown(`## Scale Estimates\n${problemData.scaleEstimates}`);
  }
   if (problemData.solution) {
     renderMarkdown(`## Solution\n${problemData.solution}`);
  }
   if (problemData.capacityPlanning) {
     renderMarkdown(`## Capacity Planning\n${problemData.capacityPlanning}`);
  }
   if (problemData.reasoning) {
     renderMarkdown(`## Reasoning\n${problemData.reasoning}`);
  }
  if (problemData.keyConcepts) {
     renderMarkdown(`## Key Concepts\n${problemData.keyConcepts}`);
  }
   if (problemData.mermaidDiagram) {
     renderMarkdown(`## System Architecture Diagram\nThe Mermaid diagram code for this system design:`);
     checkAddPage(FONT_SIZES.code * 0.35 + LINE_SPACING.code);
     doc.setFont('courier', 'normal');
     doc.setFontSize(FONT_SIZES.code);
     const diagramLines = doc.splitTextToSize(problemData.mermaidDiagram, usableWidth);
     for (const line of diagramLines) {
       checkAddPage(FONT_SIZES.code * 0.35);
       doc.text(line, MARGIN, y);
       y += FONT_SIZES.code * 0.35;
     }
     doc.setFont('helvetica', 'normal');
     y += LINE_SPACING.code;
  }

  doc.save(filename);
}


    