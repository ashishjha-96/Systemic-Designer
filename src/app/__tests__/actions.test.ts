import { generateProblemAction } from '../actions';
import type { ProblemGenerationFormValues } from '@/lib/schemas';

// Mock the Genkit flow
jest.mock('@/ai/flows/generate-system-design-problem', () => ({
  generateSystemDesignProblem: jest.fn(),
}));

import { generateSystemDesignProblem } from '@/ai/flows/generate-system-design-problem';

const mockGenerateSystemDesignProblem = generateSystemDesignProblem as jest.MockedFunction<
  typeof generateSystemDesignProblem
>;

describe('generateProblemAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('input validation', () => {
    it('should accept valid input', async () => {
      const validInput: ProblemGenerationFormValues = {
        difficultyLevel: 'Medium',
        problemType: 'Chat System',
        modelName: 'googleai/gemini-2.5-flash',
      };

      const mockOutput = {
        generatedProblemType: 'Chat System',
        problemStatement: 'Design a chat system',
      };

      mockGenerateSystemDesignProblem.mockResolvedValueOnce(mockOutput);

      const result = await generateProblemAction(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOutput);
      expect(mockGenerateSystemDesignProblem).toHaveBeenCalledWith({
        difficultyLevel: 'Medium',
        problemType: 'Chat System',
        modelName: 'googleai/gemini-2.5-flash',
      });
    });

    it('should reject invalid difficulty level', async () => {
      const invalidInput = {
        difficultyLevel: 'VeryHard',
        problemType: 'Chat System',
        modelName: 'googleai/gemini-2.5-flash',
      } as any;

      const result = await generateProblemAction(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
      expect(mockGenerateSystemDesignProblem).not.toHaveBeenCalled();
    });

    it('should reject problem type with less than 3 characters', async () => {
      const invalidInput: ProblemGenerationFormValues = {
        difficultyLevel: 'Easy',
        problemType: 'AB',
        modelName: 'googleai/gemini-2.5-flash',
      };

      const result = await generateProblemAction(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
      expect(result.error).toContain('problemType');
      expect(mockGenerateSystemDesignProblem).not.toHaveBeenCalled();
    });

    it('should reject invalid model name', async () => {
      const invalidInput = {
        difficultyLevel: 'Easy',
        problemType: 'Chat System',
        modelName: 'invalid-model',
      } as any;

      const result = await generateProblemAction(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
      expect(mockGenerateSystemDesignProblem).not.toHaveBeenCalled();
    });

    it('should accept minimal valid input (only difficulty)', async () => {
      const minimalInput: ProblemGenerationFormValues = {
        difficultyLevel: 'Easy',
        modelName: 'googleai/gemini-2.5-flash',
      };

      const mockOutput = {
        generatedProblemType: 'Generated Problem',
      };

      mockGenerateSystemDesignProblem.mockResolvedValueOnce(mockOutput);

      const result = await generateProblemAction(minimalInput);

      expect(result.success).toBe(true);
      expect(mockGenerateSystemDesignProblem).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle Genkit flow errors gracefully', async () => {
      const validInput: ProblemGenerationFormValues = {
        difficultyLevel: 'Easy',
        modelName: 'googleai/gemini-2.5-flash',
      };

      const mockError = new Error('API rate limit exceeded');
      mockGenerateSystemDesignProblem.mockRejectedValueOnce(mockError);

      const result = await generateProblemAction(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API rate limit exceeded');
    });

    it('should handle non-Error exceptions', async () => {
      const validInput: ProblemGenerationFormValues = {
        difficultyLevel: 'Easy',
        modelName: 'googleai/gemini-2.5-flash',
      };

      mockGenerateSystemDesignProblem.mockRejectedValueOnce('String error');

      const result = await generateProblemAction(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to generate problem. Please try again.');
    });
  });

  describe('successful problem generation', () => {
    it('should return complete problem data', async () => {
      const validInput: ProblemGenerationFormValues = {
        difficultyLevel: 'Hard',
        problemType: 'Distributed Cache',
        modelName: 'googleai/gemini-1.5-pro',
      };

      const mockOutput = {
        generatedProblemType: 'Distributed Cache',
        problemStatement: 'Design a distributed caching system',
        scaleEstimates: '1M requests per second',
        solution: 'Use consistent hashing with Redis',
        capacityPlanning: '100TB storage across 1000 nodes',
        reasoning: 'Consistent hashing minimizes cache invalidation',
        keyConcepts: 'Consistent Hashing, Sharding, Replication',
        diagramDescription: 'Cache architecture with sharding',
        diagramImageUri: 'data:image/png;base64,xyz',
      };

      mockGenerateSystemDesignProblem.mockResolvedValueOnce(mockOutput);

      const result = await generateProblemAction(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOutput);
      expect(result.error).toBeUndefined();
    });
  });
});
