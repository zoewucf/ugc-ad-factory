import { put, get, list } from '@vercel/blob';

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
  clientId?: string;
  clientName?: string;
}

export async function createJob(
  jobId: string,
  clientId?: string,
  clientName?: string
): Promise<string> {
  const data: JobData = {
    status: 'processing',
    createdAt: Date.now(),
    jobId,
    clientId,
    clientName,
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
    const pathname = `jobs/${jobId}.json`;
    console.log('getJob: Fetching job:', pathname);

    // Use the get function with private access for authenticated reading
    const result = await get(pathname, {
      access: 'private',
      useCache: false,
    });

    if (!result) {
      console.log('getJob: Job not found:', pathname);
      return null;
    }

    // Read the stream and parse as JSON
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    console.log('getJob: Retrieved data with status:', data?.status);
    return data;
  } catch (error) {
    console.error('Error getting job:', error);
    return null;
  }
}

export async function listAllJobs(): Promise<JobData[]> {
  try {
    const { blobs } = await list({ prefix: 'jobs/' });

    const jobs: JobData[] = [];

    for (const blob of blobs) {
      try {
        // Extract jobId from pathname (jobs/jobId.json)
        const jobId = blob.pathname.replace('jobs/', '').replace('.json', '');
        const jobData = await getJob(jobId);
        if (jobData) {
          jobs.push(jobData);
        }
      } catch (err) {
        console.error('Error fetching job:', blob.pathname, err);
      }
    }

    // Sort by createdAt descending (newest first)
    jobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return jobs;
  } catch (error) {
    console.error('Error listing jobs:', error);
    return [];
  }
}
