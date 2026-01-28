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
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-sm font-bold text-neon-gold uppercase tracking-wide">
          Categories ({selectedRemaining}/{selectedTotal} remaining)
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className={`px-4 py-2 font-display text-xs font-bold rounded-lg transition-all duration-200 uppercase ${
              allSelected
                ? 'bg-neon-gold text-void shadow-glow-gold'
                : 'bg-elevated text-silver hover:text-neon-gold hover:bg-elevated/80'
            }`}
          >
            All
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 font-display text-xs font-bold bg-elevated text-silver rounded-lg hover:text-neon-pink hover:bg-elevated/80 transition-all duration-200 uppercase"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const isSelected = allSelected || selected.includes(cat.category);
          return (
            <button
              key={cat.category}
              onClick={() => handleToggle(cat.category)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-neon-cyan/10 border-2 border-neon-cyan shadow-glow-cyan'
                  : 'bg-elevated border-2 border-transparent hover:border-silver/30'
              }`}
            >
              <span className={`font-body text-sm block truncate ${
                isSelected ? 'text-neon-cyan' : 'text-silver'
              }`}>
                {cat.category}
              </span>
              <span className={`font-display text-xs ${
                isSelected ? 'text-neon-cyan/70' : 'text-silver/50'
              }`}>
                {cat.remaining}/{cat.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
