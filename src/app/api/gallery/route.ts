import { NextResponse } from 'next/server';
import { listAllJobs } from '@/lib/storage';

export async function GET() {
  try {
    const jobs = await listAllJobs();

    // Filter to only completed jobs with video URLs
    const completedJobs = jobs.filter(
      (job) => job.status === 'completed' && job.result?.stitched_video_url
    );

    return NextResponse.json({
      jobs: completedJobs,
      total: completedJobs.length,
    });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
