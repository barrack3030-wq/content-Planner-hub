import { ContentItem, ContentIdea, ContentRules, ContentPillars, BrandProfile } from '../types/content';

const STORAGE_KEYS = {
  BRAND_PROFILE: 'cp_brand_profile_v2',
  CONTENT_ITEMS: 'cp_content_items_v2',
  CONTENT_IDEAS: 'cp_content_ideas_v2',
  CONTENT_RULES: 'cp_content_rules_v2',
  CONTENT_PILLARS: 'cp_content_pillars_v2',
};

export const DEFAULT_BRAND_PROFILE: BrandProfile = {
  name: 'General Brand & Creative Studio',
  niche: 'Universal (Applicable to Any Industry)',
};

export const DEFAULT_RULES: ContentRules = {
  instagram: {
    reel: 2,
    carousel: 2,
    photo: 1,
    story: 5,
  },
  website: {
    blog: 2,
  },
};

export const DEFAULT_PILLARS: ContentPillars = {
  instagram: [
    'Education',
    'Inspiration',
    'Storytelling',
    'Behind The Scenes',
    'Product & Service',
    'Community & Engagement',
    'Promotion',
  ],
  website: [
    'How-To & Tutorials',
    'Industry Insights & Trends',
    'Case Studies & Success Stories',
    'Best Practices & Tips',
    'Product & Solution Guides',
    'Thought Leadership',
  ],
};

