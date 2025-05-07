
import { z } from 'zod';

export const ProblemGenerationSchema = z.object({
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  problemType: z.string().min(3, "Problem type must be at least 3 characters long."),
});

export type ProblemGenerationFormValues = z.infer<typeof ProblemGenerationSchema>;
