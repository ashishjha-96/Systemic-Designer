'use server';
/**
 * @fileOverview Generates a system design problem with a solution, reasoning, key concepts, and diagrams.
 *
 * - generateSystemDesignProblem - A function that generates a system design problem.
 * - GenerateSystemDesignProblemInput - The input type for the generateSystemDesignProblem function.
 * - GenerateSystemDesignProblemOutput - The return type for the generateSystemDesignProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSystemDesignProblemInputSchema = z.object({
  difficultyLevel: z
    .enum(['Easy', 'Medium', 'Hard'])
    .describe('The difficulty level of the system design problem.'),
  problemType: z.string().describe('The type of system design problem to generate.'),
});
export type GenerateSystemDesignProblemInput = z.infer<
  typeof GenerateSystemDesignProblemInputSchema
>;

const GenerateSystemDesignProblemOutputSchema = z.object({
  problemStatement: z.string().describe('The generated system design problem statement.'),
  solution: z.string().describe('The proposed solution to the system design problem.'),
  reasoning: z.string().describe('The reasoning behind the proposed solution.'),
  keyConcepts: z.string().describe('The key concepts covered by the problem.'),
  diagram: z.string().describe('A diagram illustrating the system design solution.'),
});
export type GenerateSystemDesignProblemOutput = z.infer<
  typeof GenerateSystemDesignProblemOutputSchema
>;

export async function generateSystemDesignProblem(
  input: GenerateSystemDesignProblemInput
): Promise<GenerateSystemDesignProblemOutput> {
  return generateSystemDesignProblemFlow(input);
}

const generateSystemDesignProblemPrompt = ai.definePrompt({
  name: 'generateSystemDesignProblemPrompt',
  input: {schema: GenerateSystemDesignProblemInputSchema},
  output: {schema: GenerateSystemDesignProblemOutputSchema},
  prompt: `You are an expert system design problem generator.

  Generate a system design problem with a solution, reasoning, key concepts, and a diagram description based on the following criteria:

  Difficulty Level: {{{difficultyLevel}}}
  Problem Type: {{{problemType}}}

  Problem Statement:
  Solution:
  Reasoning:
  Key Concepts:
  Diagram Description: A textual description of a diagram visualizing the system design.
  `,
});

const generateSystemDesignProblemFlow = ai.defineFlow(
  {
    name: 'generateSystemDesignProblemFlow',
    inputSchema: GenerateSystemDesignProblemInputSchema,
    outputSchema: GenerateSystemDesignProblemOutputSchema,
  },
  async input => {
    const {output} = await generateSystemDesignProblemPrompt(input);
    return output!;
  }
);
