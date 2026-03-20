import { NextRequest, NextResponse } from 'next/server';
import { del, list } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Find the blob
    const { blobs } = await list({ prefix: `jobs/${jobId}.json` });

    if (blobs.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Delete the blob
    await del(blobs[0].url);

    return NextResponse.json({ success: true, deleted: jobId });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
