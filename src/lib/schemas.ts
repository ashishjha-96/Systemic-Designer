
import { z } from 'zod';

export const ProblemGenerationSchema = z.object({
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  problemType: z.string()
    .transform(val => val.trim()) // Trim spaces
    .refine(val => val.length === 0 || val.length >= 3, { // Allow empty or min 3 chars
      message: "Problem type, if provided, must be at least 3 characters long.",
    })
    .optional(), // Makes the field itself optional, allowing undefined if not submitted
});

export type ProblemGenerationFormValues = z.infer<typeof ProblemGenerationSchema>;
