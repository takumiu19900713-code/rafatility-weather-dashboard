import React from 'react';
import type { HourlyWeather, MinutelyWeather } from '../types';
import { weatherCodeToIcon } from '../utils/weatherCodeToIcon';

interface Props {
  hourly: HourlyWeather[];
  minutely: MinutelyWeather[];
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
  return Math.min(4 + precip * 8, 44);
}

function getPrecipColor(precip: number): string {
  if (precip >= 5) return 'bg-red-400';
  if (precip >= 1) return 'bg-yellow-400';
  if (precip > 0) return 'bg-blue-300';
  return 'bg-blue-100';
}

function getPrecipColorHourly(precip: number, prob: number): string {
  if (precip >= 5 || prob >= 80) return 'bg-red-400';
  if (precip >= 1 || prob >= 50) return 'bg-yellow-400';
  if (prob >= 20) return 'bg-blue-300';
  return 'bg-blue-100';
}

function formatMinuteOffset(offset: number): string {
  if (offset <= 0) return '今';
  if (offset < 60) return `+${offset}分`;
  return `+${Math.round(offset / 60)}h`;
}

export const RainNowcastCard: React.FC<Props> = ({ hourly, minutely }) => {
  if (hourly.length === 0 && minutely.length === 0) return null;

  const next6Hourly = hourly.slice(0, 6);
  const maxPrecipHourly = Math.max(...next6Hourly.map(h => h.precipitation), 0);
  const maxProbHourly   = Math.max(...next6Hourly.map(h => h.precipProbability), 0);
  const maxPrecipNow    = minutely.length > 0 ? Math.max(...minutely.map(m => m.precipitation)) : 0;

  const suggestions = getWorkSuggestions(
    Math.max(maxPrecipNow, maxPrecipHourly),
    maxProbHourly
  );

  const nowAlert = maxPrecipNow >= 5
    ? { label: '⛈️ 強雨接近中',    color: 'text-red-600',    bg: 'border-red-400' }
    : maxPrecipNow >= 1
    ? { label: '🌦️ 雨が来ます',    color: 'text-orange-500', bg: 'border-orange-300' }
    : maxPrecipNow > 0
    ? { label: '🌂 小雨の予報',    color: 'text-yellow-600', bg: 'border-yellow-300' }
    : maxPrecipHourly >= 5 || maxProbHourly >= 80
    ? { label: '⛈️ 雨に注意',      color: 'text-red-600',    bg: 'border-red-300' }
    : maxPrecipHourly >= 1 || maxProbHourly >= 50
    ? { label: '🌦️ 小雨の可能性', color: 'text-yellow-600', bg: 'border-yellow-300' }
    : { label: '☀️ 当面雨なし',    color: 'text-green-600',  bg: 'border-green-300' };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${nowAlert.bg} p-4`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-700">🕐 雨ナウキャスト・時間別予報</h2>
          <p className={`text-xs font-bold mt-0.5 ${nowAlert.color}`}>{nowAlert.label}</p>
        </div>
        <span className="text-[10px] text-gray-400">15分〜12時間先</span>
      </div>

      {/* ── 15分別ナウキャスト ── */}
      {minutely.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 mb-2">⚡ 今後2時間（15分刻み）</p>

          {/* 天気アイコン行 */}
          <div className="flex gap-0.5 mb-1">
            {minutely.map((m) => (
              <div key={m.time} className="flex-1 text-center text-sm leading-none">
                {weatherCodeToIcon(m.weatherCode)}
              </div>
            ))}
          </div>

          {/* バー行（固定高さコンテナ、items-end） */}
          <div className="flex items-end gap-0.5" style={{ height: '44px' }}>
            {minutely.map((m) => (
              <div key={m.time} className="flex-1 flex items-end">
                <div
                  className={`w-full rounded-t ${getPrecipColor(m.precipitation)} transition-all`}
                  style={{ height: `${getPrecipBarHeight(m.precipitation)}px`, minHeight: '2px' }}
                />
              </div>
            ))}
          </div>

          {/* 時刻ラベル行 */}
          <div className="flex gap-0.5 mt-1">
            {minutely.map((m, i) => (
              <div key={m.time} className="flex-1 text-center">
                <span className={`text-[9px] leading-none ${i === 0 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                  {i === 0 ? '今' : formatMinuteOffset(m.minuteOffset)}
                </span>
              </div>
            ))}
          </div>

          {/* mm値行（降水あり列のみ表示） */}
          <div className="flex gap-0.5 mt-0.5">
            {minutely.map((m) => (
              <div key={m.time} className="flex-1 text-center">
                {m.precipitation > 0 ? (
                  <span className="text-[9px] text-blue-500 font-bold leading-none">{m.precipitation}</span>
                ) : (
                  <span className="text-[9px] text-transparent leading-none">0</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 時間別予報（次の6時間） ── */}
      {next6Hourly.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-500 mb-2">🕐 今後6時間（1時間刻み）</p>

          {/* 天気アイコン行 */}
          <div className="flex gap-1 mb-1">
            {next6Hourly.map((h) => (
              <div key={h.time} className="flex-1 text-center text-sm leading-none">
                {weatherCodeToIcon(h.weatherCode)}
              </div>
            ))}
          </div>

          {/* バー行 */}
          <div className="flex items-end gap-1" style={{ height: '44px' }}>
            {next6Hourly.map((h) => (
              <div key={h.time} className="flex-1 flex items-end">
                <div
                  className={`w-full rounded-t ${getPrecipColorHourly(h.precipitation, h.precipProbability)} transition-all`}
                  style={{ height: `${getPrecipBarHeight(h.precipitation)}px`, minHeight: '2px' }}
                />
              </div>
            ))}
          </div>

          {/* 時刻ラベル行 */}
          <div className="flex gap-1 mt-1">
            {next6Hourly.map((h, i) => (
              <div key={h.time} className="flex-1 text-center">
                <span className={`text-[9px] leading-none ${i === 0 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                  {i === 0 ? '現在' : `${h.hour}時`}
                </span>
              </div>
            ))}
          </div>

          {/* 降水確率行 */}
          <div className="flex gap-1 mt-0.5">
            {next6Hourly.map((h) => (
              <div key={h.time} className="flex-1 text-center">
                <span className={`text-[9px] leading-none ${h.precipProbability >= 50 ? 'text-blue-500 font-bold' : 'text-gray-300'}`}>
                  {h.precipProbability}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 残り6〜12時間 ── */}
      {hourly.length > 6 && (
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {hourly.slice(6, 12).map((h) => (
            <div key={h.time} className="shrink-0 text-center min-w-[36px]">
              <p className="text-sm leading-none">{weatherCodeToIcon(h.weatherCode)}</p>
              <p className="text-[9px] text-gray-500 mt-1">{h.hour}時</p>
              <p className="text-[9px] text-blue-400">{h.precipProbability}%</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 作業判断 ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 mb-2">今の作業判断</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 ${
                s.ok
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-tight ${s.ok ? 'text-green-700' : 'text-red-600'}`}>
                  {s.ok ? '✅' : '❌'} {s.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
