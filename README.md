# Realistic UGC Factory

AI-powered UGC video ad generator. Turn your ideas into realistic, direct-response video content.

## Setup

### 1. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
cd realistic-ugc-factory
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 2. Configure n8n Workflow

1. **Import the updated workflow** to n8n:
   - Go to your n8n instance: https://contentfarm.app.n8n.cloud
   - Import the file: `AI UGC Ad Factory - Longform Sora.json` from your Desktop
   - The workflow now has a webhook trigger instead of manual trigger

2. **Activate the workflow** in n8n:
   - Open the workflow
   - Click "Activate" in the top right
   - Copy the webhook URL (it will be shown when you click on the Webhook node)
   - The URL format is: `https://contentfarm.app.n8n.cloud/webhook/ugc-factory`

3. **Set the environment variable** in Vercel:
   - Go to your Vercel project settings
   - Add environment variable:
     - Name: `N8N_WEBHOOK_URL`
     - Value: Your webhook URL from step 2

### 3. Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your n8n webhook URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Video Idea Input**: Describe your UGC video concept
- **Duration Control**: 30-90 second videos
- **Platform Selection**: TikTok, Instagram, YouTube Shorts, Facebook
- **Goal Setting**: Book demos, sign up, purchase, etc.
- **Video Preview**: Watch generated videos directly in the browser
- **Download**: Download videos in MP4 format

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- n8n for workflow automation

## Environment Variables

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_URL` | Your n8n webhook URL for the UGC Factory workflow |
