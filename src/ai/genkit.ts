import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Remove default model - will be passed dynamically
  // model: 'googleai/gemini-2.0-flash',
});
