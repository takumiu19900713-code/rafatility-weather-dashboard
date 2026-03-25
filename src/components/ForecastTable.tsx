import React from 'react';
import type { CorrectedWeather } from '../types';
import { weatherCodeToIcon } from '../utils/weatherCodeToIcon';

interface Props {
  forecast: CorrectedWeather[];
}

export const ForecastTable: React.FC<Props> = ({ forecast }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700">📅 7日間天気予報</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {forecast.map((d, i) => {
          const date = new Date(d.date);
          const dayNum   = date.getDate();
          const weekday  = date.toLocaleDateString('ja-JP', { weekday: 'short' });
          const monthNum = date.getMonth() + 1;
          const isToday  = i === 0;
          const isSun = date.getDay() === 0;
          const isSat = date.getDay() === 6;

          return (
            <div
              key={d.date}
              className={`flex items-center gap-2 px-4 py-2.5 ${isToday ? 'bg-green-50' : ''}`}
            >
              {/* 日付 */}
              <div className="w-14 shrink-0">
                {isToday ? (
                  <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">今日</span>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 leading-tight">{monthNum}/{dayNum}</p>
                    <p className={`text-[10px] font-medium leading-tight ${isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-400'}`}>
                      ({weekday})
                    </p>
                  </div>
                )}
              </div>

              {/* 天気アイコン */}
              <div className="w-8 text-center shrink-0">
                <span className="text-xl">{weatherCodeToIcon(d.weatherCode)}</span>
              </div>

              {/* 気温（補正後） */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-sm font-bold text-red-500">{d.correctedTempMax}°</span>
                  <span className="text-xs text-gray-300">/</span>
                  <span className="text-sm font-bold text-blue-500">{d.correctedTempMin}°</span>
                  <span className="text-[10px] text-gray-300">℃</span>
                </div>
                {/* 補正前（小さく表示） */}
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-gray-300 line-through">{d.tempMax}°/{d.tempMin}°</span>
                  <span className="text-[9px] text-gray-300">基準値</span>
                </div>
              </div>

              {/* 降水 */}
              <div className="w-12 text-right shrink-0">
                <p className="text-xs font-bold text-blue-600">{d.correctedPrecipitation}mm</p>
                <p className="text-[10px] text-blue-400">{d.precipProbability}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
