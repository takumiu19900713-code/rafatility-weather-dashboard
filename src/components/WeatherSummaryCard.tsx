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
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center h-40">
        <p className="text-gray-400 text-sm">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-600">🌡️ 現在の気象 ({fieldName})</h2>
        <span className="text-3xl">{weatherCodeToIcon(today.weatherCode)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-500 mb-1">最高気温</p>
          <div className="flex items-baseline gap-1">
            <p className="text-gray-400 text-sm line-through">{today.tempMax}°C</p>
            <p className="text-red-500 font-bold text-lg">{today.correctedTempMax}°C</p>
          </div>
          <p className="text-xs text-primary">AI補正後</p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-500 mb-1">最低気温</p>
          <div className="flex items-baseline gap-1">
            <p className="text-gray-400 text-sm line-through">{today.tempMin}°C</p>
            <p className="text-blue-500 font-bold text-lg">{today.correctedTempMin}°C</p>
          </div>
          <p className="text-xs text-primary">AI補正後</p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-500 mb-1">降水量</p>
          <div className="flex items-baseline gap-1">
            <p className="text-gray-400 text-sm line-through">{today.precipitation}mm</p>
            <p className="text-blue-600 font-bold text-lg">{today.correctedPrecipitation}mm</p>
          </div>
          <p className="text-xs text-primary">補正後</p>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <p className="text-xs text-gray-500 mb-1">湿度 / 風速</p>
          <p className="font-bold text-gray-700">{today.humidityMax}% / {today.windspeed}m/s</p>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-400 bg-green-50 rounded p-2">
        補正詳細: 標高{today.correctionDetails.elevationCorrection > 0 ? '+' : ''}{today.correctionDetails.elevationCorrection}°C /
        斜面{today.correctionDetails.aspectCorrection > 0 ? '+' : ''}{today.correctionDetails.aspectCorrection}°C /
        降水×{today.correctionDetails.precipCorrection}
      </div>
    </div>
  );
};
