import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Validate required environment variables at startup
if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    'GOOGLE_API_KEY environment variable is required. ' +
    'Please set it in your .env.local file or environment.'
  );
}

export const ai = genkit({
  plugins: [googleAI()],
  // Remove default model - will be passed dynamically
  // model: 'googleai/gemini-2.5-flash',
});
