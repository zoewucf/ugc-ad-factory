export interface ClientConfig {
  id: string;
  name: string;
  industry: string;
  description: string;
  targetAudience: string;
  tone: string;
  keySellingPoints: string[];
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  tagline?: string;
  logoUrl?: string;
}

export const clients: ClientConfig[] = [
  {
    id: 'nirvana-systems',
    name: 'Nirvana Systems',
    industry: 'Algorithmic Trading / Fintech',
    description: 'Algorithmic equities trading company founded in 1987. Flagship product OmniFunds is an automated trading platform that plugs into your brokerage account and dynamically switches investments into stocks with highest probability of upward movement, while automatically moving to cash during downturns.',
    targetAudience: 'Serious, self-directed investors 45+ who have tried passive investing or robo advisors and are frustrated by underperformance or market crash exposure. People with meaningful capital, not beginners.',
    tone: 'Confident, authoritative, and slightly contrarian. Position against mainstream investing advice. Educational but persuasive with a "we know something others don\'t" energy backed by 30 years of credibility.',
    keySellingPoints: [
      '30+ years in the industry — founded 1987, algo trading since 2017',
      '12-month satisfaction guarantee',
      'No AUM fees — flat fee structure, never a percentage of assets',
      '100% account control — see every trade before it executes',
      'US-based company with real office, uses only regulated US brokers',
      'Downside protection — automatically moves to cash in bear markets',
      'Live client accounts have historically seen 20-30% annual returns',
      'No leverage, no short selling — lower risk profile',
    ],
    brandColors: {
      primary: '#1e3a5f',
      secondary: '#d4af37',
      accent: '#ffffff',
      background: '#0a1628',
    },
    tagline: 'Algorithmic Trading Since 1987',
  },
  {
    id: 'vector-algorithmics',
    name: 'Vector Algorithmics',
    industry: 'Algorithmic Trading Software',
    description: 'Algorithmic trading software company that licenses automated trading systems to individual investors. Algorithms trade across stocks, futures, and digital assets using market-neutral strategies designed to profit from volatility regardless of market direction.',
    targetAudience: 'Self-directed investors with at least $20K in liquid capital who are frustrated with passive or emotional trading. Ages 30-55, familiar with investing concepts, attracted to systematic approaches. Also targets prop firm traders.',
    tone: 'Transparent, direct, and confidence-forward — deliberately anti-hype. Lean into publishing bad months to build credibility. "We\'ve got nothing to hide" energy, positioning against black-box competitors.',
    keySellingPoints: [
      'Market-neutral — profits whether markets go up, down, or sideways',
      'Zero leverage — returns from edge, not amplified risk',
      '3 asset classes running uncorrelated strategies simultaneously',
      '12-month satisfaction guarantee — full refund if not satisfied',
      '5-year track record, powering the Sofex EU Hedge Fund',
      '4.6/5 Trustpilot rating, 1,000+ active clients',
      '60/40 tax treatment on futures (Section 1256)',
      'Full transparency — publishes losing months openly',
      'Historical returns targeting 4-8% monthly, ~20+% annually combined',
    ],
    brandColors: {
      primary: '#1363F6',
      secondary: '#3A79F8',
      accent: '#00B67A',
      background: '#131A27',
    },
    tagline: 'Systematic Trading. Real Returns.',
  },
  {
    id: 'devvy',
    name: 'Devvy',
    industry: 'Copy Trading / Algorithmic Trading',
    description: 'Algorithmic trading service for blue-chip U.S. stocks using a Human + AI hybrid model. AI identifies high-probability setups, human traders filter opportunities during volatile events. Trades mirror into your brokerage via API. Exclusively Fortune 100 companies, all positions close before 4pm ET — zero overnight risk.',
    targetAudience: 'Conservative, risk-averse investors 35-60 who want market exposure but are anxious about volatility and overnight risk. Skeptical, educated investors wary of typical algo scams.',
    tone: 'Credibility-first and reassuring. Heavy use of verification language. Anticipate skepticism directly. Calm, transparent, and institutional-feeling for a retail product.',
    keySellingPoints: [
      'Third-party verified performance tracked by MarketLog.com since 2023',
      '4.85% average monthly returns with only 3.57% max drawdown',
      '70% win rate across all live trades',
      'Human + AI hybrid — humans pause trading during major volatility',
      'Zero overnight risk — all positions close before 4pm ET daily',
      'Blue-chip stocks only — Apple, Google, Microsoft, Nvidia',
      'One trade at a time — no overexposure',
      'SIPC protected up to $500K',
      'Satisfaction guarantee',
    ],
    brandColors: {
      primary: '#2563EB',
      secondary: '#1A1A1A',
      accent: '#FFFFFF',
      background: '#0A0A0A',
    },
    tagline: 'Human + AI Trading for Blue-Chip Stocks',
  },
  {
    id: 'national-water-systems',
    name: 'National Water Systems',
    industry: 'Home Services / Water Treatment',
    description: 'Professional water treatment service company operating across 7 U.S. locations. Test your home\'s tap water, engineer a system matched to your area\'s specific contaminants, and install same-day. Fully done-for-you model with one flat price, no tiers, no upsells.',
    targetAudience: 'Homeowners 30-60 in suburban U.S. markets concerned about tap water safety but overwhelmed by complicated options. People frustrated by predatory sales tactics. New homeowners and families who noticed hard water issues.',
    tone: 'Clean, trustworthy, and matter-of-fact. Lead with concern (tap water safety) then pivot to simplicity and reassurance. No jargon, no pressure, "we\'ve already figured it out for you" energy. Let the stats do the heavy lifting.',
    keySellingPoints: [
      'Free in-home water testing — no commitment required',
      'Same-day professional installation',
      '1 flat price — no tiers, no upsells, no surprises',
      'Zip code matched — engineered to your area\'s specific contaminants',
      'Removes 99% of contaminants including PFAS, lead, chromium-6',
      '100% satisfaction guarantee — 30-day money-back',
      'US-made products, US-based support',
      '7 locations nationwide',
    ],
    brandColors: {
      primary: '#2563EB',
      secondary: '#1D4ED8',
      accent: '#34D399',
      background: '#080D19',
    },
    tagline: 'Clean Water. One Price. Same-Day Install.',
  },
  {
    id: 'content-farm',
    name: 'Content Farm',
    industry: 'UGC Agency / AI Ad Production',
    description: 'Content Farm builds autonomous UGC creator teams inside brands. One-time setup fee to source creators, build workflows, and install the system — so the brand owns it long-term. Also offers AI Ad Studio: cinematic AI-generated ads at scale, not cheap avatar-style videos.',
    targetAudience: 'DTC brands and growth teams spending $50K+/month on paid ads who are frustrated with expensive agencies ($300+/video) or inconsistent freelancers. Marketing leaders who want fresh creative weekly without hiring in-house.',
    tone: 'Confident, direct, and results-focused. Lead with cost savings and speed. Anti-agency positioning — "own your content team, don\'t rent it." Data-driven proof points. No fluff, no jargon.',
    keySellingPoints: [
      '80% lower cost per video — under $60/video vs. $300+ agency rates',
      'Live in 4–5 weeks — vs. 2–3 months to hire in-house',
      'Fresh creative every 7 days — prevents ad fatigue, keeps ROAS healthy',
      '5.5M+ views generated for clients in the last 90 days',
      'Full perpetual usage rights — no licensing fees',
      'AI Ad Studio — 30 cinematic AI ads/month, any scene or vibe',
      'No 6-month lock-ins — scale up for launches, scale back when quiet',
      'Trusted by Whop, Coffee Meets Bagel, Glam AI, and more',
    ],
    brandColors: {
      primary: '#FF6B35',
      secondary: '#1A1A2E',
      accent: '#F7F7F7',
      background: '#0D0D0D',
    },
    tagline: 'Own Your Content Team. Don\'t Rent It.',
  },
];

export function getClientById(id: string): ClientConfig | undefined {
  return clients.find(client => client.id === id);
}
