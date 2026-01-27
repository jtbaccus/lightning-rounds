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
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No questions answered yet.</p>
        <p className="text-gray-500 text-sm mt-2">
          Questions you answer will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {questions.length} question{questions.length !== 1 ? 's' : ''} answered
        </p>
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {q.category}
              </span>
              <span className="text-xs text-gray-400">#{questions.length - idx}</span>
            </div>
            <p className="text-gray-900 font-medium mb-2">{q.question}</p>
            <p className="text-gray-600 text-sm">{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
