'use client';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="bg-elevated rounded-xl p-2 mb-6">
      <nav className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 px-8 py-4 font-display font-bold text-sm uppercase tracking-wider rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-neon-gold text-void shadow-glow-gold'
                : 'text-silver hover:text-white hover:bg-deep'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
