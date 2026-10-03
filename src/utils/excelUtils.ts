import * as XLSX from 'xlsx';
import { ContentItem, ImportError, InstagramFormat } from '../types/content';
import { isDateInWeek, isDateInMonth } from './dateUtils';

export function downloadExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Instagram Template Sheet
  const instagramHeaders = [
    'Date',
    'Format',
    'Title',
    'Pillar',
    'Objective',
    'Status',
    'Creative Brief',
    'Visual Concept',
    'Caption',
    'CTA',
    'Reference',
    'Notes',
  ];

  const instagramSampleRows = [
    [
      '2026-10-12',
      'Reel',
      '5 Common Mistakes Most Beginners Make in [Your Field]',
      'Education',
      'Brand Awareness & Saves',
      'Planned',
      'Dynamic 30s breakdown highlighting common misconceptions and actionable fixes',
      'Talking-head intro with high-contrast typographic text overlays for each step',
      'Stop making these 5 costly mistakes! Swipe through or save this checklist to refine your workflow...',
      'Save this reel for your weekly planning session!',
      'https://instagram.com/p/sample',
      'Schedule for optimal engagement window (11:00 or 19:00)',
    ],
    [
      '2026-10-14',
      'Carousel',
      '7 Practical Frameworks That Save 10+ Hours Every Week',
      'Best Practices & Tips',
      'Save & Bookmark',
      'Planned',
      '8-slide guide covering practical execution workflows and tool shortcuts',
      'Minimal editorial typography cards with dark accent numbers and summary tables',
      'Efficiency is about building repeatable systems, not working overtime. Here are 7 frameworks we use...',
      'Swipe left and bookmark for your team sync!',
      'Internal template #2',
      'Include downloadable template link in bio',
    ],
  ];

  const wsInstagram = XLSX.utils.aoa_to_sheet([instagramHeaders, ...instagramSampleRows]);
  wsInstagram['!cols'] = [
    { wch: 12 }, // Date
    { wch: 12 }, // Format
    { wch: 35 }, // Title
    { wch: 16 }, // Pillar
    { wch: 18 }, // Objective
    { wch: 12 }, // Status
    { wch: 30 }, // Creative Brief
    { wch: 30 }, // Visual Concept
    { wch: 35 }, // Caption
    { wch: 25 }, // CTA
    { wch: 25 }, // Reference
    { wch: 25 }, // Notes
  ];
  XLSX.utils.book_append_sheet(wb, wsInstagram, 'Instagram');

  // Website Template Sheet
  const websiteHeaders = [
    'Date',
    'Title',
    'Keyword',
    'Search Intent',
    'Pillar',
    'Status',
    'Meta Title',
    'Meta Description',
    'Slug',
    'Outline',
    'Article Brief',
    'Article',
    'Featured Image',
    'Internal Link',
    'Notes',
  ];

  const websiteSampleRows = [
    [
      '2026-10-13',
      'The Complete Step-by-Step Strategic Blueprint for 2026',
      'step by step strategic blueprint 2026',
      'Informational',
      'How-To & Tutorials',
      'Planned',
      'The Complete Step-by-Step Strategic Blueprint (2026 Guide)',
      'Discover actionable frameworks, essential tools, and common pitfalls to avoid when scaling your results.',
      'step-by-step-strategic-blueprint-2026',
      '1. Executive Summary\n2. Core Pillars of Execution\n3. 5-Step Action Framework\n4. Common Traps to Avoid\n5. Checklist',
      'Comprehensive 2,500-word authoritative SEO guide with process diagrams and templates.',
      'Consistent growth is rarely the result of random inspiration...',
      'https://example.com/blueprint.jpg',
      'Link to /workflow-systems and /case-study-breakdown',
      'Include downloadable PDF checklist CTA',
    ],
  ];

  const wsWebsite = XLSX.utils.aoa_to_sheet([websiteHeaders, ...websiteSampleRows]);
  wsWebsite['!cols'] = [
    { wch: 12 }, // Date
    { wch: 40 }, // Title
    { wch: 25 }, // Keyword
    { wch: 16 }, // Search Intent
    { wch: 20 }, // Pillar
    { wch: 12 }, // Status
    { wch: 40 }, // Meta Title
    { wch: 45 }, // Meta Description
    { wch: 25 }, // Slug
    { wch: 30 }, // Outline
    { wch: 30 }, // Article Brief
    { wch: 35 }, // Article
    { wch: 25 }, // Featured Image
    { wch: 25 }, // Internal Link
    { wch: 25 }, // Notes
  ];
  XLSX.utils.book_append_sheet(wb, wsWebsite, 'Website');

  // Trigger download
  XLSX.writeFile(wb, 'Content_Planner_Template.xlsx');
}

