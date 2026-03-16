import React from 'react';
import type { CorrectedWeather } from '../types';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';

interface Props {
  forecast: CorrectedWeather[];
}

export const ForecastTable: React.FC<Props> = ({ forecast }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-bold text-gray-600">📅 7日間天気予報</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-3 py-2 text-left text-xs">日付</th>
              <th className="px-3 py-2 text-center text-xs">天気</th>
              <th className="px-3 py-2 text-center text-xs">基準<br/>最高/最低</th>
              <th className="px-3 py-2 text-center text-xs">補正後<br/>最高/最低</th>
              <th className="px-3 py-2 text-center text-xs">降水<br/>補正後</th>
              <th className="px-3 py-2 text-center text-xs hidden sm:table-cell">降水<br/>確率</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((d, i) => {
              const date = new Date(d.date);
              const dayLabel = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
              const isToday = i === 0;
              return (
                <tr key={d.date} className={`border-b hover:bg-gray-50 ${isToday ? 'bg-green-50' : i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-3 py-2 font-medium text-xs">
                    {isToday && <span className="bg-primary text-white text-xs rounded px-1 mr-1">今日</span>}
                    {dayLabel}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span title={weatherCodeToLabel(d.weatherCode)}>{weatherCodeToIcon(d.weatherCode)}</span>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500">
                    <span className="text-red-400">{d.tempMax}°</span> / <span className="text-blue-400">{d.tempMin}°</span>
                  </td>
                  <td className="px-3 py-2 text-center text-xs font-medium">
                    <span className="text-red-600">{d.correctedTempMax}°</span> / <span className="text-blue-600">{d.correctedTempMin}°</span>
                  </td>
                  <td className="px-3 py-2 text-center text-xs">
                    <span className="text-gray-400 line-through mr-1">{d.precipitation}</span>
                    <span className="text-blue-600 font-medium">{d.correctedPrecipitation}mm</span>
                  </td>
                  <td className="px-3 py-2 text-center text-xs hidden sm:table-cell">
                    <span className={d.precipProbability >= 70 ? 'text-blue-600 font-bold' : 'text-gray-600'}>
                      {d.precipProbability}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
