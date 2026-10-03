import { ContentItem, ContentRules, FormatScorecard, WeeklyOverallStatus, ContentFormat } from '../types/content';
import { isDateInWeek } from './dateUtils';

export interface WeeklyScorecardResult {
  scorecards: {
    instagram: Record<'Reel' | 'Carousel' | 'Photo' | 'Story', FormatScorecard>;
    website: Record<'Blog', FormatScorecard>;
  };
  totalPlanned: number;
  totalPublished: number;
  totalRemaining: number;
  overallStatus: WeeklyOverallStatus;
  missingItemsCount: number;
  summaryList: {
    channel: 'Instagram' | 'Website';
    format: ContentFormat;
    status: 'reached' | 'exceeded' | 'missing';
    message: string;
    missingCount: number;
  }[];
}

export function calculateWeeklyScorecard(
  items: ContentItem[],
  rules: ContentRules,
  monday: Date
): WeeklyScorecardResult {
  const weekItems = items.filter(item => isDateInWeek(item.date, monday));

  // Count by format
  const counts: Record<string, { planned: number; published: number }> = {
    Reel: { planned: 0, published: 0 },
    Carousel: { planned: 0, published: 0 },
    Photo: { planned: 0, published: 0 },
    Story: { planned: 0, published: 0 },
    Blog: { planned: 0, published: 0 },
  };

  weekItems.forEach(item => {
    if (counts[item.format]) {
      counts[item.format].planned += 1;
      if (item.status === 'Published') {
        counts[item.format].published += 1;
      }
    }
  });

  const buildScorecard = (
    format: ContentFormat,
    channel: 'Instagram' | 'Website',
    target: number
  ): FormatScorecard => {
    const planned = counts[format].planned;
    const published = counts[format].published;
    const diff = target - planned;

    let status: 'reached' | 'exceeded' | 'missing';
    let message: string;

    if (diff <= 0) {
      if (planned > target) {
        status = 'exceeded';
        message = 'Target exceeded';
      } else {
        status = 'reached';
        message = '✓ Target reached';
      }
    } else {
      status = 'missing';
      message = `⚠️ Need ${diff} more`;
    }

    return {
      format,
      channel,
      planned,
      published,
      target,
      remaining: Math.max(0, diff),
      status,
      message,
    };
  };

  const instagramCards = {
    Reel: buildScorecard('Reel', 'Instagram', rules.instagram.reel),
    Carousel: buildScorecard('Carousel', 'Instagram', rules.instagram.carousel),
    Photo: buildScorecard('Photo', 'Instagram', rules.instagram.photo),
    Story: buildScorecard('Story', 'Instagram', rules.instagram.story),
  };

  const websiteCards = {
    Blog: buildScorecard('Blog', 'Website', rules.website.blog),
  };

  const allCards = [
    instagramCards.Reel,
    instagramCards.Carousel,
    instagramCards.Photo,
    instagramCards.Story,
    websiteCards.Blog,
  ];

  const totalPlanned = weekItems.length;
  const totalPublished = weekItems.filter(i => i.status === 'Published').length;
  const totalTarget =
    rules.instagram.reel +
    rules.instagram.carousel +
    rules.instagram.photo +
    rules.instagram.story +
    rules.website.blog;

  const missingItemsCount = allCards.reduce((acc, c) => acc + c.remaining, 0);
  const totalRemaining = Math.max(0, totalTarget - totalPlanned);

  // Overall status evaluation:
  let overallStatus: WeeklyOverallStatus = 'On Track';
  const hasZeroItemsForFormat = allCards.some(c => c.target > 0 && c.planned === 0);
  const hasMissing = allCards.some(c => c.remaining > 0);
  const allPublished = allCards.every(c => c.published >= c.target);

  if (allPublished && totalPublished >= totalTarget) {
    overallStatus = 'Complete';
  } else if (!hasMissing) {
    overallStatus = 'On Track';
  } else if (hasZeroItemsForFormat) {
    overallStatus = 'Missing';
  } else {
    overallStatus = 'Needs Attention';
  }

  const summaryList = allCards.map(c => ({
    channel: c.channel,
    format: c.format,
    status: c.status,
    message: c.message,
    missingCount: c.remaining,
  }));

  return {
    scorecards: {
      instagram: instagramCards,
      website: websiteCards,
    },
    totalPlanned,
    totalPublished,
    totalRemaining,
    overallStatus,
    missingItemsCount,
    summaryList,
  };
}

export interface ContentSuggestion {
  channel: 'Instagram' | 'Website';
  format: ContentFormat;
  pillar: string;
  title: string;
  hook?: string;
  creativeBrief?: string;
  reason: string;
}

