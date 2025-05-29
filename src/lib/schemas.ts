
import { z } from 'zod';
// import { supportedModels } from '@/lib/models'; // Import supported models - REMOVED

export const ProblemGenerationSchema = z.object({
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  problemType: z.string()
    .transform(val => val.trim()) // Trim spaces
    .refine(val => val.length === 0 || val.length >= 3, { // Allow empty or min 3 chars
      message: "Problem type, if provided, must be at least 3 characters long.",
    })
    .optional(), // Makes the field itself optional, allowing undefined if not submitted
  modelName: z.string().min(1, "AI Model must be selected"), // Validate as non-empty string
});

export type ProblemGenerationFormValues = z.infer<typeof ProblemGenerationSchema>;