const SEED_CONTENT_ITEMS: ContentItem[] = [
  // Current Week (Oct 5 - Oct 11, 2026)
  {
    id: 'item-1',
    channel: 'Instagram',
    format: 'Reel',
    title: '5 Common Mistakes Most Beginners Make in [Your Field]',
    date: '2026-10-05',
    pillar: 'Education',
    status: 'Published',
    priority: 'High',
    creativeBrief: 'High-energy 30s breakdown highlighting common misconceptions and actionable fixes.',
    visualConcept: 'Dynamic cuts with clear on-screen typographic callouts for each mistake.',
    hook: 'Stop making these 5 costly mistakes! Here is what top performers do instead.',
    caption: 'When starting out, it is easy to focus on vanity metrics or the wrong priorities. Save this checklist to review your current workflow!',
    cta: 'Save this reel for your weekly planning session!',
    reference: 'Educational reel format #1',
    objective: 'High bookmark / save rate and reach',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'item-2',
    channel: 'Website',
    format: 'Blog',
    title: 'The Complete Step-by-Step Strategic Blueprint for 2026',
    date: '2026-10-06',
    pillar: 'How-To & Tutorials',
    status: 'Published',
    priority: 'High',
    articleTitle: 'The Complete Step-by-Step Strategic Blueprint (2026 Edition)',
    targetKeyword: 'step by step strategic blueprint 2026',
    searchIntent: 'Informational & Tactical',
    metaTitle: 'The Complete Step-by-Step Strategic Blueprint (2026 Guide)',
    metaDescription: 'Discover the actionable frameworks, essential tools, and common pitfalls to avoid when scaling your core outcomes.',
    slug: 'step-by-step-strategic-blueprint-2026',
    articleOutline: '1. Executive Summary\n2. Core Pillars of Execution\n3. 5-Step Action Framework\n4. Common Traps to Avoid\n5. Checklist & Template',
    articleBrief: 'Comprehensive 2,500-word authoritative guide for practitioners seeking predictable execution.',
    draftArticle: 'Consistent growth is rarely the result of random inspiration. Instead, it comes down to repeatable execution...',
    featuredImage: 'https://images.unsplash.com/photo-blueprint-workspace',
    internalLinkNotes: 'Link to /workflow-systems and /case-study-breakdown',
    notes: 'Include downloadable checklist PDF and embed framework summary',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'item-3',
    channel: 'Instagram',
    format: 'Carousel',
    title: '7 Practical Frameworks That Save 10+ Hours Every Week',
    date: '2026-10-07',
    pillar: 'Best Practices & Tips',
    status: 'Ready',
    priority: 'High',
    creativeBrief: '8-slide slide deck breaking down practical productivity and delegation frameworks.',
    visualConcept: 'Slide 1 bold headline cover, Slides 2-7 clean structured cards with diagrams, Slide 8 checklist CTA.',
    hook: 'If your weekly to-do list feels overwhelming, swipe through these 7 frameworks.',
    caption: 'Efficiency is not about working longer; it is about building simple, repeatable systems. Here are the 7 frameworks our team uses every single week.',
    cta: 'Bookmark this carousel before your Monday team sync!',
    reference: 'Infographic carousel system',
    objective: 'Saves and shares',
    createdAt: '2026-10-02T09:00:00Z',
    updatedAt: '2026-10-04T11:00:00Z',
  },
  {
    id: 'item-4',
    channel: 'Instagram',
    format: 'Story',
    title: 'Behind The Scenes: Our Workspace Setup & Daily Workflow',
    date: '2026-10-08',
    pillar: 'Behind The Scenes',
    status: 'Published',
    priority: 'Medium',
    caption: 'Morning prep: tools, desk setup, and top 3 priorities for today.',
    cta: 'Poll sticker: What time do you begin deep work?',
    notes: 'Add interactive poll sticker and question prompt',
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-08T08:00:00Z',
  },
  {
    id: 'item-5',
    channel: 'Instagram',
    format: 'Carousel',
    title: 'Case Study Breakdown: How a Simple Shift Doubled Results',
    date: '2026-10-09',
    pillar: 'Case Studies & Success Stories',
    status: 'Production',
    priority: 'High',
    creativeBrief: 'Breakdown of real before-and-after metrics, core bottleneck, and the solution applied.',
    visualConcept: 'Data chart card followed by 3 key lessons learned.',
    hook: 'Here is what happened when we stopped doing [A] and focused 100% on [B].',
    caption: 'Real data breakdown: The strategy, the implementation timeline, and the measurable results. What would you test first in your own process?',
    cta: 'Drop your thoughts or questions in the comments below!',
    createdAt: '2026-10-03T11:00:00Z',
    updatedAt: '2026-10-03T11:00:00Z',
  },
  {
    id: 'item-6',
    channel: 'Instagram',
    format: 'Photo',
    title: 'Weekend Focus: 1 Core Principle for Long-Term Consistency',
    date: '2026-10-10',
    pillar: 'Inspiration',
    status: 'Ready',
    priority: 'Medium',
    creativeBrief: 'Clean minimalist still photo with subtle quote overlay or inspiring caption.',
    visualConcept: 'Quiet workspace or creative notebook with natural warm morning light.',
    caption: 'Consistency compounds quietly. One small high-quality habit repeated daily beats sporadic intensity every time.',
    cta: 'Share this with someone who needs the reminder today!',
    createdAt: '2026-10-02T12:00:00Z',
    updatedAt: '2026-10-03T14:00:00Z',
  },
  {
    id: 'item-7',
    channel: 'Instagram',
    format: 'Story',
    title: 'Sunday Q&A: Answering Your Strategy Questions',
    date: '2026-10-11',
    pillar: 'Community & Engagement',
    status: 'Planned',
    priority: 'Medium',
    caption: 'Ask us anything about workflow, tools, or upcoming projects!',
    cta: 'Question box sticker',
    notes: 'Recap the top 4 responses in Monday morning story sequence',
    createdAt: '2026-10-03T15:00:00Z',
    updatedAt: '2026-10-03T15:00:00Z',
  },
  {
    id: 'item-8',
    channel: 'Instagram',
    format: 'Story',
    title: 'Quick Productivity Tip of the Day',
    date: '2026-10-09',
    pillar: 'Education',
    status: 'Planned',
    priority: 'Low',
    caption: 'The two-minute rule: If it takes under 120 seconds, execute it immediately.',
    createdAt: '2026-10-03T16:00:00Z',
    updatedAt: '2026-10-03T16:00:00Z',
  },

  // Earlier in October items for Monthly Consistency overview
  {
    id: 'item-oct-1',
    channel: 'Instagram',
    format: 'Reel',
    title: '3 Tools That Automated Half Our Weekly Workload',
    date: '2026-10-01',
    pillar: 'Education',
    status: 'Published',
    priority: 'Medium',
    createdAt: '2026-09-28T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'item-oct-2',
    channel: 'Instagram',
    format: 'Carousel',
    title: 'The Beginner’s Checklist: Everything You Need Before Launch',
    date: '2026-10-02',
    pillar: 'Best Practices & Tips',
    status: 'Published',
    priority: 'Medium',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'item-oct-3',
    channel: 'Website',
    format: 'Blog',
    title: 'Industry Trends & Predictions: What to Watch for in 2027',
    date: '2026-10-03',
    pillar: 'Industry Insights & Trends',
    status: 'Published',
    priority: 'High',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'item-oct-4',
    channel: 'Instagram',
    format: 'Photo',
    title: 'Product Focus & Quality Craftsmanship Showcase',
    date: '2026-10-04',
    pillar: 'Product & Service',
    status: 'Published',
    priority: 'High',
    createdAt: '2026-09-29T11:00:00Z',
    updatedAt: '2026-10-04T11:00:00Z',
  },
];

