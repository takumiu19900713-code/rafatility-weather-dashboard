import React from 'react';
import type { WorkLog } from '../types';
import { analyzePatterns, calcAIAccuracy } from '../utils/patternAnalyzer';

interface Props {
  logs: WorkLog[];
}

export const AILearningCard: React.FC<Props> = ({ logs }) => {
  const patterns = analyzePatterns(logs);
  const accuracy = calcAIAccuracy(logs);
  const evaluated = logs.filter(l => l.outcome !== null).length;
  const total = logs.length;

  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h2 className="text-sm font-bold text-gray-600">AIラーニング進捗</h2>
        <span className="ml-auto text-xs bg-primary text-white px-2 py-0.5 rounded-full">Phase 2</span>
      </div>

      {/* AI accuracy meter */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">ラファティリティ固有AI精度</span>
          <span className="font-bold text-primary">{accuracy > 0 ? `${accuracy}%` : '学習前'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-primary-light to-primary transition-all duration-700"
            style={{ width: `${accuracy}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>記録数: {total}件 / 評価済み: {evaluated}件</span>
          <span>目標: 20件で学習開始</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-400">作業記録</p>
          <p className="font-bold text-lg text-primary">{total}</p>
          <p className="text-gray-400">件</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-400">成功パターン</p>
          <p className="font-bold text-lg text-green-600">{patterns.filter(p => p.outcome === 'good').length}</p>
          <p className="text-gray-400">件</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-400">失敗パターン</p>
          <p className="font-bold text-lg text-red-500">{patterns.filter(p => p.outcome === 'bad').length}</p>
          <p className="text-gray-400">件</p>
        </div>
      </div>

      {/* Detected patterns */}
      {patterns.length > 0 ? (
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">🔍 検出済みパターン</p>
          <div className="space-y-2">
            {patterns.map((p, i) => (
              <div key={i} className={`rounded-lg p-3 text-xs ${p.outcome === 'good' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-bold mb-1 ${p.outcome === 'good' ? 'text-green-700' : 'text-red-700'}`}>
                  {p.outcome === 'good' ? '✅' : '⚠️'} {p.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-600">
          <p className="font-bold mb-1">💡 AIの学習を始めましょう</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-500">
            <li>上の「作業記録」でワンタップ記録</li>
            <li>数日後に「問題なし/裂果発生」で結果を入力</li>
            <li>記録が増えるほどAIがラファティリティ固有パターンを学習</li>
          </ol>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        ※ Phase 2: 記録蓄積で機械学習AIへ発展予定（現在はルールベース補正）
      </p>
    </div>
  );
};
