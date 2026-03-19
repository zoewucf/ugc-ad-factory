import { NextRequest, NextResponse } from 'next/server';
import { updateJob } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    console.log('Callback received for jobId:', jobId);
    console.log('Content-Type:', request.headers.get('content-type'));

    // Get raw text first to see exactly what's being sent
    const rawText = await request.text();
    console.log('Raw body (first 500 chars):', rawText.substring(0, 500));

    // Try to parse as JSON
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse JSON, raw body:', rawText.substring(0, 200));
      // Try to extract data if it's in a weird format
      return NextResponse.json(
        { error: 'Invalid JSON format', received: rawText.substring(0, 100) },
        { status: 400 }
      );
    }

    console.log('Parsed body keys:', Object.keys(body));

    // n8n sends the result here when video generation is complete
    await updateJob(jobId, {
      status: 'completed',
      result: {
        status: (body.status as string) || 'completed',
        stitched_video_url: (body.stitched_video_url as string) || (body.video_url as string) || null,
        headline: (body.headline as string) || '',
        primary_text: (body.primary_text as string) || '',
        total_duration_seconds: (body.total_duration_seconds as number) || (body.duration as number) || 0,
        segment_count: (body.segment_count as number) || 0,
        note: body.note as string | undefined,
      },
    });

    console.log('Job updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to process callback', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
