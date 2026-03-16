import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { DailyWeather, CorrectedWeather } from '../types';

interface Props {
  past14: DailyWeather[];
  correctedPast14: CorrectedWeather[];
}

export const PrecipitationChart: React.FC<Props> = ({ past14, correctedPast14 }) => {
  const data = past14.map((d, i) => {
    const date = new Date(d.date);
    const label = date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    return {
      date: label,
      基準データ: d.precipitation,
      AI補正: correctedPast14[i]?.correctedPrecipitation ?? d.precipitation,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-bold text-gray-600 mb-4">📊 過去14日間 降水量 (基準 vs AI補正)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit="mm" />
          <Tooltip
            formatter={(value) => [`${value}mm`]}
            contentStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="基準データ" fill="#90caf9" radius={[2, 2, 0, 0]} />
          <Bar dataKey="AI補正" fill="#2e7d32" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
