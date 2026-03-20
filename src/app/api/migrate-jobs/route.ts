import { NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';

export async function POST() {
  try {
    // List all jobs in blob storage
    const { blobs } = await list({ prefix: 'jobs/' });

    console.log('Migration: Found', blobs.length, 'job blobs to migrate');

    const results = [];

    for (const blob of blobs) {
      try {
        // Try to fetch from downloadUrl (for private blobs this might work in some cases)
        // If the blob is already public, url will work
        const response = await fetch(blob.downloadUrl);

        if (!response.ok) {
          // Can't read the old blob, skip it
          results.push({
            pathname: blob.pathname,
            status: 'skipped',
            reason: `Cannot read: ${response.status}`,
          });
          continue;
        }

        const data = await response.json();

        // Re-upload as public blob
        await put(blob.pathname, JSON.stringify(data), {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
        });

        results.push({
          pathname: blob.pathname,
          status: 'migrated',
        });
      } catch (e) {
        results.push({
          pathname: blob.pathname,
          status: 'error',
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const migrated = results.filter((r) => r.status === 'migrated').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      total: blobs.length,
      migrated,
      skipped,
      errors,
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
