import React from 'react';
import type { CorrectedWeather } from '../types';
import type { Field } from '../types';
import type { GrowthPhase, FruitStage } from '../types';

const WEATHER_ICON: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const PHASE_COLOR: Record<GrowthPhase, string> = {
  '冬季':  'bg-blue-100 text-blue-700',
  '春季':  'bg-pink-100 text-pink-700',
  '梅雨期': 'bg-indigo-100 text-indigo-700',
  '収穫期': 'bg-purple-100 text-purple-700',
};

interface Props {
  today: CorrectedWeather | null;
  field: Field | null;
  phase: GrowthPhase;
  fruitStage: FruitStage;
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: Date | null;
}

export const HeroWeatherCard: React.FC<Props> = ({
  today, field, phase, fruitStage, onRefresh, loading, lastUpdated,
}) => {
  const icon = WEATHER_ICON[today?.weatherCode ?? 0] ?? '🌡️';
  const tempMax = today?.correctedTempMax?.toFixed(1) ?? '--';
  const tempMin = today?.correctedTempMin?.toFixed(1) ?? '--';
  const precip = today?.correctedPrecipitation?.toFixed(1) ?? '--';
  const humidity = today?.humidityMax ?? '--';
  const updated = lastUpdated
    ? lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="mx-4 mt-3 mb-1">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* 上部グリーンバー */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs">選択中の圃場</p>
            <p className="text-white font-bold text-base leading-tight">
              {field?.name ?? '圃場を選択してください'}
            </p>
            {field?.crop && (
              <p className="text-green-200 text-xs">{field.crop} · {field.location}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full hover:bg-white/30 transition disabled:opacity-50"
            >
              {loading ? '…' : '🔄'}
            </button>
          </div>
        </div>

        {/* 気象メインエリア */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            {/* 気温 */}
            <div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-gray-800 leading-none">{tempMax}</span>
                <span className="text-xl text-gray-500 mb-1">℃</span>
                <span className="text-3xl leading-none">{icon}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                最高 {tempMax}℃ / 最低 {tempMin}℃
              </p>
            </div>
            {/* フェーズバッジ */}
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PHASE_COLOR[phase]}`}>
                {phase}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                {fruitStage}
              </span>
            </div>
          </div>

          {/* サブ情報 */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-blue-700">{precip}<span className="text-xs font-normal ml-0.5">mm</span></p>
              <p className="text-[10px] text-gray-400 mt-0.5">降水量</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-gray-700">{humidity}<span className="text-xs font-normal ml-0.5">%</span></p>
              <p className="text-[10px] text-gray-400 mt-0.5">湿度</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-gray-500 text-sm">{updated}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">更新時刻</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
