import React, { useState } from 'react';

interface Props {
  login: (id: string, password: string) => boolean;
}

export const LoginScreen: React.FC<Props> = ({ login }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(id.trim().toLowerCase(), password);
      if (!ok) setError('IDまたはパスワードが正しくありません');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 flex flex-col items-center justify-center px-4">
      {/* ロゴ */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🍇</div>
        <h1 className="text-2xl font-bold text-white">ラファティリティ</h1>
        <p className="text-green-300 text-sm mt-1">圃場単位 気象AIシステム</p>
      </div>

      {/* ログインカード */}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-7">
        <h2 className="text-center text-gray-700 font-bold text-base mb-6">ログイン</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ログインID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => { setId(e.target.value); setError(''); }}
              placeholder="例: admin"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="パスワードを入力"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !id || !password}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {/* 仮ID案内 */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
          <p className="font-bold text-gray-600 mb-2">仮ログイン情報（プロトタイプ用）</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-gray-400">管理者</span>
            <span className="font-mono">admin / rafatility2025</span>
            <span className="text-gray-400">スタッフA</span>
            <span className="font-mono">staff1 / grape2025</span>
            <span className="text-gray-400">スタッフB</span>
            <span className="font-mono">staff2 / grape2025</span>
          </div>
        </div>
      </div>

      <p className="text-green-400 text-xs mt-6">© 2025 株式会社ラファティリティ</p>
    </div>
  );
};
