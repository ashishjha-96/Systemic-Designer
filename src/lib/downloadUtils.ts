
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
  if (problemData.diagramDescription) {
    markdown += `\n\n## Diagram Description\n${problemData.diagramDescription}`;
  }
  markdown += `\n\n## Diagram\n`;
  if (problemData.diagramImageUri) {
    markdown += `A diagram image was generated for this problem. Please refer to the application view or the provided image data URI if viewing this outside the application context.\n(Image Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)`;
  } else {
     markdown += `(No diagram image was generated for this problem)`;
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
  if (problemData.diagramDescription) {
    text += `\nDIAGRAM DESCRIPTION\n-------------------\n${stripMarkdownForTxt(problemData.diagramDescription)}\n`;
  }
  if (problemData.diagramImageUri) {
    text += `\nDIAGRAM\n-------\nA diagram image was generated. Refer to the application view.\n(Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)`;
  } else {
     text += `\nDIAGRAM\n-------\n(No diagram image was generated)`;
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
   if (problemData.diagramDescription) {
     renderMarkdown(`## Diagram Description\n${problemData.diagramDescription}`);
  }

  // --- Diagram Section ---
  renderMarkdown('## Diagram');
  checkAddPage(FONT_SIZES.p * 0.35);
  doc.setFontSize(FONT_SIZES.p);
  doc.setFont(undefined, 'normal');
  if (problemData.diagramImageUri) {
      const diagText = `A diagram image was generated. Please refer to the application view.\n(Image Data URI starts with: ${problemData.diagramImageUri.substring(0, 50)}...)`;
      const splitText = doc.splitTextToSize(diagText, usableWidth);
      doc.text(splitText, MARGIN, y);
      y += splitText.length * FONT_SIZES.p * 0.35;
      // Note: Embedding the large base64 image directly into the PDF can make it huge.
      // This text-based approach avoids that issue. For actual image embedding:
      // try {
      //   // Check if y position leaves enough space for the image
      //   const imgHeight = 50; // Example desired height in mm
      //   if (y + imgHeight > pageHeight - MARGIN) {
      //     doc.addPage();
      //     y = MARGIN;
      //   }
      //   doc.addImage(problemData.diagramImageUri, 'PNG', MARGIN, y, usableWidth, imgHeight);
      //   y += imgHeight + 5; // Add space after image
      // } catch (e) {
      //   console.error("Error adding image to PDF:", e);
      //   doc.text("Error embedding diagram image.", MARGIN, y);
      //    y += FONT_SIZES.p * 0.35 + LINE_SPACING.p;
      // }
  } else {
     doc.text('(No diagram image was generated for this problem)', MARGIN, y);
     y += FONT_SIZES.p * 0.35;
  }

  doc.save(filename);
}

// --- Notion Export ---

// Simplified Notion Block Types
interface NotionRichText {
  type: 'text';
  text: {
    content: string;
    link?: { url: string };
  };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
}

interface NotionBlockBase {
  object: 'block';
  type:
    | 'paragraph'
    | 'heading_1'
    | 'heading_2'
    | 'heading_3'
    | 'bulleted_list_item'
    | 'numbered_list_item'
    | 'code'
    | 'image'
    | 'divider';
}

interface NotionParagraphBlock extends NotionBlockBase { type: 'paragraph'; paragraph: { rich_text: NotionRichText[] }; }
interface NotionHeading1Block extends NotionBlockBase { type: 'heading_1'; heading_1: { rich_text: NotionRichText[] }; }
interface NotionHeading2Block extends NotionBlockBase { type: 'heading_2'; heading_2: { rich_text: NotionRichText[] }; }
interface NotionHeading3Block extends NotionBlockBase { type: 'heading_3'; heading_3: { rich_text: NotionRichText[] }; }
interface NotionBulletedListItemBlock extends NotionBlockBase { type: 'bulleted_list_item'; bulleted_list_item: { rich_text: NotionRichText[] }; }
interface NotionNumberedListItemBlock extends NotionBlockBase { type: 'numbered_list_item'; numbered_list_item: { rich_text: NotionRichText[] }; }
interface NotionCodeBlock extends NotionBlockBase { type: 'code'; code: { rich_text: NotionRichText[]; language: string }; }
interface NotionImageBlock extends NotionBlockBase {
  type: 'image';
  image: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string; expiry_time?: string };
    caption?: NotionRichText[];
  };
}
interface NotionDividerBlock extends NotionBlockBase { type: 'divider'; divider: {}; } // Divider has an empty object for its content

type NotionBlock = NotionParagraphBlock | NotionHeading1Block | NotionHeading2Block | NotionHeading3Block | NotionBulletedListItemBlock | NotionNumberedListItemBlock | NotionCodeBlock | NotionImageBlock | NotionDividerBlock;


