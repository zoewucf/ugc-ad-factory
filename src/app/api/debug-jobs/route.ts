import { NextResponse } from 'next/server';
import { list, get } from '@vercel/blob';

export async function GET() {
  try {
    // List all jobs in blob storage
    const { blobs } = await list({ prefix: 'jobs/' });

    console.log('Debug: Found', blobs.length, 'job blobs');

    const jobs = await Promise.all(
      blobs.map(async (blob) => {
        try {
          // Use get() with the full URL to read private blobs
          const result = await get(blob.url);

          if (!result) {
            return {
              pathname: blob.pathname,
              url: blob.url,
              uploadedAt: blob.uploadedAt,
              size: blob.size,
              error: 'get() returned null',
            };
          }

          const text = await new Response(result.stream).text();
          const data = JSON.parse(text);

          return {
            pathname: blob.pathname,
            uploadedAt: blob.uploadedAt,
            size: blob.size,
            data,
          };
        } catch (e) {
          return {
            pathname: blob.pathname,
            url: blob.url,
            error: `Exception: ${e instanceof Error ? e.message : String(e)}`,
          };
        }
      })
    );

    return NextResponse.json({
      count: blobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Debug jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to list jobs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
