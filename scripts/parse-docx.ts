/**
 * Parse merged_qbank.docx and extract Q&A pairs
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

  // Split by lines and process
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let currentCategory = 'General';
  let currentSubcategory: string | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect category headers (typically all caps or followed by specific patterns)
    // Adjust this regex based on actual document structure
    if (line.match(/^[A-Z][A-Z\s]+$/) && line.length < 50) {
      currentCategory = line.trim();
      currentSubcategory = null;
      i++;
      continue;
    }

    // Detect subcategory (often title case or has specific markers)
    if (line.endsWith(':') && line.length < 60) {
      currentSubcategory = line.replace(/:$/, '').trim();
      i++;
      continue;
    }

    // Try to find Q/A patterns
    // Pattern 1: "Q: ... A: ..."
    if (line.toLowerCase().startsWith('q:') || line.toLowerCase().startsWith('question:')) {
      const questionText = line.replace(/^(q:|question:)\s*/i, '').trim();

      // Look for answer in next lines
      let answerText = '';
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine.toLowerCase().startsWith('a:') || nextLine.toLowerCase().startsWith('answer:')) {
          answerText = nextLine.replace(/^(a:|answer:)\s*/i, '').trim();
          i++;
          break;
        } else if (nextLine.toLowerCase().startsWith('q:') || nextLine.toLowerCase().startsWith('question:')) {
          // No answer found, use placeholder
          break;
        }
        i++;
      }

      if (questionText && answerText) {
        questions.push({
          category: currentCategory,
          subcategory: currentSubcategory,
          question: questionText,
          answer: answerText,
        });
      }
      continue;
    }

    // Pattern 2: Numbered questions (1. Question... Answer:...)
    const numberedMatch = line.match(/^\d+[\.\)]\s*(.+)/);
    if (numberedMatch) {
      let fullText = numberedMatch[1];
      i++;

      // Collect until we hit another number or clear separator
      while (i < lines.length && !lines[i].match(/^\d+[\.\)]/)) {
        fullText += ' ' + lines[i];
        i++;
      }

      // Try to split question/answer
      const answerSplit = fullText.match(/(.+?)\s*(?:Answer:|A:)\s*(.+)/i);
      if (answerSplit) {
        questions.push({
          category: currentCategory,
          subcategory: currentSubcategory,
          question: answerSplit[1].trim(),
          answer: answerSplit[2].trim(),
        });
      }
      continue;
    }

    i++;
  }

  console.log(`Found ${questions.length} questions`);

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`Wrote ${outputPath}`);

  // Print category summary
  const categoryCounts = new Map<string, number>();
  for (const q of questions) {
    categoryCounts.set(q.category, (categoryCounts.get(q.category) || 0) + 1);
  }
  console.log('\nCategories:');
  for (const [cat, count] of Array.from(categoryCounts.entries())) {
    console.log(`  ${cat}: ${count}`);
  }

  if (questions.length < 100) {
    console.log('\n⚠️  Warning: Found fewer questions than expected.');
    console.log('   The document format may need custom parsing logic.');
    console.log('   Review data/questions.json and adjust parse-docx.ts as needed.');
  }
}

parseDocx().catch(console.error);
