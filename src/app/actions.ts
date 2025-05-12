
"use server";

import { generateSystemDesignProblem, type GenerateSystemDesignProblemInput, type GenerateSystemDesignProblemOutput } from '@/ai/flows/generate-system-design-problem';
import { ProblemGenerationSchema, type ProblemGenerationFormValues } from '@/lib/schemas';


interface ActionResult {
  success: boolean;
  data?: GenerateSystemDesignProblemOutput;
  error?: string;
}

export async function generateProblemAction(values: ProblemGenerationFormValues): Promise<ActionResult> {
  try {
    // Validate form values including the new modelName field
    const validatedValues = ProblemGenerationSchema.safeParse(values);
    if (!validatedValues.success) {
      // Safely construct the error message
      let errorMessage = "Invalid input: ";
      const fieldErrors = validatedValues.error.flatten().fieldErrors;
      for (const key in fieldErrors) {
        if (fieldErrors[key]) {
          errorMessage += `${key}: ${fieldErrors[key]!.join(', ')}; `;
        }
      }
      return { success: false, error: errorMessage.trim() };
    }

    // Construct input for the Genkit flow, including the modelName
    const input: GenerateSystemDesignProblemInput = {
      difficultyLevel: validatedValues.data.difficultyLevel,
      problemType: validatedValues.data.problemType,
      modelName: validatedValues.data.modelName, // Pass the validated model name
    };

    const result = await generateSystemDesignProblem(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating system design problem:", error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : "Failed to generate problem. Please try again.";
    return { success: false, error: errorMessage };
  }
}
