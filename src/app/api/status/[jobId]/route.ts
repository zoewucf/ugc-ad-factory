import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    console.log('Status check for jobId:', jobId);

    const job = await getJob(jobId);
    console.log('Job data retrieved:', job ? `status=${job.status}` : 'null');

    if (!job) {
      console.log('Job not found in blob storage for:', jobId);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    console.log('Returning job with status:', job.status, 'hasResult:', !!job.result);
    return NextResponse.json(job);
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
