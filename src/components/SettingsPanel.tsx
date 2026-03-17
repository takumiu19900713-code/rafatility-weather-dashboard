import React, { useState } from 'react';
import type { CorrectionParams } from '../hooks/useCorrectionParams';
import { DEFAULT_PARAMS } from '../hooks/useCorrectionParams';

interface Props {
  open: boolean;
  onClose: () => void;
  params: CorrectionParams;
  onSave: (p: CorrectionParams) => void;
  onReset: () => void;
  fieldName?: string;
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

export const SettingsPanel: React.FC<Props> = ({ open, onClose, params, onSave, onReset, fieldName }) => {
  const [draft, setDraft] = useState<CorrectionParams>(params);

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
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">⚙️ AI補正パラメータ設定</h2>
            <p className="text-xs text-gray-400">
              {fieldName ? `📍 ${fieldName} — ` : ''}農研機構標準値をベースに調整可能
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* 標高補正 */}
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">📐 標高補正</h3>
            <NumInput
              label="標高気温減率"
              value={draft.elevationLapseRate}
              onChange={(v) => update('elevationLapseRate', v)}
              unit="℃/100m"
              hint="標高100m上昇ごとの気温変化（推奨: -0.5〜-0.65）"
            />
            <NumInput
              label="基準標高（AMeDAS）"
              value={draft.referenceElevation}
              onChange={(v) => update('referenceElevation', v)}
              unit="m"
              hint="庄原市AMeDAS観測点の標高"
            />
            <NumInput
              label="山地降水補正係数"
              value={draft.mountainPrecipCoeff}
              onChange={(v) => update('mountainPrecipCoeff', v)}
              unit="倍率"
              hint="標高200m以上での降水増加率（推奨: 1.02〜1.15）"
            />
          </div>

          {/* 斜面方向補正 */}
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">🧭 斜面方向 気温補正</h3>
            <NumInput label="南向き" value={draft.aspectTemp.south} onChange={(v) => update('aspectTemp.south', v)} unit="℃" hint="夏季は+1.0推奨" />
            <NumInput label="南西向き" value={draft.aspectTemp.southwest} onChange={(v) => update('aspectTemp.southwest', v)} unit="℃" />
            <NumInput label="東向き" value={draft.aspectTemp.east} onChange={(v) => update('aspectTemp.east', v)} unit="℃" />
            <NumInput label="北向き" value={draft.aspectTemp.north} onChange={(v) => update('aspectTemp.north', v)} unit="℃" />
          </div>

          {/* 降水補正 */}
          <div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">🌧️ 斜面方向 降水補正</h3>
            <NumInput
              label="南西向き 降水補正"
              value={draft.aspectPrecip.southwest}
              onChange={(v) => update('aspectPrecip.southwest', v)}
              unit="倍率"
              hint="風向きによる降水増加（推奨: 1.02〜1.08）"
            />
          </div>

          {/* 出典 */}
          <div className="bg-green-50 rounded-lg p-3 text-xs text-green-700">
            <p className="font-bold mb-1">📚 パラメータ出典</p>
            <p>初期値は農研機構レポート・気象庁標準値をもとに設定しています。実測データ蓄積後にPhase 2で自動最適化予定です。</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50"
          >
            初期値に戻す
          </button>
          <button
            onClick={handleSave}
            className="flex-2 flex-1 bg-primary text-white rounded-xl py-2 text-sm font-bold hover:bg-primary-hover"
          >
            保存して反映
          </button>
        </div>
      </div>
    </div>
  );
};
