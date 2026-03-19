import React from 'react';
import type { CrackRisk, FruitStage } from '../types';

const STAGE_LABEL: Record<FruitStage, string> = {
  '開花前': '開花前 ×0.5',
  '開花〜着果': '開花〜着果 ×1.0',
  '肥大期': '肥大期 ×1.5',
  '収穫期': '収穫期 ×1.2',
};

interface Props {
  risk: CrackRisk | null;
  fruitStage?: FruitStage;
}

const LEVEL_CONFIG = {
  low: { color: 'bg-green-500', textColor: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: '🟢 低リスク', icon: '✅' },
  medium: { color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '🟡 中リスク', icon: '⚠️' },
  high: { color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: '🔴 高リスク', icon: '🚨' },
};

export const CrackRiskGauge: React.FC<Props> = ({ risk, fruitStage }) => {
  if (!risk) return null;

  const config = LEVEL_CONFIG[risk.level];

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${risk.level === 'high' ? 'border-red-500' : risk.level === 'medium' ? 'border-yellow-400' : 'border-green-500'}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-600">🍇 裂果リスク</h2>
        <div className="flex items-center gap-2">
          {fruitStage && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {STAGE_LABEL[fruitStage]}
            </span>
          )}
          <span className="font-bold text-sm">{config.label}</span>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>0</span>
          <span className="font-bold text-gray-700 text-base">{risk.score}点</span>
          <span>100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${config.color}`}
            style={{ width: `${risk.score}%` }}
          />
        </div>
        {/* Threshold markers */}
        <div className="relative h-2 mt-1">
          <div className="absolute left-[40%] w-px h-2 bg-yellow-400" />
          <div className="absolute left-[70%] w-px h-2 bg-red-400" />
        </div>
      </div>

      {/* Advice */}
      <div className={`${config.bg} ${config.border} border rounded p-3 text-sm ${config.textColor} mb-3`}>
        {config.icon} {risk.advice}
      </div>

      {/* Factors */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-400">7日間総量</p>
          <p className="font-bold text-gray-700">{risk.factors.totalPrecip}mm</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-400">最大日量</p>
          <p className="font-bold text-gray-700">{risk.factors.maxDailyPrecip}mm</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-400">連続降雨</p>
          <p className="font-bold text-gray-700">{risk.factors.consecutiveRainDays}日</p>
        </div>
      </div>
    </div>
  );
};