export function exportContentToExcel(
  items: ContentItem[],
  filter: 'week' | 'month' | 'all',
  activeMonday?: Date,
  currentYear?: number,
  currentMonth?: number
): void {
  let filtered = items;
  let filenameSuffix = 'All';

  if (filter === 'week' && activeMonday) {
    filtered = items.filter(item => isDateInWeek(item.date, activeMonday));
    filenameSuffix = `Week_${activeMonday.toISOString().slice(0, 10)}`;
  } else if (filter === 'month' && currentYear !== undefined && currentMonth !== undefined) {
    filtered = items.filter(item => isDateInMonth(item.date, currentYear, currentMonth));
    filenameSuffix = `Month_${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  }

  const wb = XLSX.utils.book_new();

  // Instagram Items
  const instagramItems = filtered.filter(item => item.channel === 'Instagram');
  const igRows = instagramItems.map(item => [
    item.date,
    item.format,
    item.title,
    item.pillar || '',
    item.objective || '',
    item.status,
    item.creativeBrief || '',
    item.visualConcept || '',
    item.caption || '',
    item.cta || '',
    item.reference || '',
    item.notes || '',
  ]);

  const instagramHeaders = [
    'Date',
    'Format',
    'Title',
    'Pillar',
    'Objective',
    'Status',
    'Creative Brief',
    'Visual Concept',
    'Caption',
    'CTA',
    'Reference',
    'Notes',
  ];

  const wsInstagram = XLSX.utils.aoa_to_sheet([instagramHeaders, ...igRows]);
  wsInstagram['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 35 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 30 },
    { wch: 30 },
    { wch: 35 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsInstagram, 'Instagram');

  // Website Items
  const websiteItems = filtered.filter(item => item.channel === 'Website');
  const webRows = websiteItems.map(item => [
    item.date,
    item.title,
    item.targetKeyword || '',
    item.searchIntent || '',
    item.pillar || '',
    item.status,
    item.metaTitle || '',
    item.metaDescription || '',
    item.slug || '',
    item.articleOutline || '',
    item.articleBrief || '',
    item.draftArticle || '',
    item.featuredImage || '',
    item.internalLinkNotes || '',
    item.notes || '',
  ]);

  const websiteHeaders = [
    'Date',
    'Title',
    'Keyword',
    'Search Intent',
    'Pillar',
    'Status',
    'Meta Title',
    'Meta Description',
    'Slug',
    'Outline',
    'Article Brief',
    'Article',
    'Featured Image',
    'Internal Link',
    'Notes',
  ];

  const wsWebsite = XLSX.utils.aoa_to_sheet([websiteHeaders, ...webRows]);
  wsWebsite['!cols'] = [
    { wch: 12 },
    { wch: 40 },
    { wch: 25 },
    { wch: 16 },
    { wch: 20 },
    { wch: 12 },
    { wch: 40 },
    { wch: 45 },
    { wch: 25 },
    { wch: 30 },
    { wch: 30 },
    { wch: 35 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsWebsite, 'Website');

  XLSX.writeFile(wb, `Content_Planner_Export_${filenameSuffix}.xlsx`);
}

export interface ParseResult {
  validItems: ContentItem[];
  errors: ImportError[];
}

function cleanString(val: unknown): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function normalizeDate(val: unknown): string | null {
  if (!val) return null;

  // If XLSX parsed as number (Excel date code)
  if (typeof val === 'number') {
    const parsedDate = XLSX.SSF.parse_date_code(val);
    if (parsedDate) {
      const y = parsedDate.y;
      const m = String(parsedDate.m).padStart(2, '0');
      const d = String(parsedDate.d).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(val).trim();
  // Check standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[/-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      // DD/MM/YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  // Try Date parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return null;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { cellDates: false });

  const validItems: ContentItem[] = [];
  const errors: ImportError[] = [];

  const validIgFormats: InstagramFormat[] = ['Reel', 'Carousel', 'Photo', 'Story'];
  const validStatuses = ['Idea', 'Planned', 'Production', 'Ready', 'Published'];

  // 1. Process Instagram Sheet
  const igSheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('instagram'));
  if (igSheetName) {
    const worksheet = workbook.Sheets[igSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown as unknown[][];

    if (rows.length > 1) {
      // header is row 0
      const headerRow = (rows[0] || []).map(h => cleanString(h).toLowerCase());
      const dateIdx = headerRow.findIndex(h => h.includes('date'));
      const formatIdx = headerRow.findIndex(h => h.includes('format'));
      const titleIdx = headerRow.findIndex(h => h.includes('title'));
      const pillarIdx = headerRow.findIndex(h => h.includes('pillar'));
      const statusIdx = headerRow.findIndex(h => h.includes('status'));
      const briefIdx = headerRow.findIndex(h => h.includes('brief'));
      const conceptIdx = headerRow.findIndex(h => h.includes('concept'));
      const captionIdx = headerRow.findIndex(h => h.includes('caption'));
      const ctaIdx = headerRow.findIndex(h => h.includes('cta'));
      const refIdx = headerRow.findIndex(h => h.includes('reference') || h.includes('ref'));
      const notesIdx = headerRow.findIndex(h => h.includes('notes') || h.includes('note'));
      const objIdx = headerRow.findIndex(h => h.includes('objective'));

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0 || row.every(cell => !cell)) continue; // skip blank row

        const rowNumber = r + 1; // 1-indexed Excel row
        const rawDate = dateIdx >= 0 ? row[dateIdx] : undefined;
        const rawFormat = formatIdx >= 0 ? cleanString(row[formatIdx]) : '';
        const rawTitle = titleIdx >= 0 ? cleanString(row[titleIdx]) : '';
        const rawPillar = pillarIdx >= 0 ? cleanString(row[pillarIdx]) : 'Discovery';
        const rawStatus = statusIdx >= 0 ? cleanString(row[statusIdx]) : 'Planned';

        // Validation 1: Title required
        if (!rawTitle) {
          errors.push({
            sheet: 'Instagram',
            rowNumber,
            column: 'Title',
            error: 'Title is empty',
            suggestedCorrection: 'Provide a descriptive title for this Instagram content.',
          });
          continue;
        }

        // Validation 2: Date required & valid
        const cleanDate = normalizeDate(rawDate);
        if (!cleanDate) {
          errors.push({
            sheet: 'Instagram',
            rowNumber,
            column: 'Date',
            error: `Invalid date format: "${cleanString(rawDate)}"`,
            suggestedCorrection: 'Use YYYY-MM-DD format (e.g. 2026-10-12)',
            rawSnippet: cleanString(rawDate),
          });
          continue;
        }

        // Validation 3: Format valid for Instagram
        const matchedFormat = validIgFormats.find(f => f.toLowerCase() === rawFormat.toLowerCase());
        if (!matchedFormat) {
          errors.push({
            sheet: 'Instagram',
            rowNumber,
            column: 'Format',
            error: `Invalid Instagram format: "${rawFormat}"`,
            suggestedCorrection: 'Format must be one of: Reel, Carousel, Photo, Story',
            rawSnippet: rawFormat,
          });
          continue;
        }

        // Validation 4: Status
        const matchedStatus = validStatuses.find(s => s.toLowerCase() === rawStatus.toLowerCase()) || 'Planned';

        const now = new Date().toISOString();
        const newItem: ContentItem = {
          id: `import-ig-${Date.now()}-${r}`,
          channel: 'Instagram',
          format: matchedFormat,
          title: rawTitle,
          date: cleanDate,
          pillar: rawPillar || 'Discovery',
          status: matchedStatus as ContentItem['status'],
          priority: 'Medium',
          creativeBrief: briefIdx >= 0 ? cleanString(row[briefIdx]) : undefined,
          visualConcept: conceptIdx >= 0 ? cleanString(row[conceptIdx]) : undefined,
          caption: captionIdx >= 0 ? cleanString(row[captionIdx]) : undefined,
          cta: ctaIdx >= 0 ? cleanString(row[ctaIdx]) : undefined,
          reference: refIdx >= 0 ? cleanString(row[refIdx]) : undefined,
          objective: objIdx >= 0 ? cleanString(row[objIdx]) : undefined,
          notes: notesIdx >= 0 ? cleanString(row[notesIdx]) : undefined,
          createdAt: now,
          updatedAt: now,
        };

        validItems.push(newItem);
      }
    }
  }

  // 2. Process Website Sheet
  const webSheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('website') || s.toLowerCase().includes('blog'));
  if (webSheetName) {
    const worksheet = workbook.Sheets[webSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown as unknown[][];

    if (rows.length > 1) {
      const headerRow = (rows[0] || []).map(h => cleanString(h).toLowerCase());
      const dateIdx = headerRow.findIndex(h => h.includes('date'));
      const titleIdx = headerRow.findIndex(h => h.includes('title'));
      const kwIdx = headerRow.findIndex(h => h.includes('keyword') || h.includes('kw'));
      const intentIdx = headerRow.findIndex(h => h.includes('intent'));
      const pillarIdx = headerRow.findIndex(h => h.includes('pillar'));
      const statusIdx = headerRow.findIndex(h => h.includes('status'));
      const metaTitleIdx = headerRow.findIndex(h => h.includes('meta title'));
      const metaDescIdx = headerRow.findIndex(h => h.includes('meta desc'));
      const slugIdx = headerRow.findIndex(h => h.includes('slug'));
      const outlineIdx = headerRow.findIndex(h => h.includes('outline'));
      const briefIdx = headerRow.findIndex(h => h.includes('brief'));
      const articleIdx = headerRow.findIndex(h => h === 'article' || h.includes('draft'));
      const imgIdx = headerRow.findIndex(h => h.includes('image'));
      const linkIdx = headerRow.findIndex(h => h.includes('link'));
      const notesIdx = headerRow.findIndex(h => h.includes('notes') || h.includes('note'));

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0 || row.every(cell => !cell)) continue;

        const rowNumber = r + 1;
        const rawDate = dateIdx >= 0 ? row[dateIdx] : undefined;
        const rawTitle = titleIdx >= 0 ? cleanString(row[titleIdx]) : '';
        const rawPillar = pillarIdx >= 0 ? cleanString(row[pillarIdx]) : 'Destination Guide';
        const rawStatus = statusIdx >= 0 ? cleanString(row[statusIdx]) : 'Planned';

        if (!rawTitle) {
          errors.push({
            sheet: 'Website',
            rowNumber,
            column: 'Title',
            error: 'Title is empty',
            suggestedCorrection: 'Provide an article title for Website content.',
          });
          continue;
        }

        const cleanDate = normalizeDate(rawDate);
        if (!cleanDate) {
          errors.push({
            sheet: 'Website',
            rowNumber,
            column: 'Date',
            error: `Invalid date format: "${cleanString(rawDate)}"`,
            suggestedCorrection: 'Use YYYY-MM-DD format (e.g. 2026-10-12)',
            rawSnippet: cleanString(rawDate),
          });
          continue;
        }

        const matchedStatus = validStatuses.find(s => s.toLowerCase() === rawStatus.toLowerCase()) || 'Planned';
        const now = new Date().toISOString();

        const newItem: ContentItem = {
          id: `import-web-${Date.now()}-${r}`,
          channel: 'Website',
          format: 'Blog',
          title: rawTitle,
          date: cleanDate,
          pillar: rawPillar || 'Destination Guide',
          status: matchedStatus as ContentItem['status'],
          priority: 'Medium',
          articleTitle: rawTitle,
          targetKeyword: kwIdx >= 0 ? cleanString(row[kwIdx]) : undefined,
          searchIntent: intentIdx >= 0 ? cleanString(row[intentIdx]) : undefined,
          metaTitle: metaTitleIdx >= 0 ? cleanString(row[metaTitleIdx]) : undefined,
          metaDescription: metaDescIdx >= 0 ? cleanString(row[metaDescIdx]) : undefined,
          slug: slugIdx >= 0 ? cleanString(row[slugIdx]) : undefined,
          articleOutline: outlineIdx >= 0 ? cleanString(row[outlineIdx]) : undefined,
          articleBrief: briefIdx >= 0 ? cleanString(row[briefIdx]) : undefined,
          draftArticle: articleIdx >= 0 ? cleanString(row[articleIdx]) : undefined,
          featuredImage: imgIdx >= 0 ? cleanString(row[imgIdx]) : undefined,
          internalLinkNotes: linkIdx >= 0 ? cleanString(row[linkIdx]) : undefined,
          notes: notesIdx >= 0 ? cleanString(row[notesIdx]) : undefined,
          createdAt: now,
          updatedAt: now,
        };

        validItems.push(newItem);
      }
    }
  }

  // If neither sheet was recognized
  if (!igSheetName && !webSheetName) {
    errors.push({
      sheet: 'Workbook',
      rowNumber: 1,
      column: 'Sheet Names',
      error: 'No sheets named "Instagram" or "Website" found in the uploaded workbook.',
      suggestedCorrection: 'Download the template and use the provided "Instagram" and "Website" sheet names.',
    });
  }

  return { validItems, errors };
}
