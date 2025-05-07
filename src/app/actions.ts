
"use server";

import { generateSystemDesignProblem, type GenerateSystemDesignProblemInput, type GenerateSystemDesignProblemOutput } from '@/ai/flows/generate-system-design-problem';
import { z } from 'zod';

export const ProblemGenerationSchema = z.object({
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  problemType: z.string().min(3, "Problem type must be at least 3 characters long."),
});

export type ProblemGenerationFormValues = z.infer<typeof ProblemGenerationSchema>;

interface ActionResult {
  success: boolean;
  data?: GenerateSystemDesignProblemOutput;
  error?: string;
}

export async function generateProblemAction(values: ProblemGenerationFormValues): Promise<ActionResult> {
  try {
    const validatedValues = ProblemGenerationSchema.safeParse(values);
    if (!validatedValues.success) {
      return { success: false, error: "Invalid input: " + validatedValues.error.flatten().fieldErrors };
    }

    const input: GenerateSystemDesignProblemInput = {
      difficultyLevel: validatedValues.data.difficultyLevel,
      problemType: validatedValues.data.problemType,
    };

    const result = await generateSystemDesignProblem(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating system design problem:", error);
    return { success: false, error: "Failed to generate problem. Please try again." };
  }
}
