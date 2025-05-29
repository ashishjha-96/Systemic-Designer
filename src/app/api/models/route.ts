import { NextResponse } from 'next/server';

interface Model {
  name: string;
  supportedGenerationMethods: string[];
  // Add other properties if needed, but these are the core ones for this task
}

interface ModelsResponse {
  models: Model[];
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set.');
    return NextResponse.json(
      { error: 'API key not configured. Please set the GEMINI_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Google API request failed with status ${response.status}: ${response.statusText}`,
        errorBody
      );
      return NextResponse.json(
        { 
          error: 'Failed to fetch models from Google API.',
          details: errorBody 
        },
        { status: response.status || 500 }
      );
    }

    const data = (await response.json()) as ModelsResponse;

    if (!data.models || !Array.isArray(data.models)) {
      console.error('Invalid response format from Google API: "models" array not found or not an array.');
      return NextResponse.json(
        { error: 'Invalid response format from Google API.' },
        { status: 500 }
      );
    }

    const availableModels = data.models
      .filter(model => 
        model.supportedGenerationMethods && // Check if supportedGenerationMethods exists
        model.supportedGenerationMethods.includes('generateContent')
      )
      .map(model => model.name);

    return NextResponse.json({ models: availableModels }, { status: 200 });

  } catch (error) {
    console.error('Error fetching or processing models in API route:', error);
    let errorMessage = 'An unexpected error occurred while fetching models.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { 
        error: 'Failed to retrieve models.',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
