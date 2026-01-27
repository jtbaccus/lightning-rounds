import { Question } from '@/types/question';
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'questions.json');

// In-memory store for the session (since we can't write to JSON in production easily)
let questionsCache: Question[] | null = null;

export function loadQuestions(): Question[] {
  if (questionsCache) {
    return questionsCache;
  }

  if (!fs.existsSync(DATA_PATH)) {
    return [];
  }

  const data = fs.readFileSync(DATA_PATH, 'utf-8');
  questionsCache = JSON.parse(data) as Question[];
  return questionsCache;
}

export function markAsked(id: number): void {
  const questions = loadQuestions();
  const question = questions.find((q) => q.id === id);
  if (question) {
    question.asked = true;
  }
}

export function resetAll(): void {
  const questions = loadQuestions();
  for (const q of questions) {
    q.asked = false;
  }
}

export function getRandomUnasked(categories?: string[]): Question | null {
  const questions = loadQuestions();
  let unasked = questions.filter((q) => !q.asked);

  if (categories && categories.length > 0) {
    unasked = unasked.filter((q) => categories.includes(q.category));
  }

  if (unasked.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * unasked.length);
  return unasked[randomIndex];
}

export function getCounts(categories?: string[]): { remaining: number; total: number } {
  const questions = loadQuestions();
  let filtered = questions;

  if (categories && categories.length > 0) {
    filtered = questions.filter((q) => categories.includes(q.category));
  }

  return {
    total: filtered.length,
    remaining: filtered.filter((q) => !q.asked).length,
  };
}

export function getCategories(): {
  categories: { category: string; total: number; remaining: number }[];
  totalQuestions: number;
  totalRemaining: number;
} {
  const questions = loadQuestions();
  const categoryMap = new Map<string, { total: number; remaining: number }>();

  for (const q of questions) {
    const current = categoryMap.get(q.category) || { total: 0, remaining: 0 };
    current.total++;
    if (!q.asked) {
      current.remaining++;
    }
    categoryMap.set(q.category, current);
  }

  const categories = Array.from(categoryMap.entries())
    .map(([category, counts]) => ({
      category,
      total: counts.total,
      remaining: counts.remaining,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    categories,
    totalQuestions: questions.length,
    totalRemaining: questions.filter((q) => !q.asked).length,
  };
}
