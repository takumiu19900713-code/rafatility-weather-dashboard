import React from 'react';
import type { CorrectedWeather, HourlyWeather } from '../types';
import { weatherCodeToIcon } from '../utils/weatherCodeToIcon';

interface Props {
  today: CorrectedWeather | null;
  hourly: HourlyWeather[];
  fieldName: string;
}

export const WeatherSummaryCard: React.FC<Props> = ({ today, hourly, fieldName }) => {
  const now  = hourly[0] ?? null;
  const next = hourly[1] ?? null;

  if (!today && !now) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center h-36">
        <p className="text-gray-400 text-sm">データを読み込み中...</p>
      </div>
    );
  }

  const currentHour = new Date().getHours();

  // 風速変化
  const windNow  = now?.windspeed ?? today?.windspeed ?? 0;
  const windNext = next?.windspeed ?? windNow;
  const windDiff = Math.round((windNext - windNow) * 10) / 10;
  const windTrend =
    windDiff >= 0.5  ? { arrow: '↑', color: 'text-orange-500' } :
    windDiff <= -0.5 ? { arrow: '↓', color: 'text-blue-400' }   :
                       { arrow: '→', color: 'text-gray-400' };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-700">🌡️ 現在の気象（{fieldName}）</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">{currentHour}時台の実況値・AI圃場補正済み</p>
        </div>
        <span className="text-4xl">{weatherCodeToIcon(now?.weatherCode ?? today?.weatherCode ?? 0)}</span>
      </div>

      {/* 現在気温（大きく） + 今日の予報 */}
      {now && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">現在気温</p>
            <p className="text-3xl font-bold text-gray-800 leading-none">
              {now.temperature}<span className="text-base ml-0.5 font-medium text-gray-500">°C</span>
            </p>
          </div>
          {today && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-1">今日の予報</p>
              <p className="text-sm font-bold">
                <span className="text-red-500">{today.correctedTempMax}°</span>
                <span className="text-gray-300 font-normal mx-1">/</span>
                <span className="text-blue-500">{today.correctedTempMin}°</span>
              </p>
              <p className="text-[9px] text-gray-300 line-through">{today.tempMax}° / {today.tempMin}°</p>
            </div>
          )}
        </div>
      )}

      {/* 降水・湿度・風速 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1">降水量</p>
          <p className="text-sm font-bold text-blue-600 leading-none">
            {now?.precipitation ?? today?.correctedPrecipitation ?? 0}
            <span className="text-[10px] ml-0.5">mm</span>
          </p>
          <p className="text-[9px] text-blue-400 mt-0.5">{now?.precipProbability ?? 0}%</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1">湿度</p>
          <p className="text-sm font-bold text-gray-700 leading-none">
            {now?.humidity ?? today?.humidityMax ?? 0}
            <span className="text-[10px] ml-0.5">%</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1">風速</p>
          <p className="text-sm font-bold text-gray-700 leading-none">
            {windNow}
            <span className="text-[10px] ml-0.5">m/s</span>
          </p>
          {/* 風速変化（1時間後） */}
          <p className={`text-[10px] mt-0.5 font-medium ${windTrend.color}`}>
            {windTrend.arrow}
            {windDiff !== 0 && (
              <span className="ml-0.5">
                {windNext}m/s
              </span>
            )}
            <span className="text-gray-300 ml-0.5 font-normal">1h後</span>
          </p>
        </div>
      </div>

      {/* 補正詳細 */}
      {today && (
        <div className="mt-2.5 text-[10px] text-gray-400 bg-green-50 rounded-xl px-3 py-2 leading-relaxed">
          補正：標高{today.correctionDetails.elevationCorrection > 0 ? '+' : ''}{today.correctionDetails.elevationCorrection}°C ／
          斜面{today.correctionDetails.aspectCorrection > 0 ? '+' : ''}{today.correctionDetails.aspectCorrection}°C ／
          降水×{today.correctionDetails.precipCorrection}
        </div>
      )}
    </div>
  );
};
