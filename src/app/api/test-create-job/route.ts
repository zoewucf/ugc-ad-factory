import { NextResponse } from 'next/server';
import { createJob, updateJob } from '@/lib/storage';
import { randomUUID } from 'crypto';

export async function POST() {
  try {
    // Create a test job
    const jobId = randomUUID();

    await createJob(jobId, {
      clientId: 'test-client',
      clientName: 'Test Client',
      idea: 'This is a test video idea for gallery testing',
      platform: 'tiktok',
      duration: 60,
    });

    // Mark it as completed with test data
    await updateJob(jobId, {
      status: 'completed',
      updatedAt: Date.now(),
      result: {
        status: 'completed',
        stitched_video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        headline: 'Test Video - Gallery Demo',
        primary_text: 'This is a test video to verify the gallery is working correctly.',
        total_duration_seconds: 60,
        segment_count: 3,
      },
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Test job created successfully',
    });
  } catch (error) {
    console.error('Test create job error:', error);
    return NextResponse.json(
      { error: 'Failed to create test job', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
