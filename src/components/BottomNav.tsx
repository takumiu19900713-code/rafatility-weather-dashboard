import React from 'react';

export type AppTab = 'home' | 'field' | 'weather' | 'data' | 'settings';

interface Props {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  isAdmin: boolean;
}

const tabs: { id: AppTab; icon: string; label: string; adminOnly?: boolean }[] = [
  { id: 'home',     icon: '🏠', label: 'ホーム' },
  { id: 'field',    icon: '📍', label: '圃場' },
  { id: 'weather',  icon: '🌤️', label: '気象' },
  { id: 'data',     icon: '📊', label: 'データ' },
  { id: 'settings', icon: '⚙️', label: '設定' },
];

export const BottomNav: React.FC<Props> = ({ active, onChange, isAdmin }) => {
  const visible = tabs.filter((t) => !t.adminOnly || isAdmin);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.08)' }}>
      <div className="flex">
        {visible.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            >
              <span className={`text-xl leading-tight ${isActive ? 'scale-110' : 'opacity-50'} transition-transform`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-green-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      {/* safe area for iPhone home indicator */}
      <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
};
