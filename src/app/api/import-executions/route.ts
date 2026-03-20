import { NextResponse } from 'next/server';
import { createJob, updateJob } from '@/lib/storage';

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_API_URL = process.env.N8N_API_URL || 'https://contentfarm.app.n8n.cloud';
const WORKFLOW_ID = 'CxVVFCfsCluEU27t';

interface N8nExecution {
  id: string;
  startedAt: string;
  stoppedAt: string;
  status: string;
  data?: {
    resultData?: {
      runData?: Record<string, Array<{
        data?: {
          main?: Array<Array<{
            json?: Record<string, unknown>;
          }>>;
        };
      }>>;
    };
  };
}

export async function POST() {
  try {
    if (!N8N_API_KEY) {
      return NextResponse.json({ error: 'N8N_API_KEY not configured' }, { status: 500 });
    }

    // Fetch successful executions
    const listResponse = await fetch(
      `${N8N_API_URL}/api/v1/executions?workflowId=${WORKFLOW_ID}&status=success&limit=50`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      }
    );

    if (!listResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch executions', status: listResponse.status },
        { status: 500 }
      );
    }

    const listData = await listResponse.json();
    const executions = listData.data || [];

    const results = [];

    for (const exec of executions) {
      try {
        // Fetch execution details
        const detailResponse = await fetch(
          `${N8N_API_URL}/api/v1/executions/${exec.id}?includeData=true`,
          {
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
            },
          }
        );

        if (!detailResponse.ok) {
          results.push({ id: exec.id, status: 'error', reason: 'Failed to fetch details' });
          continue;
        }

        const detailData: N8nExecution = await detailResponse.json();

        // Extract data from the execution
        const runData = detailData.data?.resultData?.runData;
        if (!runData) {
          results.push({ id: exec.id, status: 'skipped', reason: 'No run data' });
          continue;
        }

        // Get input from User Idea node
        const userIdeaData = runData['User Idea']?.[0]?.data?.main?.[0]?.[0]?.json;

        // Get output from Final Output nodes
        const stitchedOutput = runData['Final Output (Stitched)']?.[0]?.data?.main?.[0]?.[0]?.json;
        const planOutput = runData['Final Output (Plan or No Stitch)']?.[0]?.data?.main?.[0]?.[0]?.json;

        const output = stitchedOutput || planOutput;

        if (!output) {
          results.push({ id: exec.id, status: 'skipped', reason: 'No output data' });
          continue;
        }

        // Create job ID from execution ID
        const jobId = `n8n-exec-${exec.id}`;

        // Create the job
        await createJob(jobId, {
          clientId: (userIdeaData?.client_id as string) || undefined,
          clientName: (output.client_name as string) || (userIdeaData?.client_context as { name?: string })?.name || undefined,
          idea: (userIdeaData?.idea as string) || undefined,
          platform: (userIdeaData?.platform as string) || 'tiktok',
          duration: (userIdeaData?.target_duration_seconds as number) || 60,
        });

        // Update with result
        await updateJob(jobId, {
          status: 'completed',
          createdAt: new Date(exec.startedAt).getTime(),
          updatedAt: new Date(exec.stoppedAt || exec.startedAt).getTime(),
          result: {
            status: (output.status as string) || 'completed',
            stitched_video_url: (output.stitched_video_url as string) || null,
            headline: (output.headline as string) || '',
            primary_text: (output.primary_text as string) || '',
            total_duration_seconds: (output.total_duration_seconds as number) || 0,
            segment_count: (output.segment_count as number) || 0,
            note: (output.note as string) || undefined,
          },
        });

        results.push({
          id: exec.id,
          jobId,
          status: 'imported',
          videoUrl: output.stitched_video_url || null,
        });
      } catch (e) {
        results.push({
          id: exec.id,
          status: 'error',
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const imported = results.filter((r) => r.status === 'imported').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      total: executions.length,
      imported,
      skipped,
      errors,
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
