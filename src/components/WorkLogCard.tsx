import { useState } from 'react';
import type { WorkLog, WorkAction } from '../types';

const ACTION_CONFIG: { id: WorkAction; icon: string; label: string; color: string }[] = [
  { id: 'irrigate',      icon: '💧', label: '散水した',  color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'stop_irrigate', icon: '🚫', label: '散水停止',  color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { id: 'harvest',       icon: '🍇', label: '収穫した',  color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'crack_found',   icon: '⚠️', label: '裂果発見',  color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'fertilize',     icon: '🌱', label: '施肥した',  color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'bagging',       icon: '🛍️', label: '袋かけ',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'spray',         icon: '🧴', label: '農薬散布',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'inspection',    icon: '🔍', label: '観察のみ',  color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

interface Props {
  fieldName: string;
  logs: WorkLog[];
  onAdd: (action: WorkAction, note: string) => void;
  onUpdateOutcome: (id: string, outcome: 'good' | 'bad') => void;
}

export function WorkLogCard({ fieldName, logs, onAdd, onUpdateOutcome }: Props) {
  const [selectedAction, setSelectedAction] = useState<WorkAction | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!selectedAction) return;
    onAdd(selectedAction, note);
    setSelectedAction(null);
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = ['日付', '作業種別', '裂果リスクスコア', '最高気温(℃)', '最低気温(℃)', '降水量(mm)', '結果評価', 'メモ'];
    const rows = logs.map((l) => {
      const cfg = ACTION_CONFIG.find((a) => a.id === l.action);
      return [
        l.date,
        cfg?.label ?? l.action,
        l.crackRiskScore,
        l.weatherSnapshot.tempMax,
        l.weatherSnapshot.tempMin,
        l.weatherSnapshot.precipitation,
        l.outcome === 'good' ? '良好' : l.outcome === 'bad' ? '不良' : '未評価',
        `"${l.note.replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `作業記録_${fieldName}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recentLogs = logs.slice(0, 20);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-700">📝 作業記録（{fieldName}）</h3>
        {logs.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="text-xs text-green-600 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-50 active:scale-95 transition"
          >
            📊 CSV出力
          </button>
        )}
      </div>

      {/* 作業ボタングリッド */}
      <p className="text-xs text-gray-400 mb-2">今日の作業を選択（タップで選択）</p>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {ACTION_CONFIG.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAction(selectedAction === a.id ? null : a.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition active:scale-95
              ${selectedAction === a.id
                ? a.color + ' ring-2 ring-offset-1 ring-current scale-[1.03] shadow-sm'
                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
              }`}
          >
            <span className="text-lg leading-none">{a.icon}</span>
            <span className="text-[10px] font-medium leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      {/* メモ入力 + 保存（作業選択時のみ） */}
      {selectedAction && (
        <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
          <p className="text-sm text-gray-700 font-medium">
            {ACTION_CONFIG.find((a) => a.id === selectedAction)?.icon}{' '}
            {ACTION_CONFIG.find((a) => a.id === selectedAction)?.label} を記録
          </p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="メモ（任意）例: 2時間、圃場A全体"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white py-2 rounded-xl text-sm font-bold active:scale-[0.98] hover:bg-green-700 transition"
          >
            記録する
          </button>
        </div>
      )}

      {saved && (
        <div className="text-center text-green-600 text-sm font-medium py-1 mb-2 animate-pulse">
          ✅ 記録しました（気象データ自動付加済み）
        </div>
      )}

      {/* 直近ログ */}
      {recentLogs.length === 0 ? (
        <p className="text-center text-xs text-gray-300 py-4">まだ記録がありません<br />作業ボタンを押して記録を始めましょう</p>
      ) : (
        <div>
          <p className="text-xs text-gray-400 mb-2">直近の記録（{logs.length}件）</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {recentLogs.map((log) => {
              const cfg = ACTION_CONFIG.find((a) => a.id === log.action);
              return (
                <div key={log.id} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-xl">
                  <span className="text-base w-6 text-center shrink-0">{cfg?.icon ?? '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-gray-700">{cfg?.label ?? log.action}</span>
                      <span className="text-[10px] text-gray-400">{log.date}</span>
                      {log.crackRiskScore > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                          ${log.crackRiskScore >= 70 ? 'bg-red-100 text-red-600'
                          : log.crackRiskScore >= 40 ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'}`}>
                          リスク{log.crackRiskScore}
                        </span>
                      )}
                    </div>
                    {log.note && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{log.note}</p>
                    )}
                  </div>
                  {/* 結果評価ボタン */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onUpdateOutcome(log.id, 'good')}
                      title="良好"
                      className={`text-sm w-7 h-7 rounded-full flex items-center justify-center transition
                        ${log.outcome === 'good' ? 'bg-green-200' : 'bg-gray-100 hover:bg-green-100'}`}
                    >👍</button>
                    <button
                      onClick={() => onUpdateOutcome(log.id, 'bad')}
                      title="不良"
                      className={`text-sm w-7 h-7 rounded-full flex items-center justify-center transition
                        ${log.outcome === 'bad' ? 'bg-red-200' : 'bg-gray-100 hover:bg-red-100'}`}
                    >👎</button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-300 mt-2 text-center">
            ※ 気象データと紐付けて蓄積。CSV出力でExcel分析に活用できます。
          </p>
        </div>
      )}
    </div>
  );
}
