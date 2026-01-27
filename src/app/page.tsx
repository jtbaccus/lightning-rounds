'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs } from '@/components/Tabs';
import { QuestionCard } from '@/components/QuestionCard';
import { CategorySelector } from '@/components/CategorySelector';
import { ProgressBar } from '@/components/ProgressBar';
import { HistoryList } from '@/components/HistoryList';
import { Question, CategoryCount } from '@/types/question';

const TABS = [
  { id: 'categories', label: 'Categories' },
  { id: 'play', label: 'Play' },
  { id: 'history', label: 'History' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('play');
  const [question, setQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [history, setHistory] = useState<Question[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      selectedCategories.length === 0
        ? '/api/question'
        : `/api/question?categories=${selectedCategories.map(encodeURIComponent).join(',')}`;

    const res = await fetch(url);
    const data = await res.json();

    setQuestion(data.question);
    setRemaining(data.remaining);
    setTotal(data.total);
    setLoading(false);
  }, [selectedCategories]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const res = await fetch(`/api/history?t=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    setHistory(data.questions || []);
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

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

    // Add to local history (will be at the front)
    setHistory((prev) => [{ ...question, asked: true }, ...prev]);
  }, [question]);

  const handleNext = useCallback(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleReset = async () => {
    await fetch('/api/reset', { method: 'POST' });
    setShowResetConfirm(false);
    setHistory([]);
    await fetchCategories();
    fetchQuestion();
  };

  // Keyboard shortcuts (only active on Play tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'play') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

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
  }, [activeTab, showAnswer, question, handleReveal, handleNext]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lightning Rounds
          </h1>
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow p-6">
            <CategorySelector
              categories={categories}
              selected={selectedCategories}
              onChange={handleCategoryChange}
              totalRemaining={totalRemaining}
              totalQuestions={totalQuestions}
            />

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setActiveTab('play')}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Playing
              </button>
            </div>
          </div>
        )}

        {/* Play Tab */}
        {activeTab === 'play' && (
          <>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedCategories.length === 0
                    ? 'All categories'
                    : `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`}
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Change
                  </button>
                </div>

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

              <p className="text-xs text-gray-500 mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> to reveal,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> for next
              </p>
            </div>

            <QuestionCard
              question={question}
              showAnswer={showAnswer}
              showCategory={selectedCategories.length > 0 && selectedCategories.length < categories.length}
              onReveal={handleReveal}
              onNext={handleNext}
              loading={loading}
            />
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <HistoryList
            questions={history}
            loading={historyLoading}
            onClear={() => setShowResetConfirm(true)}
          />
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset All Questions?
              </h3>
              <p className="text-gray-600 mb-6">
                This will mark all questions as unasked and clear the history.
                Use this when starting with a new group of students.
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
