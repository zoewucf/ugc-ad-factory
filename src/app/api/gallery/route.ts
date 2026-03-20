import { NextResponse } from 'next/server';
import { listAllJobs } from '@/lib/storage';

export async function GET() {
  try {
    const allJobs = await listAllJobs();

    // Separate jobs by status - show ALL completed jobs (with or without video URL)
    const completedJobs = allJobs.filter(
      (job) => job.status === 'completed'
    );

    // Completed jobs that have a video URL (for gallery display)
    const completedWithVideo = allJobs.filter(
      (job) => job.status === 'completed' && job.result?.stitched_video_url
    );

    const errorJobs = allJobs.filter(
      (job) => job.status === 'error'
    );

    const processingJobs = allJobs.filter(
      (job) => job.status === 'processing'
    );

    return NextResponse.json({
      jobs: completedWithVideo,
      allCompleted: completedJobs,
      errors: errorJobs,
      processing: processingJobs,
      total: completedWithVideo.length,
      totalCompleted: completedJobs.length,
      totalErrors: errorJobs.length,
      totalProcessing: processingJobs.length,
      totalJobs: allJobs.length,
    });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
