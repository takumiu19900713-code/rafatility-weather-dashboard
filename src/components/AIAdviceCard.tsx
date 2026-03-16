import React from 'react';
import type { CrackRisk, Field } from '../types';

interface Props {
  risk: CrackRisk | null;
  field: Field | null;
}

export const AIAdviceCard: React.FC<Props> = ({ risk, field }) => {
  if (!risk || !field) return null;

  const aspectLabel: Record<string, string> = {
    south: '南向き',
    southwest: '南西向き',
    east: '東向き',
    north: '北向き',
    other: 'その他',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <h2 className="text-sm font-bold text-gray-600">AIアドバイス</h2>
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <strong className="text-primary">{field.name}</strong> ({aspectLabel[field.aspect]} / 標高{field.elevation}m) の
          現在の裂果リスクスコアは <strong className="text-lg">{risk.score}点</strong> です。
        </p>
        <div className="bg-gray-50 rounded p-3 text-sm leading-relaxed">
          {risk.level === 'low' && (
            <p>🌿 リスクは低い状態です。現在の管理を継続してください。次の雨の前に袋かけや排水路の確認をしておくと安心です。</p>
          )}
          {risk.level === 'medium' && (
            <p>💧 降雨後は土壌水分が高くなっています。排水路の確認・疎通を行い、灌水を控えめにしてください。袋かけの状態も確認推奨です。</p>
          )}
          {risk.level === 'high' && (
            <p>🚨 高リスク状態です。速やかに排水作業を実施してください。樹体の水分過多による裂果が発生しやすい状態です。着水状況を直ちに確認し、必要に応じて袋かけを強化してください。</p>
          )}
        </div>
        <p className="text-xs text-gray-400">
          ※ AI補正は農学的知見に基づく固定値補正です (Phase 2以降で機械学習AI補正に発展予定)
        </p>
      </div>
    </div>
  );
};
