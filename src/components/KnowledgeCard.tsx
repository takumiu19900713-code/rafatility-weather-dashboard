import React, { useState } from 'react';
import type { KnowledgeRule } from '../types';

interface Props {
  fieldId: string;
  fieldName: string;
  rules: KnowledgeRule[];
  onAdd: (rule: Omit<KnowledgeRule, 'id' | 'createdAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const EMPTY_FORM = {
  title: '',
  note: '',
  fieldScope: 'field' as 'field' | 'all',
  dryDaysMin: '',
  rainMmMin: '',
  humidityPctMin: '',
  consecutiveRainMin: '',
  riskBonus: '15',
};

export const KnowledgeCard: React.FC<Props> = ({ fieldId, fieldName, rules, onAdd, onToggle, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const visibleRules = rules.filter(r => r.fieldId === 'all' || r.fieldId === fieldId);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    onAdd({
      fieldId: form.fieldScope === 'all' ? 'all' : fieldId,
      title: form.title.trim(),
      note: form.note.trim(),
      condition: {
        dryDaysMin: form.dryDaysMin ? parseInt(form.dryDaysMin) : undefined,
        rainMmMin: form.rainMmMin ? parseFloat(form.rainMmMin) : undefined,
        humidityPctMin: form.humidityPctMin ? parseInt(form.humidityPctMin) : undefined,
        consecutiveRainMin: form.consecutiveRainMin ? parseInt(form.consecutiveRainMin) : undefined,
      },
      riskBonus: parseInt(form.riskBonus) || 15,
      active: true,
    });
    setForm(EMPTY_FORM);
    setOpen(false);
  };

  const f = (key: keyof typeof EMPTY_FORM, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-600">🧠 農家ナレッジルール</h2>
          <p className="text-xs text-gray-400">経験則をルール化して裂果リスク計算に反映</p>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-primary-hover"
        >
          ＋ ルール追加
        </button>
      </div>

      {/* ルール追加フォーム */}
      {open && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-xs font-bold text-blue-700">新しいナレッジルールを登録</p>

          <div>
            <label className="block text-xs text-gray-600 mb-1">ルール名 *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => f('title', e.target.value)}
              placeholder="例: 長期乾燥後の急雨は特に危険"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">メモ・根拠（自由記述）</label>
            <textarea
              value={form.note}
              onChange={e => f('note', e.target.value)}
              placeholder="例: 14日以上晴天続きの後に10mm以上降ると必ず裂果が出る。梨も同じ傾向。"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <p className="text-xs font-bold text-gray-600">発動条件（複数条件はAND）</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">連続晴天日数 ≥</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={form.dryDaysMin}
                  onChange={e => f('dryDaysMin', e.target.value)}
                  placeholder="例: 14"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs text-gray-400">日</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">1日降水量 ≥</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={form.rainMmMin}
                  onChange={e => f('rainMmMin', e.target.value)}
                  placeholder="例: 10"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs text-gray-400">mm</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最大湿度 ≥</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={form.humidityPctMin}
                  onChange={e => f('humidityPctMin', e.target.value)}
                  placeholder="例: 90"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">連続雨天日数 ≥</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={form.consecutiveRainMin}
                  onChange={e => f('consecutiveRainMin', e.target.value)}
                  placeholder="例: 3"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs text-gray-400">日</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">リスク加算点</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={form.riskBonus}
                  onChange={e => f('riskBonus', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-xs text-gray-400">点</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">適用圃場</label>
              <select
                value={form.fieldScope}
                onChange={e => f('fieldScope', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="field">{fieldName}のみ</option>
                <option value="all">全圃場共通</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!form.title.trim()}
              className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-bold disabled:opacity-50 hover:bg-primary-hover"
            >
              登録する
            </button>
          </div>
        </div>
      )}

      {/* ルール一覧 */}
      {visibleRules.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-400">
          <p className="text-2xl mb-2">📝</p>
          <p>まだナレッジルールがありません</p>
          <p>農家さんの経験則を登録してリスク計算に活かしましょう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleRules.map(rule => (
            <div
              key={rule.id}
              className={`rounded-lg border p-3 ${
                rule.active
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-700">{rule.title}</span>
                    {rule.fieldId === 'all' && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">全圃場</span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                      rule.active ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {rule.active ? '有効' : '無効'}
                    </span>
                    <span className="text-xs text-orange-600 font-bold">+{rule.riskBonus}点</span>
                  </div>
                  {rule.note && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rule.note}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {rule.condition.dryDaysMin !== undefined && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                        晴天{rule.condition.dryDaysMin}日以上
                      </span>
                    )}
                    {rule.condition.rainMmMin !== undefined && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        降水{rule.condition.rainMmMin}mm以上
                      </span>
                    )}
                    {rule.condition.humidityPctMin !== undefined && (
                      <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">
                        湿度{rule.condition.humidityPctMin}%以上
                      </span>
                    )}
                    {rule.condition.consecutiveRainMin !== undefined && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                        連続雨天{rule.condition.consecutiveRainMin}日以上
                      </span>
                    )}
                    {Object.values(rule.condition).every(v => v === undefined) && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">常時加算</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => onToggle(rule.id)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    {rule.active ? 'OFF' : 'ON'}
                  </button>
                  <button
                    onClick={() => onDelete(rule.id)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
