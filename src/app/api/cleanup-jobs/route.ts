import { NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';

export async function POST() {
  try {
    // List all jobs in blob storage
    const { blobs } = await list({ prefix: 'jobs/' });

    console.log('Cleanup: Found', blobs.length, 'job blobs to delete');

    // Delete all blobs
    const urls = blobs.map((blob) => blob.url);

    if (urls.length > 0) {
      await del(urls);
    }

    return NextResponse.json({
      deleted: blobs.length,
      message: `Deleted ${blobs.length} job blobs`,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
