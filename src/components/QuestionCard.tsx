'use client';

import { Question } from '@/types/question';

interface QuestionCardProps {
  question: Question | null;
  showAnswer: boolean;
  showCategory: boolean;
  onReveal: () => void;
  onNext: () => void;
  loading: boolean;
}

export function QuestionCard({
  question,
  showAnswer,
  showCategory,
  onReveal,
  onNext,
  loading,
}: QuestionCardProps) {
  if (loading) {
    return (
      <div className="bg-deep rounded-xl border border-neon-cyan/30 shadow-glow-cyan p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
        <div className="flex gap-2 mb-4">
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

  if (!question) {
    return (
      <div className="bg-deep rounded-xl border border-neon-cyan/30 p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
        <p className="font-display text-2xl text-neon-gold uppercase tracking-wide mb-3">
          No More Questions!
        </p>
        <p className="text-silver font-body">
          Reset to start over, or select a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-deep rounded-xl border border-neon-cyan/30 shadow-glow-cyan p-8 md:p-12 min-h-[300px]">
      {/* Category badge - only shown when filtering by category */}
      {showCategory && (
        <div className="mb-6 flex justify-center">
          <span className="inline-block bg-neon-purple/20 text-neon-purple font-display text-sm px-4 py-2 rounded-full border border-neon-purple/50 shadow-glow-purple uppercase tracking-wide">
            {question.category}
            {question.subcategory && ` / ${question.subcategory}`}
          </span>
        </div>
      )}

      {/* Question */}
      <div className="mb-8 text-center">
        <h2 className="font-question text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Answer (hidden until revealed) */}
      {showAnswer && (
        <div className="mb-8 p-6 bg-neon-green/10 border-2 border-neon-green/50 rounded-xl shadow-glow-green animate-reveal-slide">
          <p className="text-neon-green text-center font-body text-lg md:text-xl leading-relaxed">
            {question.answer}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center">
        {!showAnswer ? (
          <button
            onClick={onReveal}
            className="px-10 py-4 bg-neon-pink text-white font-display font-bold text-lg rounded-xl animate-pulse-glow hover:scale-105 transition-transform duration-200 uppercase tracking-wide"
          >
            Show Answer
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-10 py-4 bg-neon-green text-void font-display font-bold text-lg rounded-xl shadow-glow-green hover:scale-105 transition-transform duration-200 uppercase tracking-wide"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