export function generateSuggestionsForMissing(
  scorecards: WeeklyScorecardResult['scorecards']
): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];

  if (scorecards.instagram.Reel.remaining > 0) {
    suggestions.push({
      channel: 'Instagram',
      format: 'Reel',
      pillar: 'Education',
      title: '3 Counter-Intuitive Truths Nobody Tells You About [Your Industry]',
      hook: 'If you want to achieve [Goal] faster, stop following this conventional advice.',
      creativeBrief: 'Fast-paced 25s talking-head or screen capture highlighting 3 contrarian insights with crisp on-screen text.',
      reason: `Instagram Reel is missing ${scorecards.instagram.Reel.remaining} slot(s)`,
    });
    if (scorecards.instagram.Reel.remaining > 1) {
      suggestions.push({
        channel: 'Instagram',
        format: 'Reel',
        pillar: 'Education',
        title: 'Stop Doing [Common Mistake]! Try This Proven System Instead',
        hook: 'Are you still doing [Outdated Tactic]? Here is the modern approach.',
        creativeBrief: 'Split-screen or side-by-side comparison showing the wrong way vs the right way.',
        reason: 'Fill additional Reel target for the week',
      });
    }
  }

  if (scorecards.instagram.Carousel.remaining > 0) {
    suggestions.push({
      channel: 'Instagram',
      format: 'Carousel',
      pillar: 'Best Practices & Tips',
      title: 'The 5-Step Execution Blueprint: From Zero to Predictable Results',
      hook: 'Swipe through to steal our exact step-by-step workflow template.',
      creativeBrief: '7-slide carousel breakdown: Slide 1 hook cover, Slides 2-6 actionable steps, Slide 7 checklist CTA.',
      reason: `Instagram Carousel is missing ${scorecards.instagram.Carousel.remaining} slot(s)`,
    });
    if (scorecards.instagram.Carousel.remaining > 1) {
      suggestions.push({
        channel: 'Instagram',
        format: 'Carousel',
        pillar: 'Education',
        title: '7 Essential Tools & Shortcuts We Use to Save 10 Hours Weekly',
        hook: 'The ultimate tool stack for streamlined execution.',
        creativeBrief: 'Clean infographic cards featuring software/hardware recommendations and exact use-cases.',
        reason: 'Fill additional Carousel target for the week',
      });
    }
  }

  if (scorecards.instagram.Photo.remaining > 0) {
    suggestions.push({
      channel: 'Instagram',
      format: 'Photo',
      pillar: 'Inspiration',
      title: 'Strategic Principle of the Week: Quiet Compounding',
      hook: 'Consistency beats intensity. One small high-quality action every single day.',
      creativeBrief: 'Minimalist high-contrast still photo (workspace, clean typography, or product texture) paired with thoughtful long-form caption.',
      reason: `Instagram Photo is missing ${scorecards.instagram.Photo.remaining} slot(s)`,
    });
  }

  if (scorecards.instagram.Story.remaining > 0) {
    suggestions.push({
      channel: 'Instagram',
      format: 'Story',
      pillar: 'Community & Engagement',
      title: 'Weekly Community Poll: Which Challenge Is Your #1 Bottleneck?',
      hook: 'Quick question for everyone: What is slowing down your progress most right now?',
      creativeBrief: 'Interactive Story poll sticker with 4 distinct options followed by a question box sticker.',
      reason: `Instagram Story is missing ${scorecards.instagram.Story.remaining} slot(s)`,
    });
    if (scorecards.instagram.Story.remaining > 1) {
      suggestions.push({
        channel: 'Instagram',
        format: 'Story',
        pillar: 'Behind The Scenes',
        title: 'Morning Workstation Setup & Sprint Priorities',
        hook: 'Behind the curtain: What we are building today.',
        creativeBrief: 'Authentic 3-part story showing work in progress, draft previews, and quick tips.',
        reason: 'Fill additional Story target for the week',
      });
    }
  }

  if (scorecards.website.Blog.remaining > 0) {
    suggestions.push({
      channel: 'Website',
      format: 'Blog',
      pillar: 'How-To & Tutorials',
      title: 'The Complete Step-by-Step Strategic Guide: Frameworks & Implementation',
      hook: 'An in-depth, evergreen reference manual for professionals aiming for repeatable outcomes.',
      creativeBrief: '2,200-word comprehensive SEO guide featuring diagrams, process checklists, and practical templates.',
      reason: `Website Blog Article is missing ${scorecards.website.Blog.remaining} slot(s)`,
    });
    if (scorecards.website.Blog.remaining > 1) {
      suggestions.push({
        channel: 'Website',
        format: 'Blog',
        pillar: 'Industry Insights & Trends',
        title: 'Key Market Trends & Practical Forecasts: What to Prepare For',
        hook: 'Analyzing shifting patterns, emerging opportunities, and practical advice for the next 12 months.',
        creativeBrief: 'Deep research editorial highlighting data points, expert quotes, and actionable strategic pivots.',
        reason: 'Fill additional Blog Article target for the week',
      });
    }
  }

  return suggestions;
}
