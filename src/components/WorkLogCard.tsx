import React, { useState } from 'react';
import type { WorkAction } from '../types';
import { useWorkLog } from '../hooks/useWorkLog';
import type { CorrectedWeather } from '../types';

interface Props {
  fieldId: string;
  fieldName: string;
  crackRiskScore: number;
  todayWeather: CorrectedWeather | null;
}

const ACTIONS: { action: WorkAction; label: string; icon: string; color: string }[] = [
  { action: 'stop_irrigate', label: '散水停止', icon: '🚫💧', color: 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' },
  { action: 'irrigate',      label: '散水した', icon: '💧',    color: 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' },
  { action: 'bagging',       label: '袋かけ',   icon: '🛍️',   color: 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200' },
  { action: 'inspection',    label: '点検した',  icon: '🔍',   color: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' },
  { action: 'harvest',       label: '収穫した',  icon: '🍇',   color: 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200' },
];

const ACTION_LABELS: Record<WorkAction, string> = {
  stop_irrigate: '散水停止',
  irrigate: '散水',
  bagging: '袋かけ',
  inspection: '点検',
  harvest: '収穫',
};

export const WorkLogCard: React.FC<Props> = ({ fieldId, fieldName, crackRiskScore, todayWeather }) => {
  const { logs, addLog, updateOutcome } = useWorkLog(fieldId, crackRiskScore, todayWeather);
  const [tapped, setTapped] = useState<WorkAction | null>(null);

  const handleTap = (action: WorkAction) => {
    addLog(action);
    setTapped(action);
    setTimeout(() => setTapped(null), 2000);
  };

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📋</span>
        <h2 className="text-sm font-bold text-gray-600">作業記録 — {fieldName}</h2>
        <span className="ml-auto text-xs text-gray-400">ワンタップで記録</span>
      </div>

      {/* One-tap buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
        {ACTIONS.map(({ action, label, icon, color }) => (
          <button
            key={action}
            onClick={() => handleTap(action)}
            className={`border-2 rounded-xl py-3 px-2 text-center font-bold text-xs transition-all ${color} ${tapped === action ? 'scale-95 opacity-70' : ''}`}
          >
            <div className="text-2xl mb-1">{icon}</div>
            {label}
          </button>
        ))}
      </div>

      {tapped && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-2 text-sm text-center mb-3 animate-pulse">
          ✅ 「{ACTION_LABELS[tapped]}」を記録しました（気象データ自動保存済み）
        </div>
      )}

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">直近の記録</p>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{log.date}</span>
                  <span className="font-medium">{ACTION_LABELS[log.action]}</span>
                  <span className="text-gray-400">リスク{log.crackRiskScore}点</span>
                </div>
                {log.outcome === null ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateOutcome(log.id, 'good')}
                      className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 font-bold"
                    >
                      問題なし
                    </button>
                    <button
                      onClick={() => updateOutcome(log.id, 'bad')}
                      className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full hover:bg-red-200 font-bold"
                    >
                      裂果発生
                    </button>
                  </div>
                ) : (
                  <span className={`font-bold px-2 py-0.5 rounded-full ${log.outcome === 'good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.outcome === 'good' ? '✅ 問題なし' : '❌ 裂果発生'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recentLogs.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-3">ボタンを押して最初の記録をしてみましょう</p>
      )}
    </div>
  );
};
