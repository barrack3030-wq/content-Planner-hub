export type Channel = 'Instagram' | 'Website';

export type InstagramFormat = 'Reel' | 'Carousel' | 'Photo' | 'Story';
export type WebsiteFormat = 'Blog';
export type ContentFormat = InstagramFormat | WebsiteFormat;

export type ContentStatus = 'Idea' | 'Planned' | 'Production' | 'Ready' | 'Published';

export type Priority = 'Low' | 'Medium' | 'High';

export interface ContentItem {
  id: string;
  channel: Channel;
  format: ContentFormat;
  title: string;
  date: string; // YYYY-MM-DD
  pillar: string;
  status: ContentStatus;
  priority: Priority;
  
  // Instagram specific fields
  creativeBrief?: string;
  visualConcept?: string;
  hook?: string;
  caption?: string;
  cta?: string;
  reference?: string;
  objective?: string;

  // Website specific fields
  articleTitle?: string;
  targetKeyword?: string;
  searchIntent?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  articleOutline?: string;
  articleBrief?: string;
  draftArticle?: string;
  featuredImage?: string;
  internalLinkNotes?: string;

  // Common notes
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  channel: Channel;
  suggestedFormat: ContentFormat;
  pillar: string;
  description: string;
  reference?: string;
  priority: Priority;
  notes?: string;
  createdAt: string;
}

export interface InstagramRules {
  reel: number;
  carousel: number;
  photo: number;
  story: number;
}

export interface WebsiteRules {
  blog: number;
}

export interface BrandProfile {
  name: string;
  niche: string;
}

export interface ContentRules {
  instagram: InstagramRules;
  website: WebsiteRules;
}

export interface ContentPillars {
  instagram: string[];
  website: string[];
}

export interface FormatScorecard {
  format: ContentFormat;
  channel: Channel;
  planned: number;
  published: number;
  target: number;
  remaining: number;
  status: 'reached' | 'exceeded' | 'missing';
  message: string;
}

export type WeeklyOverallStatus = 'Complete' | 'On Track' | 'Needs Attention' | 'Missing';

export interface ImportError {
  sheet: string;
  rowNumber: number;
  column: string;
  error: string;
  suggestedCorrection: string;
  rawSnippet?: string;
}
