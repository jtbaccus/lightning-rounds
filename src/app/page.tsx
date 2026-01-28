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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-black text-neon-gold text-glow-gold tracking-wider uppercase">
            Lightning Rounds
          </h1>
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-deep rounded-xl border border-elevated p-6">
            <CategorySelector
              categories={categories}
              selected={selectedCategories}
              onChange={handleCategoryChange}
              totalRemaining={totalRemaining}
              totalQuestions={totalQuestions}
            />

            <div className="mt-6 pt-4 border-t border-elevated">
              <button
                onClick={() => setActiveTab('play')}
                className="w-full px-6 py-4 bg-neon-gold text-void font-display font-bold text-lg rounded-lg hover:shadow-glow-gold transition-all duration-200 uppercase tracking-wide"
              >
                Start Playing
              </button>
            </div>
          </div>
        )}

        {/* Play Tab */}
        {activeTab === 'play' && (
          <>
            <div className="bg-deep rounded-xl border border-elevated p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-silver font-body">
                  {selectedCategories.length === 0
                    ? 'All categories'
                    : `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`}
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="ml-2 text-neon-cyan hover:text-neon-gold transition-colors"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <ProgressBar remaining={remaining} total={total} />

                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 text-sm font-display font-bold text-neon-pink bg-neon-pink/10 border border-neon-pink/30 rounded-lg hover:bg-neon-pink/20 hover:shadow-glow-pink transition-all duration-200 uppercase"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <p className="text-xs text-silver/70 mt-3 font-body">
                Press{' '}
                <kbd className="px-2 py-1 bg-elevated text-neon-cyan rounded text-xs font-display">
                  Space
                </kbd>{' '}
                to reveal,{' '}
                <kbd className="px-2 py-1 bg-elevated text-neon-green rounded text-xs font-display">
                  Enter
                </kbd>{' '}
                for next
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
          <div className="fixed inset-0 bg-void/90 flex items-center justify-center p-4 z-50">
            <div className="bg-deep rounded-xl border-2 border-neon-gold/50 shadow-glow-gold p-6 max-w-md w-full">
              <h3 className="font-display text-xl font-bold text-neon-gold mb-3 uppercase tracking-wide">
                Reset All Questions?
              </h3>
              <p className="text-silver font-body mb-6">
                This will mark all questions as unasked and clear the history.
                Use this when starting with a new group of students.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-5 py-2.5 text-silver font-display font-bold bg-elevated border border-silver/30 rounded-lg hover:bg-elevated/80 hover:text-white transition-all duration-200 uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 text-void font-display font-bold bg-neon-pink rounded-lg hover:shadow-glow-pink transition-all duration-200 uppercase"
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
