import { generateMarkdownContent, generatePlainTextContent } from '../downloadUtils';
import type { GenerateSystemDesignProblemOutput } from '@/ai/flows/generate-system-design-problem';

describe('downloadUtils', () => {
  const mockProblemData: GenerateSystemDesignProblemOutput = {
    generatedProblemType: 'URL Shortener',
    problemStatement: 'Design a URL shortening service like bit.ly',
    scaleEstimates: '100M URLs per month',
    solution: 'Use hash-based approach with distributed cache',
    capacityPlanning: '1TB storage, 10K QPS',
    reasoning: 'Hash provides O(1) lookup',
    keyConcepts: 'Hashing, Caching, Load Balancing',
    diagramDescription: 'System architecture with load balancer',
    diagramImageUri: 'data:image/png;base64,abcdefg...',
  };

  describe('generateMarkdownContent', () => {
    it('should generate valid markdown with all sections', () => {
      const markdown = generateMarkdownContent(mockProblemData);

      expect(markdown).toContain('# System Design Problem: URL Shortener');
      expect(markdown).toContain('## System Design Focus');
      expect(markdown).toContain('## Problem Statement');
      expect(markdown).toContain('## Scale Estimates');
      expect(markdown).toContain('## Solution');
      expect(markdown).toContain('## Capacity Planning');
      expect(markdown).toContain('## Reasoning');
      expect(markdown).toContain('## Key Concepts');
      expect(markdown).toContain('## Diagram Description');
      expect(markdown).toContain('## Diagram');
    });

    it('should handle missing optional fields', () => {
      const minimalData: GenerateSystemDesignProblemOutput = {
        generatedProblemType: 'Test Problem',
      };

      const markdown = generateMarkdownContent(minimalData);

      expect(markdown).toContain('# System Design Problem: Test Problem');
      expect(markdown).toContain('(No diagram image was generated for this problem)');
      expect(markdown).not.toContain('## Problem Statement');
    });

    it('should include diagram URI information when present', () => {
      const markdown = generateMarkdownContent(mockProblemData);

      expect(markdown).toContain('A diagram image was generated');
      expect(markdown).toContain('data:image/png;base64,abcdefg');
    });

    it('should handle missing diagram URI', () => {
      const dataWithoutDiagram = { ...mockProblemData, diagramImageUri: undefined };
      const markdown = generateMarkdownContent(dataWithoutDiagram);

      expect(markdown).toContain('(No diagram image was generated for this problem)');
    });

    it('should end with newline', () => {
      const markdown = generateMarkdownContent(mockProblemData);

      expect(markdown.endsWith('\n')).toBe(true);
    });
  });

  describe('generatePlainTextContent', () => {
    it('should generate valid plain text with all sections', () => {
      const text = generatePlainTextContent(mockProblemData);

      expect(text).toContain('SYSTEM DESIGN PROBLEM: URL Shortener');
      expect(text).toContain('SYSTEM DESIGN FOCUS');
      expect(text).toContain('PROBLEM STATEMENT');
      expect(text).toContain('SCALE ESTIMATES');
      expect(text).toContain('SOLUTION');
      expect(text).toContain('CAPACITY PLANNING');
      expect(text).toContain('REASONING');
      expect(text).toContain('KEY CONCEPTS');
      expect(text).toContain('DIAGRAM DESCRIPTION');
      expect(text).toContain('DIAGRAM');
    });

    it('should handle missing optional fields', () => {
      const minimalData: GenerateSystemDesignProblemOutput = {
        generatedProblemType: 'Test Problem',
      };

      const text = generatePlainTextContent(minimalData);

      expect(text).toContain('SYSTEM DESIGN PROBLEM: Test Problem');
      expect(text).toContain('(No diagram image was generated)');
    });

    it('should strip markdown formatting', () => {
      const dataWithMarkdown: GenerateSystemDesignProblemOutput = {
        generatedProblemType: 'Test',
        problemStatement: '**Bold text** and *italic text*',
      };

      const text = generatePlainTextContent(dataWithMarkdown);

      expect(text).toContain('Bold text');
      expect(text).toContain('italic text');
      expect(text).not.toContain('**');
      expect(text).not.toContain('*italic*');
    });

    it('should handle code blocks', () => {
      const dataWithCode: GenerateSystemDesignProblemOutput = {
        generatedProblemType: 'Test',
        solution: 'Here is some code:\n```python\ndef hello():\n    print("hello")\n```',
      };

      const text = generatePlainTextContent(dataWithCode);

      expect(text).toContain('CODE BLOCK:');
      expect(text).not.toContain('```');
    });

    it('should include diagram URI information when present', () => {
      const text = generatePlainTextContent(mockProblemData);

      expect(text).toContain('A diagram image was generated');
      expect(text).toContain('data:image/png;base64,abcdefg');
    });

    it('should handle missing diagram URI', () => {
      const dataWithoutDiagram = { ...mockProblemData, diagramImageUri: undefined };
      const text = generatePlainTextContent(dataWithoutDiagram);

      expect(text).toContain('(No diagram image was generated)');
    });
  });
});
