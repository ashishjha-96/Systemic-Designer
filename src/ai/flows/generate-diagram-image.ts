'use server';
/**
 * @fileOverview Generates an image from a textual prompt, typically for a schematic diagram.
 *
 * - generateDiagramImage - A function that generates an image.
 * - GenerateDiagramImageInput - The input type for the generateDiagramImage function.
 * - GenerateDiagramImageOutput - The return type for the generateDiagramImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDiagramImageInputSchema = z.object({
  prompt: z.string().describe('The textual prompt to generate an image from. Should describe a schematic diagram.'),
});
export type GenerateDiagramImageInput = z.infer<typeof GenerateDiagramImageInputSchema>;

const GenerateDiagramImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateDiagramImageOutput = z.infer<typeof GenerateDiagramImageOutputSchema>;

export async function generateDiagramImage(
  input: GenerateDiagramImageInput
): Promise<GenerateDiagramImageOutput> {
  return generateDiagramImageFlow(input);
}

const generateDiagramImageFlow = ai.defineFlow(
  {
    name: 'generateDiagramImageFlow',
    inputSchema: GenerateDiagramImageInputSchema,
    outputSchema: GenerateDiagramImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Model for image generation
      prompt: `Generate a clear, professional-looking schematic diagram based on the following description: "${input.prompt}". The diagram should use standard system design symbols where appropriate (e.g., cylinders for databases, rectangles for servers, cloud for internet). Ensure components are clearly labeled and connections/data flow are explicitly shown with arrows. The style should be clean and suitable for a technical presentation.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }

    return { imageDataUri: media.url };
  }
);
