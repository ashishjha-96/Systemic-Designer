import { NextResponse } from 'next/server';
import { exportToPocket } from '@/lib/downloadUtils'; 
import type { GenerateSystemDesignProblemOutput } from '@/ai/flows/generate-system-design-problem'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      problemData, 
      pocketConsumerKey, 
      pocketAccessToken 
    } = body as { 
      problemData: GenerateSystemDesignProblemOutput; 
      pocketConsumerKey: string; 
      pocketAccessToken: string; 
    };

    if (!problemData || !pocketConsumerKey || !pocketAccessToken) {
      return NextResponse.json({ error: 'Missing required fields: problemData, pocketConsumerKey, and pocketAccessToken are required.' }, { status: 400 });
    }

    const result = await exportToPocket(problemData, pocketConsumerKey, pocketAccessToken);

    if (result.success) {
      // Send back the entire result object from exportToPocket which includes { success: true, data: responseData.item }
      return NextResponse.json(result);
    } else {
      // Log the detailed error on the server for debugging
      console.error('Pocket export failed:', { error: result.error, details: result.errorDetails });

      let statusCode = 500; // Default to internal server error
      
      // Check if errorDetails exists and is an object (as it might be from Pocket's JSON response)
      // or if error string contains typical auth messages.
      if (result.errorDetails && typeof result.errorDetails === 'object') {
        const details = result.errorDetails as any; 
        // Pocket uses X-Error-Code in headers, but the body might also contain status or code.
        // For simplicity, we're checking a hypothetical 'errorCode' or 'status' in the parsed JSON details.
        // The actual error structure from Pocket API via fetch might need specific parsing logic in exportToPocket if not already done.
        // For this example, let's assume errorDetails might contain something like { status: 401 } or { errorCode: '158' }
        if (details.status === 401 || (details.errorCode && ['107', '151', '152', '158', '159', '199'].includes(String(details.errorCode)))) {
            statusCode = 401; // Unauthorized or invalid consumer key/token
        }
        // Add more specific error code mappings if needed
      } else if (result.error) {
        // Fallback to check common error messages if details are not structured as expected
        if (result.error.toLowerCase().includes('invalid consumer key') || 
            result.error.toLowerCase().includes('invalid access token') ||
            result.error.toLowerCase().includes('access token')) {
            statusCode = 401;
        }
      }
      
      return NextResponse.json({ error: result.error || 'Failed to export to Pocket', details: result.errorDetails }, { status: statusCode });
    }
  } catch (error: any) {
    // Log the error for server-side debugging
    console.error('API route /api/export/pocket error:', error);
    
    // Check if the error is due to JSON parsing
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
