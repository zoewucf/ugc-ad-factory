import { NextResponse } from 'next/server';
import { list, getDownloadUrl } from '@vercel/blob';

export async function GET() {
  try {
    // List all jobs in blob storage
    const { blobs } = await list({ prefix: 'jobs/' });

    console.log('Debug: Found', blobs.length, 'job blobs');

    const jobs = await Promise.all(
      blobs.map(async (blob) => {
        try {
          // Use getDownloadUrl to get a signed URL for private blobs
          const downloadUrl = getDownloadUrl(blob.url);
          const response = await fetch(downloadUrl);

          if (!response.ok) {
            return {
              pathname: blob.pathname,
              url: blob.url,
              downloadUrl,
              uploadedAt: blob.uploadedAt,
              size: blob.size,
              error: `Fetch failed: ${response.status} ${response.statusText}`,
            };
          }

          const data = await response.json();

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