// Helper to create a rich text array with basic markdown support
function createRichTextArray(content: string): NotionRichText[] {
    // Basic bold/italic handling (simplified)
    // This doesn't handle nested or complex markdown perfectly.
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).filter(part => part);
    return parts.map(part => {
        const richText: NotionRichText = { type: 'text', text: { content: part } };
        if (part.startsWith('**') && part.endsWith('**')) {
            richText.text.content = part.substring(2, part.length - 2);
            richText.annotations = { bold: true };
        } else if (part.startsWith('*') && part.endsWith('*')) {
            richText.text.content = part.substring(1, part.length - 1);
            richText.annotations = { italic: true };
        } else if (part.startsWith('`') && part.endsWith('`')) {
            richText.text.content = part.substring(1, part.length - 1);
            richText.annotations = { code: true };
        }
        return richText;
    }).filter(rt => rt.text.content.length > 0);
}


// Helper to create a generic block with rich text content
function createRichTextBlock(type: NotionBlock['type'], content: string): NotionBlock | null {
    if (!content || content.trim() === "") return null;
    const rich_text = createRichTextArray(content);
    if (rich_text.length === 0) return null;

    switch (type) {
        case 'paragraph': return { object: 'block', type, paragraph: { rich_text } } as NotionParagraphBlock;
        case 'heading_1': return { object: 'block', type, heading_1: { rich_text } } as NotionHeading1Block;
        case 'heading_2': return { object: 'block', type, heading_2: { rich_text } } as NotionHeading2Block;
        case 'heading_3': return { object: 'block', type, heading_3: { rich_text } } as NotionHeading3Block;
        case 'bulleted_list_item': return { object: 'block', type, bulleted_list_item: { rich_text } } as NotionBulletedListItemBlock;
        default: return null; // Only handles types that directly use rich_text array
    }
}

// Helper to create a code block
function createCodeBlock(code: string, language: string = 'plaintext'): NotionCodeBlock {
  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [{ type: 'text', text: { content: code } }], // Code blocks in Notion typically don't have internal annotations
      language,
    },
  };
}

// Helper to parse markdown-like string into Notion blocks
function parseMarkdownToNotionBlocks(markdown: string | undefined | null, defaultLanguage: string = 'markdown'): NotionBlock[] {
  if (!markdown) return [];
  const blocks: NotionBlock[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = defaultLanguage;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(createCodeBlock(codeContent.trim(), codeLang));
        codeContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.substring(3).trim().toLowerCase() || defaultLanguage;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }
    
    let block: NotionBlock | null = null;
    if (line.startsWith('# ')) {
        block = createRichTextBlock('heading_1', line.substring(2));
    } else if (line.startsWith('## ')) {
        block = createRichTextBlock('heading_2', line.substring(3));
    } else if (line.startsWith('### ')) {
        block = createRichTextBlock('heading_3', line.substring(4));
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
        // Handle multi-line list items by checking subsequent lines
        let listItemContent = line.substring(2);
        while (i + 1 < lines.length && (lines[i+1].startsWith('  ') || lines[i+1].trim() === '')) {
            // If next line is indented or blank, it's part of the current list item or a break.
            // For simplicity, just append if indented. Blank lines will break.
            if (lines[i+1].startsWith('  ')) {
                 listItemContent += '\n' + lines[i+1].trimStart();
                 i++;
            } else {
                break; // Stop if it's a blank line that's not just indentation.
            }
        }
        block = createRichTextBlock('bulleted_list_item', listItemContent);
    } else if (line.trim() !== '') {
        // Handle multi-line paragraphs
        let paragraphContent = line;
        while (i + 1 < lines.length && lines[i+1].trim() !== '' && !/^(# |## |### |\* |- |```)/.test(lines[i+1])) {
            paragraphContent += '\n' + lines[i+1];
            i++;
        }
        block = createRichTextBlock('paragraph', paragraphContent);
    }

    if (block) {
        blocks.push(block);
    }
  }
  if (inCodeBlock && codeContent.trim() !== '') { // Handle unterminated code block
    blocks.push(createCodeBlock(codeContent.trim(), codeLang));
  }
  return blocks.filter(b => b !== null);
}


