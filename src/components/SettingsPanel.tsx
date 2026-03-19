import React, { useState } from 'react';
import type { CorrectionParams } from '../hooks/useCorrectionParams';
import { DEFAULT_PARAMS } from '../hooks/useCorrectionParams';
import type { FruitStage, GrowthPhase } from '../types';

const PHASES: { value: GrowthPhase; label: string; period: string; desc: string }[] = [
  { value: '冬季',  label: '❄️ 冬季',  period: '12〜2月', desc: '休眠期・剪定作業' },
  { value: '春季',  label: '🌸 春季',  period: '3〜5月',  desc: '萌芽〜開花・霜注意' },
  { value: '梅雨期',label: '🌧️ 梅雨期',period: '6〜7月',  desc: '着果〜肥大・裂果リスク最高' },
  { value: '収穫期',label: '🍇 収穫期',period: '8〜9月',  desc: '出荷予測・積算温度管理' },
];

const STAGES: { value: FruitStage; label: string; desc: string }[] = [
  { value: '開花前',    label: '開花前',    desc: '花芽形成中。水ストレスは少ない' },
  { value: '開花〜着果',label: '開花〜着果',desc: '受粉・初期着果。適度な水分が必要' },
  { value: '肥大期',    label: '肥大期',    desc: '細胞分裂活発。急激な吸水で裂果多発' },
  { value: '収穫期',    label: '収穫期',    desc: '糖度上昇・果皮薄化。最終調整期' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  params: CorrectionParams;
  onSave: (p: CorrectionParams) => void;
  onReset: () => void;
  fieldName?: string;
  // 生育設定
  phase: GrowthPhase;
  fruitStage: FruitStage;
  floweringDate: string;
  onPhaseChange: (p: GrowthPhase) => void;
  onStageChange: (s: FruitStage) => void;
  onFloweringDateChange: (d: string) => void;
}

function NumInput({
  label, value, onChange, unit, hint,
}: {
  label: string; value: number; onChange: (v: number) => void; unit: string; hint?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <span className="text-xs text-gray-400 w-14">{unit}</span>
      </div>
    </div>
  );
}

export const SettingsPanel: React.FC<Props> = ({
  open, onClose, params, onSave, onReset, fieldName,
  phase, fruitStage, floweringDate,
  onPhaseChange, onStageChange, onFloweringDateChange,
}) => {
  const [draft, setDraft] = useState<CorrectionParams>(params);
  const [tab, setTab] = useState<'growth' | 'correction'>('growth');

  if (!open) return null;

  const update = (path: string, value: number) => {
    const keys = path.split('.');
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as CorrectionParams;
      if (keys.length === 1) (next as any)[keys[0]] = value;
      if (keys.length === 2) (next as any)[keys[0]][keys[1]] = value;
      return next;
    });
  };

  const handleSave = () => { onSave(draft); onClose(); };
  const handleReset = () => { onReset(); setDraft(DEFAULT_PARAMS); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">🔑 管理者設定</h2>
            <p className="text-xs text-gray-400">
              {fieldName ? `📍 ${fieldName}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* タブ切替 */}
        <div className="flex border-b">
          <button
            onClick={() => setTab('growth')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'growth'
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🌱 生育管理
          </button>
          <button
            onClick={() => setTab('correction')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'correction'
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚙️ 気象補正
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* ── 生育管理タブ ── */}
          {tab === 'growth' && (
            <>
              {/* 季節フェーズ */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  季節フェーズ（表示内容の切替）
                </h3>
                <div className="space-y-2">
                  {PHASES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => onPhaseChange(p.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        phase === p.value
                          ? 'bg-green-50 border-green-400 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div>
                        <span className={`font-bold text-sm ${phase === p.value ? 'text-green-700' : 'text-gray-700'}`}>
                          {p.label}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">{p.period}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                      </div>
                      {phase === p.value && (
                        <span className="text-green-600 font-bold text-lg ml-2">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 果実の生育ステージ */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  果実の生育ステージ（計算精度の設定）
                </h3>
                <div className="space-y-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => onStageChange(s.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        fruitStage === s.value
                          ? 'bg-green-50 border-green-400 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div>
                        <span className={`font-bold text-sm ${fruitStage === s.value ? 'text-green-700' : 'text-gray-700'}`}>
                          {s.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                      </div>
                      {fruitStage === s.value && (
                        <span className="text-green-600 font-bold text-lg ml-2">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 開花日 */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  開花日（積算温度・出荷予測に使用）
                </h3>
                <input
                  type="date"
                  value={floweringDate}
                  onChange={(e) => onFloweringDateChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  入力すると積算温度グラフと出荷予測日が自動計算されます
                </p>
              </div>
            </>
          )}

          {/* ── 気象補正タブ ── */}
          {tab === 'correction' && (
            <>
              <div>
                <h3 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">📐 標高補正</h3>
                <NumInput label="標高気温減率" value={draft.elevationLapseRate} onChange={(v) => update('elevationLapseRate', v)} unit="℃/100m" hint="標高100m上昇ごとの気温変化（推奨: -0.5〜-0.65）" />
                <NumInput label="基準標高（AMeDAS）" value={draft.referenceElevation} onChange={(v) => update('referenceElevation', v)} unit="m" hint="庄原市AMeDAS観測点の標高" />
                <NumInput label="山地降水補正係数" value={draft.mountainPrecipCoeff} onChange={(v) => update('mountainPrecipCoeff', v)} unit="倍率" hint="標高200m以上での降水増加率" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">🧭 斜面方向 気温補正</h3>
                <NumInput label="南向き" value={draft.aspectTemp.south} onChange={(v) => update('aspectTemp.south', v)} unit="℃" hint="夏季は+1.0推奨" />
                <NumInput label="南西向き" value={draft.aspectTemp.southwest} onChange={(v) => update('aspectTemp.southwest', v)} unit="℃" />
                <NumInput label="東向き" value={draft.aspectTemp.east} onChange={(v) => update('aspectTemp.east', v)} unit="℃" />
                <NumInput label="北向き" value={draft.aspectTemp.north} onChange={(v) => update('aspectTemp.north', v)} unit="℃" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">🌧️ 斜面方向 降水補正</h3>
                <NumInput label="南西向き 降水補正" value={draft.aspectPrecip.southwest} onChange={(v) => update('aspectPrecip.southwest', v)} unit="倍率" hint="風向きによる降水増加（推奨: 1.02〜1.08）" />
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-xs text-green-700">
                <p className="font-bold mb-1">📚 パラメータ出典</p>
                <p>初期値は農研機構レポート・気象庁標準値をもとに設定。実測データ蓄積後にPhase 2で自動最適化予定。</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-4 flex gap-3">
          {tab === 'correction' ? (
            <>
              <button onClick={handleReset} className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50">
                初期値に戻す
              </button>
              <button onClick={handleSave} className="flex-1 bg-green-600 text-white rounded-xl py-2 text-sm font-bold hover:bg-green-700">
                保存して反映
              </button>
            </>
          ) : (
            <button onClick={onClose} className="flex-1 bg-green-600 text-white rounded-xl py-2 text-sm font-bold hover:bg-green-700">
              設定を閉じる
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
