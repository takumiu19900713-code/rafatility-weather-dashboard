import React from 'react';

interface Props {
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<Props> = ({ lastUpdated, onRefresh, loading }) => {
  const formatted = lastUpdated
    ? lastUpdated.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '---';

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍇</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">ラファティリティ 気象AIシステム</h1>
            <p className="text-xs text-green-200">圃場単位 気象AI補正ダッシュボード</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-200 hidden sm:inline">最終更新: {formatted}</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-white text-primary font-semibold px-3 py-1 rounded text-xs hover:bg-green-50 disabled:opacity-50 transition-colors"
          >
            {loading ? '更新中...' : '🔄 更新'}
          </button>
        </div>
      </div>
    </header>
  );
};
