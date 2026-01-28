'use client';

import { Question } from '@/types/question';

interface HistoryListProps {
  questions: Question[];
  loading: boolean;
  onClear: () => void;
}

export function HistoryList({ questions, loading, onClear }: HistoryListProps) {
  if (loading) {
    return (
      <div className="bg-deep rounded-xl border border-elevated p-12 text-center">
        <div className="flex gap-2 justify-center mb-4">
          <span className="loader-dot w-3 h-3 bg-neon-gold rounded-full"></span>
          <span className="loader-dot w-3 h-3 bg-neon-gold rounded-full"></span>
          <span className="loader-dot w-3 h-3 bg-neon-gold rounded-full"></span>
        </div>
        <p className="font-display text-lg text-neon-gold uppercase tracking-widest">
          Loading...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-deep rounded-xl border border-elevated p-12 text-center">
        <p className="font-display text-xl text-silver uppercase tracking-wide mb-2">
          No Questions Answered Yet
        </p>
        <p className="text-silver/60 font-body text-sm">
          Questions you answer will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-neon-gold uppercase tracking-wide">
          {questions.length} question{questions.length !== 1 ? 's' : ''} answered
        </p>
        <button
          onClick={onClear}
          className="px-4 py-2 font-display text-xs font-bold text-neon-pink bg-neon-pink/10 border border-neon-pink/30 rounded-lg hover:bg-neon-pink/20 hover:shadow-glow-pink transition-all duration-200 uppercase"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-deep rounded-xl border-l-4 border-neon-cyan p-4 hover:bg-elevated/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="font-display text-xs text-neon-purple bg-neon-purple/20 px-3 py-1 rounded-full uppercase">
                {q.category}
              </span>
              <span className="font-display text-sm font-bold text-neon-gold">
                #{questions.length - idx}
              </span>
            </div>
            <p className="text-white font-body font-medium mb-2">{q.question}</p>
            <p className="text-silver font-body text-sm">{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
