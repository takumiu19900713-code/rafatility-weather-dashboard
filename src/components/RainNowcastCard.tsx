import React from 'react';
import type { HourlyWeather } from '../types';
import { weatherCodeToIcon } from '../utils/weatherCodeToIcon';

interface Props {
  hourly: HourlyWeather[];
}

interface WorkSuggestion {
  icon: string;
  label: string;
  ok: boolean;
  reason: string;
}

function getWorkSuggestions(maxPrecip: number, maxProb: number): WorkSuggestion[] {
  if (maxPrecip >= 5 || maxProb >= 80) {
    return [
      { icon: '🚫💧', label: '散水停止',   ok: true,  reason: '雨で十分な水分補給' },
      { icon: '🍇',   label: '収穫',       ok: false, reason: '雨で裂果リスク上昇' },
      { icon: '🛍️',   label: '袋かけ',     ok: false, reason: '強雨で作業困難' },
      { icon: '🔍',   label: '排水確認',   ok: true,  reason: '雨後の排水路チェック推奨' },
    ];
  }
  if (maxPrecip >= 1 || maxProb >= 50) {
    return [
      { icon: '🚫💧', label: '散水停止',   ok: true,  reason: '降雨前に停止推奨' },
      { icon: '🍇',   label: '収穫',       ok: true,  reason: '雨前に急いで完了を' },
      { icon: '🛍️',   label: '袋かけ',     ok: true,  reason: '雨前に急いで完了を' },
      { icon: '💧',   label: '散水',       ok: false, reason: '雨が来るので不要' },
    ];
  }
  return [
    { icon: '💧',   label: '散水',       ok: true,  reason: '晴天が続く' },
    { icon: '🍇',   label: '収穫',       ok: true,  reason: '好天で作業OK' },
    { icon: '🛍️',   label: '袋かけ',     ok: true,  reason: '好天で作業OK' },
    { icon: '🔍',   label: '点検',       ok: true,  reason: '好天で全作業可' },
  ];
}

function getPrecipBarHeight(precip: number): number {
  if (precip === 0) return 2;
  return Math.min(4 + precip * 8, 48);
}

function getPrecipColor(precip: number, prob: number): string {
  if (precip >= 5 || prob >= 80) return 'bg-red-400';
  if (precip >= 1 || prob >= 50) return 'bg-yellow-400';
  if (prob >= 20) return 'bg-blue-300';
  return 'bg-blue-100';
}

export const RainNowcastCard: React.FC<Props> = ({ hourly }) => {
  if (hourly.length === 0) return null;

  const next6 = hourly.slice(0, 6);
  const maxPrecip = Math.max(...next6.map(h => h.precipitation));
  const maxProb = Math.max(...next6.map(h => h.precipProbability));
  const suggestions = getWorkSuggestions(maxPrecip, maxProb);

  const alertLevel = maxPrecip >= 5 || maxProb >= 80
    ? { label: '⛈️ 雨に注意', color: 'text-red-600', bg: 'border-red-300' }
    : maxPrecip >= 1 || maxProb >= 50
    ? { label: '🌦️ 小雨の可能性', color: 'text-yellow-600', bg: 'border-yellow-300' }
    : { label: '☀️ 当面雨なし', color: 'text-green-600', bg: 'border-green-300' };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${alertLevel.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-600">🕐 今後の雨予報（時間別）</h2>
          <p className={`text-xs font-bold mt-0.5 ${alertLevel.color}`}>{alertLevel.label}</p>
        </div>
        <span className="text-xs text-gray-400">6〜12時間先</span>
      </div>

      {/* Hourly timeline */}
      <div className="flex items-end gap-1 mb-4 h-14">
        {next6.map((h, i) => {
          const barH = getPrecipBarHeight(h.precipitation);
          const barColor = getPrecipColor(h.precipitation, h.precipProbability);
          const isNow = i === 0;
          return (
            <div key={h.time} className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-xs">{weatherCodeToIcon(h.weatherCode)}</span>
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '28px' }}>
                <div
                  className={`w-full rounded-t ${barColor} transition-all`}
                  style={{ height: `${barH}px`, minHeight: '2px' }}
                />
              </div>
              <span className={`text-xs font-bold ${isNow ? 'text-primary' : 'text-gray-500'}`}>
                {isNow ? '現在' : `${h.hour}時`}
              </span>
              <span className="text-xs text-blue-500">{h.precipProbability}%</span>
              {h.precipitation > 0 && (
                <span className="text-xs text-blue-600 font-bold">{h.precipitation}mm</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 残り6〜12時間 */}
      {hourly.length > 6 && (
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {hourly.slice(6, 12).map((h) => (
            <div key={h.time} className="flex-shrink-0 text-center min-w-[36px]">
              <p className="text-xs">{weatherCodeToIcon(h.weatherCode)}</p>
              <p className="text-xs text-gray-500">{h.hour}時</p>
              <p className="text-xs text-blue-400">{h.precipProbability}%</p>
            </div>
          ))}
        </div>
      )}

      {/* Work suggestions */}
      <div>
        <p className="text-xs font-bold text-gray-500 mb-2">今の作業判断</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                s.ok
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
            >
              <span className="text-base">{s.icon}</span>
              <div>
                <p className="font-bold">{s.ok ? '✅' : '❌'} {s.label}</p>
                <p className="text-xs opacity-75">{s.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
