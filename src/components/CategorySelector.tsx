'use client';

import { CategoryCount } from '@/types/question';

interface CategorySelectorProps {
  categories: CategoryCount[];
  selected: string[];
  onChange: (categories: string[]) => void;
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
  const allSelected = selected.length === 0 || selected.length === categories.length;

  const handleToggle = (category: string) => {
    if (selected.length === 0) {
      // Currently "all" - switch to all except this one
      const allExcept = categories.map((c) => c.category).filter((c) => c !== category);
      onChange(allExcept);
    } else if (selected.includes(category)) {
      // Remove category
      const newSelected = selected.filter((c) => c !== category);
      // If none left, select all
      onChange(newSelected.length === 0 ? [] : newSelected);
    } else {
      // Add category
      const newSelected = [...selected, category];
      // If all selected, switch to "all" mode (empty array)
      onChange(newSelected.length === categories.length ? [] : newSelected);
    }
  };

  const handleSelectAll = () => {
    onChange([]);
  };

  const handleClearAll = () => {
    // Select just the first category to avoid empty selection
    if (categories.length > 0) {
      onChange([categories[0].category]);
    }
  };

  // Calculate totals for selected categories
  const selectedRemaining = allSelected
    ? totalRemaining
    : categories
        .filter((c) => selected.includes(c.category))
        .reduce((sum, c) => sum + c.remaining, 0);

  const selectedTotal = allSelected
    ? totalQuestions
    : categories
        .filter((c) => selected.includes(c.category))
        .reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Categories ({selectedRemaining}/{selectedTotal} remaining)
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              allSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {categories.map((cat) => {
          const isSelected = allSelected || selected.includes(cat.category);
          return (
            <label
              key={cat.category}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(cat.category)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 truncate flex-1">
                {cat.category}
              </span>
              <span className="text-xs text-gray-500">
                {cat.remaining}/{cat.total}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
