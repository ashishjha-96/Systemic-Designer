
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
    const msg = error instanceof Error ? error.message : "";

    // Rate limit / quota exceeded
    if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota")) {
      const retryMatch = msg.match(/retry in ([\d.]+)s/i);
      const retrySec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;
      const retryHint = retrySec ? ` Please try again in ~${retrySec} seconds.` : " Please wait a moment and try again.";
      return {
        success: false,
        error: `API rate limit reached for this model.${retryHint} You can also try switching to a different model.`,
      };
    }

    // Model not found / invalid
    if (msg.includes("404") || msg.includes("not found") || msg.includes("is not supported")) {
      return {
        success: false,
        error: "The selected model is currently unavailable. Please choose a different model and try again.",
      };
    }

    // API key issues
    if (msg.includes("401") || msg.includes("403") || msg.includes("API key")) {
      return {
        success: false,
        error: "API authentication failed. Please check your GOOGLE_API_KEY configuration.",
      };
    }

    const errorMessage = msg || "Failed to generate problem. Please try again.";
    return { success: false, error: errorMessage };
  }
}