const SEED_CONTENT_IDEAS: ContentIdea[] = [
  {
    id: 'idea-1',
    title: 'Top 3 Tools Every Professional Needs in Their Daily Stack',
    channel: 'Instagram',
    suggestedFormat: 'Reel',
    pillar: 'Education',
    description: 'Fast-paced screen recording showing 3 indispensable software tools or physical gears and their key shortcuts.',
    reference: 'Tech/tool breakdown format',
    priority: 'High',
    notes: 'Versatile format, can adapt to any industry or profession',
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'idea-2',
    title: 'Complete Evaluation Guide: Choosing the Right Solution for Your Goals',
    channel: 'Website',
    suggestedFormat: 'Blog',
    pillar: 'Product & Solution Guides',
    description: 'Comparison matrix, criteria checklist, and honest pros/cons analysis for modern buyers.',
    reference: 'High-intent search traffic guide',
    priority: 'High',
    notes: 'Strong SEO potential for commercial keyword queries',
    createdAt: '2026-10-02T10:00:00Z',
  },
  {
    id: 'idea-3',
    title: 'Day in the Life / Team Workflow Process Breakdown',
    channel: 'Instagram',
    suggestedFormat: 'Reel',
    pillar: 'Behind The Scenes',
    description: 'Relatable, transparent look into how we tackle complex deliverables from morning coffee to final review.',
    priority: 'Medium',
    createdAt: '2026-10-03T08:00:00Z',
  },
  {
    id: 'idea-4',
    title: 'Audience Poll: Which Challenge Is Your #1 Priority This Month?',
    channel: 'Instagram',
    suggestedFormat: 'Story',
    pillar: 'Community & Engagement',
    description: 'Interactive comparison between 4 key industry challenges to gauge audience interests for future content.',
    priority: 'Low',
    createdAt: '2026-10-03T11:00:00Z',
  },
];

export function loadBrandProfile(): BrandProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRAND_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BRAND_PROFILE, JSON.stringify(DEFAULT_BRAND_PROFILE));
      return DEFAULT_BRAND_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BRAND_PROFILE;
  }
}

export function saveBrandProfile(profile: BrandProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BRAND_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save brand profile:', e);
  }
}

export function loadContentItems(): ContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTENT_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTENT_ITEMS, JSON.stringify(SEED_CONTENT_ITEMS));
      return SEED_CONTENT_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CONTENT_ITEMS;
  }
}

export function saveContentItems(items: ContentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save content items to localStorage:', e);
  }
}

export function loadContentIdeas(): ContentIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTENT_IDEAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTENT_IDEAS, JSON.stringify(SEED_CONTENT_IDEAS));
      return SEED_CONTENT_IDEAS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CONTENT_IDEAS;
  }
}

export function saveContentIdeas(ideas: ContentIdea[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT_IDEAS, JSON.stringify(ideas));
  } catch (e) {
    console.error('Failed to save ideas to localStorage:', e);
  }
}

export function loadContentRules(): ContentRules {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTENT_RULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTENT_RULES, JSON.stringify(DEFAULT_RULES));
      return DEFAULT_RULES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveContentRules(rules: ContentRules): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save rules to localStorage:', e);
  }
}

export function loadContentPillars(): ContentPillars {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTENT_PILLARS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTENT_PILLARS, JSON.stringify(DEFAULT_PILLARS));
      return DEFAULT_PILLARS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PILLARS;
  }
}

export function saveContentPillars(pillars: ContentPillars): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT_PILLARS, JSON.stringify(pillars));
  } catch (e) {
    console.error('Failed to save pillars to localStorage:', e);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.BRAND_PROFILE, JSON.stringify(DEFAULT_BRAND_PROFILE));
  localStorage.setItem(STORAGE_KEYS.CONTENT_ITEMS, JSON.stringify(SEED_CONTENT_ITEMS));
  localStorage.setItem(STORAGE_KEYS.CONTENT_IDEAS, JSON.stringify(SEED_CONTENT_IDEAS));
  localStorage.setItem(STORAGE_KEYS.CONTENT_RULES, JSON.stringify(DEFAULT_RULES));
  localStorage.setItem(STORAGE_KEYS.CONTENT_PILLARS, JSON.stringify(DEFAULT_PILLARS));
}
