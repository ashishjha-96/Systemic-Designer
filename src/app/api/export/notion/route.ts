import { NextResponse } from 'next/server';
import { exportToNotion } from '@/lib/downloadUtils';
import type { GenerateSystemDesignProblemOutput } from '@/ai/flows/generate-system-design-problem';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired size limit
    },
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      problemData, 
      notionApiKey, 
      pageId 
    } = body as { 
      problemData: GenerateSystemDesignProblemOutput; 
      notionApiKey: string; 
      pageId: string; 
    };

    // Validate required fields
    if (!problemData || !notionApiKey || !pageId) {
      return NextResponse.json({ error: 'Missing required fields: problemData, notionApiKey, and pageId are required.' }, { status: 400 });
    }
    
    // Validate specific properties of problemData if necessary (e.g., if it's an empty object)
    // For now, assuming problemData structure is as expected if it exists.

    const result = await exportToNotion(problemData, notionApiKey, pageId);

    if (result.success) {
      // Send back the entire result object from exportToNotion which includes { success: true, data: responseData, pageUrl: pageUrl }
      return NextResponse.json(result);
    } else {
      // Log the detailed error on the server for debugging
      console.error('Notion export failed:', result.error); 
      // Return a generic error message or the specific one from exportToNotion
      // Consider mapping specific error messages from exportToNotion to status codes if needed
      // e.g., if result.error indicates an auth issue, could return 401/403.
      return NextResponse.json({ error: result.error || 'Failed to export to Notion' }, { status: 500 });
    }
  } catch (error: any) {
    // Log the error for server-side debugging
    console.error('API route /api/export/notion error:', error);
    
    // Check if the error is due to JSON parsing
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
