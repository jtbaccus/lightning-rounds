'use client';

import { CategoryCount } from '@/types/question';

interface CategorySelectorProps {
  categories: CategoryCount[];
  selected: string;
  onChange: (category: string) => void;
  totalRemaining: number;
  totalQuestions: number;
}

export function CategorySelector({
  categories,
  selected,
  onChange,
  totalRemaining,
  totalQuestions,
}: CategorySelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="category" className="text-sm font-medium text-gray-700">
        Category:
      </label>
      <select
        id="category"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="block w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="All">
          All ({totalRemaining}/{totalQuestions})
        </option>
        {categories.map((cat) => (
          <option key={cat.category} value={cat.category}>
            {cat.category} ({cat.remaining}/{cat.total})
          </option>
        ))}
      </select>
    </div>
  );
}
