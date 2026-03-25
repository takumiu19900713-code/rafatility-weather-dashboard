import React from 'react';
import type { CorrectedWeather } from '../types';
import { weatherCodeToIcon } from '../utils/weatherCodeToIcon';

interface Props {
  today: CorrectedWeather | null;
  fieldName: string;
}

export const WeatherSummaryCard: React.FC<Props> = ({ today, fieldName }) => {
  if (!today) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center h-36">
        <p className="text-gray-400 text-sm">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-700">🌡️ 今日の気象（{fieldName}）</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">AI圃場補正済み</p>
        </div>
        <span className="text-4xl">{weatherCodeToIcon(today.weatherCode)}</span>
      </div>

      {/* 気温 2列 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-red-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-red-400 mb-1">最高気温</p>
          <p className="text-xl font-bold text-red-500 leading-none">{today.correctedTempMax}<span className="text-xs ml-0.5">°C</span></p>
          <p className="text-[9px] text-gray-300 mt-1 line-through">基準 {today.tempMax}°C</p>
        </div>
        <div className="bg-blue-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-blue-400 mb-1">最低気温</p>
          <p className="text-xl font-bold text-blue-500 leading-none">{today.correctedTempMin}<span className="text-xs ml-0.5">°C</span></p>
          <p className="text-[9px] text-gray-300 mt-1 line-through">基準 {today.tempMin}°C</p>
        </div>
      </div>

      {/* 降水・湿度・風速 3列 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1">降水量</p>
          <p className="text-sm font-bold text-blue-600 leading-none">{today.correctedPrecipitation}<span className="text-[10px] ml-0.5">mm</span></p>
          <p className="text-[9px] text-gray-300 mt-1 line-through">{today.precipitation}mm</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1">最大湿度</p>
          <p className="text-sm font-bold text-gray-700 leading-none">{today.humidityMax}<span className="text-[10px] ml-0.5">%</span></p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 mb-1">風速</p>
          <p className="text-sm font-bold text-gray-700 leading-none">{today.windspeed}<span className="text-[10px] ml-0.5">m/s</span></p>
        </div>
      </div>

      {/* 補正詳細 */}
      <div className="mt-2.5 text-[10px] text-gray-400 bg-green-50 rounded-xl px-3 py-2 leading-relaxed">
        補正：標高{today.correctionDetails.elevationCorrection > 0 ? '+' : ''}{today.correctionDetails.elevationCorrection}°C ／
        斜面{today.correctionDetails.aspectCorrection > 0 ? '+' : ''}{today.correctionDetails.aspectCorrection}°C ／
        降水×{today.correctionDetails.precipCorrection}
      </div>
    </div>
  );
};
