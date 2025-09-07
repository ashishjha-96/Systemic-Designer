
import { z } from 'zod';
import { supportedModels } from '@/lib/models'; // Import supported models

export const ProblemGenerationSchema = z.object({
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  problemType: z.string()
    .transform(val => val.trim()) // Trim spaces
    .refine(val => val.length === 0 || val.length >= 3, { // Allow empty or min 3 chars
      message: "Problem type, if provided, must be at least 3 characters long.",
    })
    .optional(), // Makes the field itself optional, allowing undefined if not submitted
  modelName: z.enum(supportedModels) // Validate against the list of supported models
    .default('googleai/gemini-2.5-flash'), // Set a default model
});

export type ProblemGenerationFormValues = z.infer<typeof ProblemGenerationSchema>;
