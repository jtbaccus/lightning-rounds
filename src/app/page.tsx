'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { CategorySelector } from '@/components/CategorySelector';
import { ProgressBar } from '@/components/ProgressBar';
import { Question, CategoryCount } from '@/types/question';

export default function Home() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setTotalQuestions(data.totalQuestions || 0);
    setTotalRemaining(data.totalRemaining || 0);
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setShowAnswer(false);

    const url =
      selectedCategory === 'All'
        ? '/api/question'
        : `/api/question?category=${encodeURIComponent(selectedCategory)}`;

    const res = await fetch(url);
    const data = await res.json();

    setQuestion(data.question);
    setRemaining(data.remaining);
    setTotal(data.total);
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleReveal = useCallback(async () => {
    if (!question) return;

    // Mark as asked
    await fetch('/api/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: question.id }),
    });

    setShowAnswer(true);
    setRemaining((r) => Math.max(0, r - 1));
    setTotalRemaining((r) => Math.max(0, r - 1));

    // Update category counts
    setCategories((cats) =>
      cats.map((c) =>
        c.category === question.category
          ? { ...c, remaining: Math.max(0, c.remaining - 1) }
          : c
      )
    );
  }, [question]);

  const handleNext = useCallback(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleReset = async () => {
    await fetch('/api/reset', { method: 'POST' });
    setShowResetConfirm(false);
    await fetchCategories();
    fetchQuestion();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement) return;

      if (e.code === 'Space' && !showAnswer && question) {
        e.preventDefault();
        handleReveal();
      } else if (e.code === 'Enter' && showAnswer) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, question, handleReveal, handleNext]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lightning Rounds
          </h1>
          <p className="text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Space</kbd> to reveal,{' '}
            <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">Enter</kbd> for next
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CategorySelector
              categories={categories}
              selected={selectedCategory}
              onChange={handleCategoryChange}
              totalRemaining={totalRemaining}
              totalQuestions={totalQuestions}
            />

            <div className="flex items-center gap-4">
              <ProgressBar remaining={remaining} total={total} />

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={question}
          showAnswer={showAnswer}
          showCategory={selectedCategory !== 'All'}
          onReveal={handleReveal}
          onNext={handleNext}
          loading={loading}
        />

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset All Questions?
              </h3>
              <p className="text-gray-600 mb-6">
                This will mark all questions as unasked. Use this when starting
                with a new group of students.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
