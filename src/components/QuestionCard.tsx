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
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-xl text-gray-600">No more questions available!</p>
        <p className="text-gray-500 mt-2">
          Reset to start over, or select a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Category badge - only shown when filtering by category */}
      {showCategory && (
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {question.category}
            {question.subcategory && ` / ${question.subcategory}`}
          </span>
        </div>
      )}

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Answer (hidden until revealed) */}
      {showAnswer && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-900 leading-relaxed">{question.answer}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {!showAnswer ? (
          <button
            onClick={onReveal}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Show Answer
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
