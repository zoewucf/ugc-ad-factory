'use client';

import { useState, useEffect, useRef } from 'react';
import { clients } from '@/lib/clients';

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

interface GalleryJob {
  jobId: string;
  status: string;
  createdAt: number;
  clientId?: string;
  clientName?: string;
  result?: VideoResult;
}

export default function Home() {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [idea, setIdea] = useState('');
  const [duration, setDuration] = useState(60);
  const [platform, setPlatform] = useState('tiktok');
  const [goal, setGoal] = useState('book demos');
  const [status, setStatus] = useState<VideoStatus>('idle');

  const selectedClient = clients.find(c => c.id === clientId);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [galleryJobs, setGalleryJobs] = useState<GalleryJob[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setGalleryJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
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
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setResult(data.result);
        setStatus('completed');
        fetchGallery();
      } else if (data.status === 'error') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setError(data.error || 'Video generation failed');
        setStatus('error');
      }
    } catch (err) {
      console.error('Polling error:', err);
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
          client_id: clientId,
          client_context: selectedClient,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start video generation');
      }

      const data = await response.json();

      if (data.jobId) {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Ambient gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-50%] left-[20%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-subtle-glow" />
          <div className="absolute top-[-30%] right-[10%] w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[100px] animate-subtle-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[80px] animate-subtle-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Ad Factory</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#create" className="text-sm text-gray-400 hover:text-white transition-colors">Create</a>
              <a href="#gallery" className="text-sm text-gray-400 hover:text-white transition-colors">Gallery</a>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">Powered by Sora AI</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.1]">
              Create stunning videos
              <br />
              <span className="gradient-text">with AI magic</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Transform your ideas into professional UGC video ads in minutes.
              Powered by the latest AI technology.
            </p>
          </div>
        </div>
      </div>

      {/* Create Section */}
      <section id="create" className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="glass gradient-border p-8 rounded-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Create Video</h2>
              <p className="text-gray-500 text-sm">Configure your video settings below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Client
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <p className="text-xs text-gray-500 mt-2">{selectedClient.tagline}</p>
                )}
              </div>

              {/* Video Idea */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Video Concept
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your video idea..."
                  className="w-full h-32 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                />
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Duration</label>
                  <span className="text-sm font-medium gradient-text-pink-purple">{duration}s</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                </div>
              </div>

              {/* Platform & Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                  >
                    <option value="book demos">Book Demos</option>
                    <option value="sign up">Sign Up</option>
                    <option value="learn more">Learn More</option>
                    <option value="purchase">Purchase</option>
                    <option value="awareness">Awareness</option>
                  </select>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'generating'}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {status === 'generating' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Video'
                )}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="glass gradient-border p-8 rounded-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Preview</h2>
              <p className="text-gray-500 text-sm">Your generated video will appear here</p>
            </div>

            {status === 'idle' && (
              <div className="aspect-[9/16] max-h-[480px] bg-white/[0.02] rounded-2xl flex items-center justify-center border border-dashed border-white/10 mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Awaiting your creation</p>
                </div>
              </div>
            )}

            {status === 'generating' && (
              <div className="aspect-[9/16] max-h-[480px] bg-white/[0.02] rounded-2xl flex items-center justify-center border border-white/10 mx-auto">
                <div className="text-center px-6">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <p className="text-white font-medium mb-1">Creating magic...</p>
                  <p className="text-gray-500 text-sm mb-4">{formatTime(elapsedTime)}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    AI is generating your video with Sora.<br />This may take 20+ minutes.
                  </p>
                </div>
              </div>
            )}

            {status === 'completed' && result && (
              <div className="space-y-4">
                {result.stitched_video_url ? (
                  <>
                    <div className="aspect-[9/16] max-h-[480px] bg-black rounded-2xl overflow-hidden mx-auto">
                      <video
                        src={result.stitched_video_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-xs text-gray-500">
                      Use the video controls to download
                    </p>
                  </>
                ) : (
                  <div className="aspect-[9/16] max-h-[480px] bg-white/[0.02] rounded-2xl flex items-center justify-center border border-amber-500/20 mx-auto">
                    <div className="text-center px-6">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-amber-400 text-sm font-medium mb-1">Plan Created</p>
                      <p className="text-xs text-gray-500">{result.note || 'Plan-only mode'}</p>
                    </div>
                  </div>
                )}

                {/* Video Info */}
                <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                  <h3 className="font-medium text-white mb-2 text-sm">{result.headline || 'Your Video'}</h3>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>{result.total_duration_seconds}s</span>
                    <span className="text-gray-700">|</span>
                    <span>{result.segment_count} segments</span>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="aspect-[9/16] max-h-[480px] bg-red-500/5 rounded-2xl flex items-center justify-center border border-red-500/10 mx-auto">
                <div className="text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-400 text-sm font-medium mb-1">Generation Failed</p>
                  <p className="text-xs text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="relative max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            <span className="gradient-text-subtle">Gallery</span>
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Browse recently generated videos organized by client
          </p>
        </div>

        {galleryLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          </div>
        ) : galleryJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">No videos generated yet</p>
            <p className="text-gray-700 text-xs mt-1">Create your first video above</p>
          </div>
        ) : (
          <>
            {(() => {
              const groupedByClient: { [key: string]: GalleryJob[] } = {};

              galleryJobs.forEach((job) => {
                const clientKey = job.clientName || job.clientId || 'Unknown Client';
                if (!groupedByClient[clientKey]) {
                  groupedByClient[clientKey] = [];
                }
                groupedByClient[clientKey].push(job);
              });

              return Object.entries(groupedByClient).map(([clientName, jobs]) => (
                <div key={clientName} className="mb-16">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">{clientName}</h3>
                      <p className="text-sm text-gray-600">{jobs.length} video{jobs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {jobs.map((job) => {
                      const isActive = activeVideoId === job.jobId;
                      return (
                      <div
                        key={job.jobId}
                        className={`group bg-white/[0.02] rounded-2xl border overflow-hidden transition-all duration-300 hover:bg-white/[0.04] ${isActive ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-white/5 hover:border-purple-500/30'}`}
                      >
                        {/* Video */}
                        <div
                          className="aspect-[9/16] bg-black relative overflow-hidden cursor-pointer"
                          onClick={() => {
                            const video = document.getElementById(`video-${job.jobId}`) as HTMLVideoElement;
                            if (video) {
                              if (isActive) {
                                video.pause();
                                video.muted = true;
                                setActiveVideoId(null);
                              } else {
                                // Pause any other active video
                                if (activeVideoId) {
                                  const prevVideo = document.getElementById(`video-${activeVideoId}`) as HTMLVideoElement;
                                  if (prevVideo) {
                                    prevVideo.pause();
                                    prevVideo.muted = true;
                                  }
                                }
                                video.muted = false;
                                video.currentTime = 0;
                                video.play();
                                setActiveVideoId(job.jobId);
                              }
                            }
                          }}
                        >
                          <video
                            id={`video-${job.jobId}`}
                            src={job.result?.stitched_video_url || ''}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.muted = true;
                                e.currentTarget.play();
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }
                            }}
                            onEnded={() => {
                              if (isActive) {
                                setActiveVideoId(null);
                              }
                            }}
                          />
                          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {/* Audio indicator when playing */}
                          {isActive && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
                              <div className="flex items-center gap-0.5">
                                <div className="w-0.5 h-3 bg-purple-400 rounded-full animate-pulse" />
                                <div className="w-0.5 h-4 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                              </div>
                              <span className="text-[10px] text-white font-medium">Playing</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-white truncate mb-2">
                            {job.result?.headline || 'Untitled'}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span>{job.result?.total_duration_seconds || 0}s</span>
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>

                          <a
                            href={job.result?.stitched_video_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-gray-300 hover:text-white transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open
                          </a>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              ));
            })()}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-400">Ad Factory</span>
            </div>
            <p className="text-xs text-gray-600">
              Powered by AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
