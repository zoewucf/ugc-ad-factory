import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/lib/storage';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, target_duration_seconds, platform, goal, client_id, client_context } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Video idea is required' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return NextResponse.json(
        { error: 'Video generation service is not configured' },
        { status: 500 }
      );
    }

    // Generate a unique job ID
    const jobId = randomUUID();

    // Get the callback URL (where n8n will POST the result)
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/callback/${jobId}`;

    // Create job in Vercel Blob with client info
    await createJob(jobId, client_id, client_context?.name);

    // Call n8n webhook (fire and forget - don't await)
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idea,
        target_duration_seconds: target_duration_seconds || 60,
        platform: platform || 'tiktok',
        goal: goal || 'book demos',
        callback_url: callbackUrl,
        job_id: jobId,
        client_id: client_id || null,
        client_context: client_context || null,
      }),
    }).catch((err) => {
      console.error('Error calling n8n webhook:', err);
    });

    // Return immediately with job ID
    return NextResponse.json({
      jobId,
      status: 'processing',
      message: 'Video generation started. Poll /api/status/{jobId} for updates.'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