export async function exportToNotion(
  problemData: GenerateSystemDesignProblemOutput,
  notionApiKey: string,
  pageId: string // This is the parent page ID
): Promise<{ success: boolean; error?: string; data?: any; pageUrl?: string }> {
  if (!notionApiKey || !pageId) {
    return { success: false, error: "Notion API Key and Parent Page ID are required." };
  }

  const pageTitle = `System Design: ${problemData.generatedProblemType || 'Generated Problem'}`;
  const children: NotionBlock[] = [];

  // Page Title (as H1, will be the first block in the page content)
  const titleBlock = createRichTextBlock('heading_1', pageTitle);
  if (titleBlock) children.push(titleBlock);


  if (problemData.generatedProblemType) {
    const focusTitle = createRichTextBlock('heading_2', "System Design Focus");
    if (focusTitle) children.push(focusTitle);
    const focusContent = createRichTextBlock('paragraph', `Problem Type: ${problemData.generatedProblemType}`);
    if (focusContent) children.push(focusContent);
  }

  const sections: { title: string; content?: string | null; isKeyConcepts?: boolean }[] = [
    { title: "Problem Statement", content: problemData.problemStatement },
    { title: "Scale Estimates", content: problemData.scaleEstimates },
    { title: "Solution", content: problemData.solution },
    { title: "Capacity Planning", content: problemData.capacityPlanning },
    { title: "Reasoning", content: problemData.reasoning },
    { title: "Key Concepts", content: problemData.keyConcepts, isKeyConcepts: true },
    { title: "Diagram Description", content: problemData.diagramDescription },
  ];

  for (const section of sections) {
    if (section.content && section.content.trim() !== "") {
      const headerBlock = createRichTextBlock('heading_2', section.title);
      if (headerBlock) children.push(headerBlock);

      if (section.isKeyConcepts) {
        const concepts = section.content.split(/[\n,]/).map(c => c.trim()).filter(c => c);
        concepts.forEach(concept => {
            const item = createRichTextBlock('bulleted_list_item', concept);
            if (item) children.push(item);
        });
      } else {
         children.push(...parseMarkdownToNotionBlocks(section.content));
      }
    }
  }

  if (problemData.diagramImageUri) {
    const diagramTitle = createRichTextBlock('heading_2', "Diagram");
    if (diagramTitle) children.push(diagramTitle);
    
    // Notion API for images requires a public URL. Data URIs are not directly embeddable as images.
    // We'll provide a link to the data URI.
    const dataUriMessage = "A diagram was generated as a Data URI. Notion cannot directly embed this as an image. You might need to copy the link/text and open it in a browser or save it as a file.";
    const explanationBlock = createRichTextBlock('paragraph', dataUriMessage);
    if (explanationBlock) children.push(explanationBlock);

    // Create a code block for the (potentially very long) data URI for easier copying.
    // Truncate if extremely long for the rich text part, but the code block will have the full URI.
    const shortDataUri = problemData.diagramImageUri.substring(0, 200) + (problemData.diagramImageUri.length > 200 ? "..." : "");
    const linkBlock = createCodeBlock(problemData.diagramImageUri, 'text');
    children.push(linkBlock);

  } else {
    const diagramTitle = createRichTextBlock('heading_2', "Diagram");
    if (diagramTitle) children.push(diagramTitle);
    const noDiagramText = createRichTextBlock('paragraph', "(No diagram image was generated for this problem)");
    if (noDiagramText) children.push(noDiagramText);
  }
  
  children.push({ object: 'block', type: 'divider', divider: {} } as NotionDividerBlock);


  const notionApiUrl = 'https://api.notion.com/v1/pages';
  const body = {
    parent: { page_id: pageId },
    properties: {
      title: [ 
        {
          type: 'text',
          text: { content: pageTitle },
        },
      ],
    },
    children: children.filter(c => c !== null), 
  };

  try {
    const response = await fetch(notionApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json(); // Attempt to parse JSON regardless of response.ok

    if (!response.ok) {
      console.error('Notion API Error:', responseData);
      return { success: false, error: `Notion API Error: ${responseData.message || response.statusText}` };
    }
    
    // Assuming responseData for success includes an 'url' field for the new page
    const pageUrl = responseData.url || `https://www.notion.so/${responseData.id.replace(/-/g, '')}`;

    return { success: true, data: responseData, pageUrl };

  } catch (error: any) {
    console.error('Failed to export to Notion:', error);
    return { success: false, error: error.message || 'An unknown error occurred during Notion export.' };
  }
}

// --- Pocket Export ---

function sanitizeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />"); // Convert newlines to <br> for HTML
}

