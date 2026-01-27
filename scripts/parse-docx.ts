/**
 * Parse merged_qbank.docx and extract Q&A pairs
 *
 * Document structure:
 * - Main categories (7): "Diseases of the X System", "Infectious Diseases", etc.
 * - Subtopics under each category
 * - Each subtopic has a Question/Answer table
 *
 * Pattern: [maybe category] [subtopic] Question Answer [Q&A pairs...]
 *
 * Usage: npx tsx scripts/parse-docx.ts
 * Output: data/questions.json
 */

import * as mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

interface ParsedQuestion {
  category: string;
  subcategory: string | null;
  question: string;
  answer: string;
}

async function parseDocx(): Promise<void> {
  const docxPath = path.join(__dirname, '../data/merged_qbank.docx');
  const outputPath = path.join(__dirname, '../data/questions.json');

  console.log('Reading docx file...');
  const result = await mammoth.extractRawText({ path: docxPath });
  const text = result.value;

  console.log('Parsing questions...');
  const questions: ParsedQuestion[] = [];

  // Split by lines and filter empty
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);

  // Find all "Question"/"Answer" header pairs (marks start of Q&A tables)
  const tableStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].toLowerCase() === 'question' &&
      i + 1 < lines.length &&
      lines[i + 1].toLowerCase() === 'answer'
    ) {
      tableStarts.push(i);
    }
  }

  console.log(`Found ${tableStarts.length} Q&A tables`);

  let currentCategory = 'General';

  // Process each table
  for (let tableIdx = 0; tableIdx < tableStarts.length; tableIdx++) {
    const qHeaderIdx = tableStarts[tableIdx];

    // Line -1 is ALWAYS the subtopic
    const subtopic = lines[qHeaderIdx - 1] || null;

    // Line -2 MIGHT be a main category (if it matches category patterns)
    const maybeCategoryLine = lines[qHeaderIdx - 2] || '';
    if (isMainCategory(maybeCategoryLine)) {
      currentCategory = cleanCategory(maybeCategoryLine);
    }

    // Find where this table ends (next table's headers, accounting for 1-2 heading lines)
    let tableEnd = lines.length;
    if (tableIdx + 1 < tableStarts.length) {
      const nextTableStart = tableStarts[tableIdx + 1];
      // Table ends at the heading(s) before next table
      // Could be 1 line (just subtopic) or 2 lines (category + subtopic)
      const nextMaybeCategory = lines[nextTableStart - 2] || '';
      if (isMainCategory(nextMaybeCategory)) {
        tableEnd = nextTableStart - 2;
      } else {
        tableEnd = nextTableStart - 1;
      }
    }

    // Read Q&A pairs (start after "Question" and "Answer" headers)
    let i = qHeaderIdx + 2;
    while (i + 1 < tableEnd) {
      const question = lines[i];
      const answer = lines[i + 1];

      questions.push({
        category: currentCategory,
        subcategory: subtopic,
        question: question,
        answer: answer,
      });

      i += 2;
    }
  }

  console.log(`Found ${questions.length} questions`);

  // Add IDs for seeding
  const questionsWithIds = questions.map((q, idx) => ({
    id: idx + 1,
    ...q,
    asked: false,
  }));

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(questionsWithIds, null, 2));
  console.log(`Wrote ${outputPath}`);

  // Print summary
  const categoryCounts = new Map<string, number>();
  for (const q of questions) {
    categoryCounts.set(q.category, (categoryCounts.get(q.category) || 0) + 1);
  }

  console.log('\nCategories:');
  for (const [cat, count] of Array.from(categoryCounts.entries()).sort()) {
    console.log(`  ${cat}: ${count}`);
  }

  // Count subcategories per category
  const subcatsByCategory = new Map<string, Set<string>>();
  for (const q of questions) {
    if (q.subcategory) {
      if (!subcatsByCategory.has(q.category)) {
        subcatsByCategory.set(q.category, new Set());
      }
      subcatsByCategory.get(q.category)!.add(q.subcategory);
    }
  }

  console.log('\nSubcategories per category:');
  for (const [cat, subs] of Array.from(subcatsByCategory.entries()).sort()) {
    console.log(`  ${cat}: ${subs.size} subtopics`);
  }

  if (questions.length < 600) {
    console.log('\n⚠️  Warning: Found fewer questions than expected (659).');
  } else {
    console.log('\n✓ Parsing looks good!');
  }
}

/**
 * Check if a line is a main category header
 */
function isMainCategory(line: string): boolean {
  const lower = line.toLowerCase();

  // "Diseases of the X System" pattern
  if (lower.includes('diseases of')) return true;

  // Numbered categories like "2 Diseases of the Pulmonary System"
  if (/^\d+\s+diseases/i.test(line)) return true;

  // Known standalone category names
  const categories = [
    'infectious diseases',
    'geriatrics and palliative care',
    'additional questions',
  ];

  return categories.some((c) => lower.includes(c));
}

/**
 * Clean up category names
 */
function cleanCategory(name: string): string {
  // Remove leading numbers like "2 " or "3 "
  let cleaned = name.replace(/^\d+\s+/, '');
  // Remove "Diseases of the " prefix
  cleaned = cleaned.replace(/^Diseases of the\s+/i, '');
  // Remove trailing "System"
  cleaned = cleaned.replace(/\s+System$/i, '');
  return cleaned.trim();
}

parseDocx().catch(console.error);
