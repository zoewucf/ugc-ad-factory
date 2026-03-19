import { put, list } from '@vercel/blob';

export interface JobData {
  status: 'processing' | 'completed' | 'error';
  result?: {
    status: string;
    stitched_video_url: string | null;
    headline: string;
    primary_text: string;
    total_duration_seconds: number;
    segment_count: number;
    note?: string;
  };
  error?: string;
  createdAt: number;
  jobId: string;
}

export async function createJob(jobId: string): Promise<string> {
  const data: JobData = {
    status: 'processing',
    createdAt: Date.now(),
    jobId,
  };

  const blob = await put(`jobs/${jobId}.json`, JSON.stringify(data), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function updateJob(jobId: string, data: Partial<JobData>): Promise<string> {
  // Get existing data first
  const existingData = await getJob(jobId);
  const baseData = existingData || { status: 'processing' as const, createdAt: Date.now(), jobId };

  const updatedData = { ...baseData, ...data };

  const blob = await put(`jobs/${jobId}.json`, JSON.stringify(updatedData), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return blob.url;
}

export async function getJob(jobId: string): Promise<JobData | null> {
  try {
    console.log('getJob: Looking for job with prefix:', `jobs/${jobId}`);
    // List blobs with the job prefix to find the URL
    const { blobs } = await list({ prefix: `jobs/${jobId}` });
    console.log('getJob: Found', blobs.length, 'blobs');

    if (blobs.length === 0) {
      return null;
    }

    console.log('getJob: Fetching blob from:', blobs[0].downloadUrl?.substring(0, 50) + '...');
    // Fetch the blob content using the downloadUrl (works for private blobs)
    const response = await fetch(blobs[0].downloadUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.log('getJob: Fetch failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('getJob: Retrieved data with status:', data?.status);
    return data;
  } catch (error) {
    console.error('Error getting job:', error);
    return null;
  }
}
