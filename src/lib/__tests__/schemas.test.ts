import { ProblemGenerationSchema } from '../schemas';

describe('ProblemGenerationSchema', () => {
  describe('difficultyLevel validation', () => {
    it('should accept valid difficulty levels', () => {
      const validLevels = ['Easy', 'Medium', 'Hard'];

      validLevels.forEach(level => {
        const result = ProblemGenerationSchema.safeParse({
          difficultyLevel: level,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid difficulty levels', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should require difficultyLevel field', () => {
      const result = ProblemGenerationSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('problemType validation', () => {
    it('should accept empty problem type', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
        problemType: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept undefined problem type', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid problem type with minimum length', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
        problemType: 'API',
      });
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from problem type', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
        problemType: '  Chat System  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.problemType).toBe('Chat System');
      }
    });

    it('should reject problem type with less than 3 characters (after trim)', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
        problemType: 'AB',
      });
      expect(result.success).toBe(false);
    });

    it('should accept problem type that becomes empty after trim', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
        problemType: '   ',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('modelName validation', () => {
    it('should use default model when not provided', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.modelName).toBe('googleai/gemini-2.5-flash');
      }
    });

    it('should accept valid model names', () => {
      const validModels = [
        'googleai/gemini-2.5-flash',
        'googleai/gemini-2.0-flash',
        'googleai/gemini-1.5-flash',
        'googleai/gemini-1.5-pro',
      ];

      validModels.forEach(model => {
        const result = ProblemGenerationSchema.safeParse({
          difficultyLevel: 'Easy',
          modelName: model,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.modelName).toBe(model);
        }
      });
    });

    it('should reject invalid model names', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Easy',
        modelName: 'invalid-model',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('complete form validation', () => {
    it('should accept valid complete form data', () => {
      const result = ProblemGenerationSchema.safeParse({
        difficultyLevel: 'Medium',
        problemType: 'Social Media Platform',
        modelName: 'googleai/gemini-1.5-pro',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.difficultyLevel).toBe('Medium');
        expect(result.data.problemType).toBe('Social Media Platform');
        expect(result.data.modelName).toBe('googleai/gemini-1.5-pro');
      }
    });
  });
});
