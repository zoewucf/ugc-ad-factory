import { put, list, get } from '@vercel/blob';

export interface JobError {
  message: string;
  code?: string;
  node?: string;
  details?: string;
  timestamp?: number;
}

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
  error?: string | JobError;
  createdAt: number;
  updatedAt?: number;
  jobId: string;
  clientId?: string;
  clientName?: string;
  idea?: string;
  platform?: string;
  duration?: number;
}

export interface CreateJobOptions {
  clientId?: string;
  clientName?: string;
  idea?: string;
  platform?: string;
  duration?: number;
}

export async function createJob(
  jobId: string,
  options?: CreateJobOptions
): Promise<string> {
  const data: JobData = {
    status: 'processing',
    createdAt: Date.now(),
    jobId,
    clientId: options?.clientId,
    clientName: options?.clientName,
    idea: options?.idea,
    platform: options?.platform,
    duration: options?.duration,
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
    // List blobs to find the one with matching jobId
    const { blobs } = await list({ prefix: `jobs/${jobId}.json` });

    if (blobs.length === 0) {
      console.log('getJob: Job not found:', jobId);
      return null;
    }

    const blob = blobs[0];
    // Use get() with the full URL to read private blobs
    const result = await get(blob.url);

    if (!result) {
      console.log('getJob: Could not get blob:', blob.url);
      return null;
    }

    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    console.log('getJob: Retrieved data with status:', data?.status);
    return data;
  } catch (error) {
    console.error('Error getting job:', error);
    return null;
  }
}

// Fetch job data directly from blob URL (used by listAllJobs)
async function fetchJobFromUrl(url: string): Promise<JobData | null> {
  try {
    // Use get() with the full URL to read private blobs
    const result = await get(url);
    if (!result) {
      console.error('Failed to get blob:', url);
      return null;
    }
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('Error fetching job from URL:', error);
    return null;
  }
}

export async function listAllJobs(): Promise<JobData[]> {
  try {
    const { blobs } = await list({ prefix: 'jobs/' });
    console.log('listAllJobs: Found', blobs.length, 'blobs');

    const jobs: JobData[] = [];

    for (const blob of blobs) {
      try {
        // Use the blob URL directly to fetch the content
        console.log('Fetching blob:', blob.pathname, 'URL:', blob.url);
        const jobData = await fetchJobFromUrl(blob.url);
        if (jobData) {
          jobs.push(jobData);
        }
      } catch (err) {
        console.error('Error fetching job:', blob.pathname, err);
      }
    }

    console.log('listAllJobs: Successfully fetched', jobs.length, 'jobs');

    // Sort by createdAt descending (newest first)
    jobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return jobs;
  } catch (error) {
    console.error('Error listing jobs:', error);
    return [];
  }
}
