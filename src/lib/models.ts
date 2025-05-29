// Removed: import fetch from 'node-fetch';
// The global fetch should be available in environments where this code runs (browser, Next.js server-side rendering)

/**
 * Fetches available models by calling the internal Next.js API route.
 *
 * @returns A Promise that resolves to an array of model name strings.
 *          Returns an empty array if an error occurs or if the API route
 *          indicates an issue (e.g., by returning an error or an empty list).
 */
export async function fetchAvailableModels(): Promise<string[]> {
  const url = '/api/models'; // Internal API route

  try {
    const response = await fetch(url);

    if (!response.ok) {
      let errorDetails = '';
      try {
        // Attempt to get more detailed error information from the response body
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.details || JSON.stringify(errorData);
      } catch (e) {
        // If parsing error body fails, use status text
        errorDetails = response.statusText;
      }
      console.error(
        `Failed to fetch models from internal API route ${url}. Status: ${response.status}. Details: ${errorDetails}`
      );
      return [];
    }

    // Expecting the API route to return a JSON object like { models: string[] }
    const data = await response.json();

    if (!data || !Array.isArray(data.models)) {
      console.error(
        `Invalid response format from ${url}: "models" array not found or not an array. Response:`, data
      );
      return [];
    }

    return data.models; // This should be an array of model name strings

  } catch (error) {
    console.error(`Error fetching or parsing models from internal API route ${url}:`, error);
    // Check if it's a TypeError (e.g., network error) and provide a more specific message
    if (error instanceof TypeError) {
        console.error("This might be a network error or the API route is not reachable.");
    }
    return [];
  }
}
