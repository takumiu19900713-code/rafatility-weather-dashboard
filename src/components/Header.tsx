import React from 'react';
import type { AuthUser } from '../hooks/useAuth';

interface Props {
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading: boolean;
  user: AuthUser | null;
  onLogout: () => void;
  onHelp: () => void;
}

export const Header: React.FC<Props> = ({ lastUpdated, onRefresh, loading, user, onLogout, onHelp }) => {
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
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-200 hidden sm:inline">最終更新: {formatted}</span>
          <button
            onClick={onHelp}
            className="bg-white/20 text-white font-medium px-2.5 py-1 rounded text-xs hover:bg-white/30 transition-colors"
            title="使い方ガイド"
          >
            ❓ ヘルプ
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-white text-primary font-semibold px-3 py-1 rounded text-xs hover:bg-green-50 disabled:opacity-50 transition-colors"
          >
            {loading ? '更新中...' : '🔄 更新'}
          </button>
          {user && (
            <button
              onClick={onLogout}
              className="bg-white/10 text-white text-xs px-2.5 py-1 rounded hover:bg-white/20 transition-colors hidden sm:block"
              title={`${user.name} としてログイン中`}
            >
              {user.role === '管理者' ? '🔑' : '👤'} {user.name}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