export async function exportToPocket(
  problemData: GenerateSystemDesignProblemOutput,
  pocketConsumerKey: string,
  pocketAccessToken: string
): Promise<{ success: boolean; error?: string; data?: any; errorDetails?: any }> {
  if (!pocketConsumerKey || !pocketAccessToken) {
    return { success: false, error: "Pocket Consumer Key and Access Token are required." };
  }

  const title = problemData.generatedProblemType || problemData.problemStatement?.substring(0, 100) || "System Design Problem";
  
  // Construct HTML content
  let htmlContent = `<html><head><meta charset="UTF-8"><title>${sanitizeHtml(title)}</title></head><body>`;
  htmlContent += `<h1>System Design Problem: ${sanitizeHtml(problemData.generatedProblemType)}</h1>`;
  
  if (problemData.problemStatement) {
    htmlContent += `<h2>Problem Statement</h2><p>${sanitizeHtml(problemData.problemStatement)}</p>`;
  }
  if (problemData.scaleEstimates) {
    htmlContent += `<h2>Scale Estimates</h2><p>${sanitizeHtml(problemData.scaleEstimates)}</p>`;
  }
  if (problemData.solution) {
    htmlContent += `<h2>Solution</h2><p>${sanitizeHtml(problemData.solution)}</p>`;
  }
  if (problemData.capacityPlanning) {
    htmlContent += `<h2>Capacity Planning</h2><p>${sanitizeHtml(problemData.capacityPlanning)}</p>`;
  }
  if (problemData.reasoning) {
    htmlContent += `<h2>Reasoning</h2><p>${sanitizeHtml(problemData.reasoning)}</p>`;
  }
  if (problemData.keyConcepts) {
    // Assuming keyConcepts is a string, potentially comma or newline separated.
    // If it's an array in your actual data structure, adjust accordingly.
    const concepts = typeof problemData.keyConcepts === 'string' 
      ? problemData.keyConcepts.split(/[,;\n]/).map(c => c.trim()).filter(c => c)
      : Array.isArray(problemData.keyConcepts) 
        ? problemData.keyConcepts.map(c => String(c).trim()).filter(c => c) 
        : [];
    if (concepts.length > 0) {
        htmlContent += `<h2>Key Concepts</h2><ul>${concepts.map(c => `<li>${sanitizeHtml(c)}</li>`).join('')}</ul>`;
    }
  }
   if (problemData.diagramDescription) {
    htmlContent += `<h2>Diagram Description</h2><p>${sanitizeHtml(problemData.diagramDescription)}</p>`;
  }
  if (problemData.diagramImageUri) {
    htmlContent += `<h2>Diagram</h2><p>A diagram image was generated. Due to Pocket API limitations, the image cannot be embedded directly if this content is sent as a data URI. Please refer to the application for the visual diagram.</p><p>(Diagram URI starts with: ${sanitizeHtml(problemData.diagramImageUri.substring(0,100))}...)</p>`;
  }
  htmlContent += '</body></html>';

  const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  // The data URI can be very long. Pocket might have a URL length limit.
  // If data URI is too long, it's likely to fail.
  // A typical limit for URLs is around 2000 characters. Data URIs can easily exceed this.
  if (dataUri.length > 8000) { // Pocket's limit seems to be higher, but let's be cautious. Some sources say 8KB-10KB.
    console.warn("Data URI for Pocket is very long:", dataUri.length, "characters. This might exceed Pocket's URL length limit.");
    // Optionally, return an error here or try sending a truncated version / just a link to the app.
    // For this task, we'll still attempt to send it.
  }
  
  const pocketApiUrl = 'https://getpocket.com/v3/add';
  const requestBody = {
    url: dataUri,
    title: title,
    consumer_key: pocketConsumerKey,
    access_token: pocketAccessToken,
    tags: typeof problemData.keyConcepts === 'string' 
          ? problemData.keyConcepts.split(/[,;\n]/).map(c => c.trim()).filter(c => c).join(',') 
          : (Array.isArray(problemData.keyConcepts) ? problemData.keyConcepts.join(',') : undefined),
  };

  try {
    const response = await fetch(pocketApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorCode = response.headers.get('X-Error-Code');
      const errorMsgHeader = response.headers.get('X-Error');
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Failed to parse error response from Pocket." };
      }
      console.error('Pocket API Error:', {
        status: response.status,
        errorCode,
        errorMsgHeader,
        errorBody: errorData,
      });
      return { 
        success: false, 
        error: `Pocket API Error: ${errorMsgHeader || response.statusText} (Code: ${errorCode || 'N/A'})`,
        errorDetails: errorData
      };
    }

    const responseData = await response.json();
    // Pocket's add API returns the item object on success
    if (responseData && responseData.item) {
      return { success: true, data: responseData.item };
    } else {
      // This case should ideally not happen if response.ok is true and API is consistent
      return { success: false, error: "Pocket API returned success status but no item data.", errorDetails: responseData };
    }

  } catch (error: any) {
    console.error('Failed to export to Pocket:', error);
    return { success: false, error: error.message || 'An unknown error occurred during Pocket export.' };
  }
}