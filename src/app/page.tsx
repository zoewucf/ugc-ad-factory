'use client';

import { useState, useEffect, useRef } from 'react';

type VideoStatus = 'idle' | 'generating' | 'completed' | 'error';

interface VideoResult {
  status: string;
  stitched_video_url: string | null;
  headline: string;
  primary_text: string;
  total_duration_seconds: number;
  segment_count: number;
  note?: string;
}

export default function Home() {
  const [idea, setIdea] = useState('');
  const [duration, setDuration] = useState(60);
  const [platform, setPlatform] = useState('tiktok');
  const [goal, setGoal] = useState('book demos');
  const [status, setStatus] = useState<VideoStatus>('idle');
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pollStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/status/${jobId}`);
      const data = await response.json();

      if (data.status === 'completed' && data.result) {
        // Stop polling
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);

        setResult(data.result);
        setStatus('completed');
      } else if (data.status === 'error') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);

        setError(data.error || 'Video generation failed');
        setStatus('error');
      }
      // If still processing, continue polling
    } catch (err) {
      console.error('Polling error:', err);
      // Don't stop polling on network errors, it might recover
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idea.trim()) {
      setError('Please enter a video idea');
      return;
    }

    setStatus('generating');
    setError(null);
    setResult(null);
    setElapsedTime(0);

    // Set start time and update elapsed time every second
    const now = Date.now();
    setStartTime(now);

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - now) / 1000));
    }, 1000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          target_duration_seconds: duration,
          platform,
          goal,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start video generation');
      }

      const data = await response.json();

      if (data.jobId) {
        // Start polling for status every 5 seconds
        pollingRef.current = setInterval(() => {
          pollStatus(data.jobId);
        }, 5000);
      } else {
        throw new Error('No job ID returned');
      }
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    if (!result?.stitched_video_url) return;

    try {
      const response = await fetch(result.stitched_video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ugc-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download video');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ADM Ad Factory 5.0 Sora
          </h1>
          <p className="text-xl text-purple-200">
            Turn your ideas into AI-generated UGC video ads
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Create Your Video
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Idea */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Video Idea *
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your UGC video concept... e.g., 'A finance creator in a home office explaining why traditional investment strategies are outdated, with a hook about portfolio diversification'"
                  className="w-full h-40 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Duration Slider */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Duration: {duration} seconds
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                </div>
              </div>

              {/* Platform & Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="book demos">Book Demos</option>
                    <option value="sign up">Sign Up</option>
                    <option value="learn more">Learn More</option>
                    <option value="purchase">Purchase</option>
                    <option value="awareness">Brand Awareness</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'generating'}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                {status === 'generating' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Video...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Generate Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Video Preview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Video Preview
            </h2>

            {status === 'idle' && (
              <div className="aspect-[9/16] bg-white/5 rounded-xl flex items-center justify-center border-2 border-dashed border-white/20">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p>Your video will appear here</p>
                </div>
              </div>
            )}

            {status === 'generating' && (
              <div className="aspect-[9/16] bg-white/5 rounded-xl flex items-center justify-center border border-white/20">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-purple-200 font-medium">Creating your video...</p>
                  <p className="text-gray-400 text-sm mt-2">Elapsed: {formatTime(elapsedTime)}</p>
                  <p className="text-gray-500 text-xs mt-4 px-4">
                    AI is generating video segments with Sora and stitching them together. This typically takes 20+ minutes.
                  </p>
                </div>
              </div>
            )}

            {status === 'completed' && result && (
              <div className="space-y-4">
                {result.stitched_video_url ? (
                  <>
                    <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden">
                      <video
                        src={result.stitched_video_url}
                        controls
                        className="w-full h-full object-contain"
                        poster=""
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Video
                    </button>
                  </>
                ) : (
                  <div className="aspect-[9/16] bg-white/5 rounded-xl flex items-center justify-center border border-white/20 p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-yellow-200 font-medium mb-2">Plan Created</p>
                      <p className="text-gray-400 text-sm">{result.note || 'Video generation is in plan-only mode'}</p>
                    </div>
                  </div>
                )}

                {/* Video Details */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <h3 className="font-medium text-white">{result.headline || 'Your UGC Video'}</h3>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{result.total_duration_seconds}s</span>
                    <span>{result.segment_count} segments</span>
                    <span className="capitalize">{result.status}</span>
                  </div>
                  {result.primary_text && (
                    <p className="text-sm text-gray-300 mt-2 line-clamp-3">{result.primary_text}</p>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="aspect-[9/16] bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-200 font-medium">Generation Failed</p>
                  <p className="text-gray-400 text-sm mt-2">{error}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          Powered by AI UGC Ad Factory
        </div>
      </div>
    </div>
  );
}
