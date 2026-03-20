'use client';

import { useState, useEffect } from 'react';

interface VideoResult {
  status: string;
  stitched_video_url: string | null;
  headline: string;
  primary_text: string;
  total_duration_seconds: number;
  segment_count: number;
  note?: string;
}

interface JobData {
  status: string;
  result?: VideoResult;
  jobId: string;
}

const TEST_JOB_ID = 'cc17abfe-e5aa-4115-a44c-a0aa8cb7befc';

export default function TestPage() {
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/status/${TEST_JOB_ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            <span className="gradient-text">Video Preview Test</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono">{TEST_JOB_ID}</p>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            <span>Loading job data...</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {job && (
          <div className="space-y-6">
            <div className="glass gradient-border rounded-2xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Job Status</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500">Status</span>
                  <span className="text-white font-medium">{job.status}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500">Job ID</span>
                  <span className="text-white font-mono text-xs">{job.jobId}</span>
                </div>
              </div>
            </div>

            {job.result && (
              <div className="glass gradient-border rounded-2xl p-6">
                <h2 className="text-lg font-medium text-white mb-6">Video Preview</h2>

                {job.result.stitched_video_url ? (
                  <div className="space-y-4">
                    <div className="aspect-[9/16] max-h-[500px] bg-black rounded-2xl overflow-hidden mx-auto">
                      <video
                        src={job.result.stitched_video_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs text-gray-500">
                      Use the video controls to download
                    </p>

                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                      <h3 className="font-medium text-white mb-2">{job.result.headline || 'UGC Video'}</h3>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{job.result.total_duration_seconds}s</span>
                        <span>{job.result.segment_count} segments</span>
                        <span className="capitalize">{job.result.status}</span>
                      </div>
                      {job.result.primary_text && (
                        <p className="text-sm text-gray-400 mt-3">{job.result.primary_text}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-amber-400 text-sm">No video URL available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
