import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import type { DailyWeather } from '../types';
import type { HistoricalDay } from '../hooks/useHistoricalWeather';

function shiftDateByYears(dateStr: string, years: number): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

interface Props {
  startDate: string;        // 開始日（通常=開花日）YYYY-MM-DD
  past14: DailyWeather[];
  forecast: DailyWeather[]; // CorrectedWeather でも OK（sunshineは補正なし）
  lastYearData: HistoricalDay[];
  lastYearLoading: boolean;
  fieldName: string;
}

export function AccumulatedSunshineCard({
  startDate, past14, forecast, lastYearData, lastYearLoading, fieldName,
}: Props) {
  if (!startDate) return null;

  const startD = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今年データ（past14 + forecast）を結合してソート
  const allThisYear = [
    ...past14.map((d) => ({ date: d.date, sun: d.sunshineDuration, isForecast: false })),
    ...forecast.map((d) => ({ date: d.date, sun: (d as DailyWeather).sunshineDuration ?? 0, isForecast: true })),
  ].filter((d, i, arr) => arr.findIndex((x) => x.date === d.date) === i)
   .sort((a, b) => a.date.localeCompare(b.date));

  const lastYearStart = shiftDateByYears(startDate, -1);
  const maxDays = 130;

  // 累積チャートデータ
  const chartData: {
    day: number;
    dateLabel: string;
    thisYearActual: number | null;
    thisYearForecast: number | null;
    lastYear: number | null;
  }[] = [];

  let accThisActual = 0;
  let accThisForecast = 0;
  let accLastYear = 0;
  let forecastStarted = false;

  for (let d = 0; d <= maxDays; d++) {
    const thisDate = new Date(startD);
    thisDate.setDate(thisDate.getDate() + d);
    const thisDateStr = thisDate.toISOString().slice(0, 10);

    const lastDate = new Date(lastYearStart);
    lastDate.setDate(lastDate.getDate() + d);
    const lastDateStr = lastDate.toISOString().slice(0, 10);

    const isPast = thisDate <= today;
    const isFuture = thisDate > today;

    const thisEntry = isPast
      ? allThisYear.find((x) => x.date === thisDateStr && !x.isForecast)
      : null;
    if (thisEntry) accThisActual += thisEntry.sun;

    if (!forecastStarted) { accThisForecast = accThisActual; forecastStarted = true; }
    const fcEntry = isFuture ? allThisYear.find((x) => x.date === thisDateStr && x.isForecast) : null;
    if (fcEntry) accThisForecast += fcEntry.sun;

    const lastEntry = lastYearData.find((x) => x.date === lastDateStr);
    if (lastEntry) accLastYear += lastEntry.sunshineDuration;

    if (thisDate >= startD) {
      const label = d % 10 === 0
        ? `${thisDate.getMonth() + 1}/${thisDate.getDate()}`
        : '';
      chartData.push({
        day: d,
        dateLabel: label,
        thisYearActual: isPast && thisEntry ? Math.round(accThisActual * 10) / 10 : null,
        thisYearForecast: isFuture && fcEntry ? Math.round(accThisForecast * 10) / 10 : null,
        lastYear: lastEntry ? Math.round(accLastYear * 10) / 10 : null,
      });
    }
  }

  // 直近14日の日別日照時間バーデータ
  const barData = past14.slice(-14).map((d) => ({
    date: d.date.slice(5),  // MM-DD
    sun: Math.round(d.sunshineDuration * 10) / 10,
  }));

  // 集計
  const totalThisYear = Math.round(accThisActual * 10) / 10;
  const totalLastYear = Math.round(accLastYear * 10) / 10;
  const todaysSunshine = past14.find((d) => d.date === today.toISOString().slice(0, 10))?.sunshineDuration ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-700">☀️ 積算日照時間（{fieldName}）</h3>
        {lastYearLoading && (
          <span className="text-xs text-gray-400">昨年データ読込中…</span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        開始日: {startDate} からの累積日照時間。昨年同期比較。
      </p>

      {/* サマリーボックス */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-100 text-center">
          <p className="text-xs text-yellow-600 font-medium">今日の日照</p>
          <p className="text-xl font-bold text-yellow-800">{Math.round(todaysSunshine * 10) / 10}<span className="text-xs font-normal ml-0.5">h</span></p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-100 text-center">
          <p className="text-xs text-yellow-600 font-medium">今年累積</p>
          <p className="text-xl font-bold text-yellow-800">{totalThisYear}<span className="text-xs font-normal ml-0.5">h</span></p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 text-center">
          <p className="text-xs text-gray-500 font-medium">昨年同期</p>
          <p className="text-xl font-bold text-gray-700">
            {lastYearData.length > 0 ? totalLastYear : '—'}<span className="text-xs font-normal ml-0.5">{lastYearData.length > 0 ? 'h' : ''}</span>
          </p>
          {lastYearData.length > 0 && totalLastYear > 0 && (
            <p className={`text-xs mt-0.5 font-medium ${totalThisYear >= totalLastYear ? 'text-yellow-600' : 'text-blue-600'}`}>
              {totalThisYear >= totalLastYear ? `+${(totalThisYear - totalLastYear).toFixed(1)}h` : `${(totalThisYear - totalLastYear).toFixed(1)}h`}
            </p>
          )}
        </div>
      </div>

      {/* 直近14日の日別日照棒グラフ */}
      <p className="text-xs text-gray-500 font-medium mb-1">過去14日の日別日照時間</p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={barData} margin={{ top: 2, right: 8, left: 0, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={1} />
          <YAxis tick={{ fontSize: 9 }} unit="h" width={30} domain={[0, 12]} />
          <Tooltip formatter={(v) => [`${v}h`, '日照時間']} />
          <Bar dataKey="sun" name="日照時間" fill="#fbbf24" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* 累積折れ線グラフ */}
      <p className="text-xs text-gray-500 font-medium mt-3 mb-1">開始日からの累積日照時間（昨年比較）</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 10 }} unit="h" width={44} />
          <Tooltip
            formatter={(value, name) => [`${value}h`, String(name)]}
            labelFormatter={(label) => label ? String(label) : ''}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="thisYearActual"
            name="今年（実績）"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="thisYearForecast"
            name="今年（予報）"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            connectNulls={false}
          />
          {lastYearData.length > 0 && (
            <Line
              type="monotone"
              dataKey="lastYear"
              name="昨年（実績）"
              stroke="#9ca3af"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-2">
        ※ 日照時間はOpen-Meteo APIの sunshine_duration（日射があった秒数）を時間換算。昨年データはアーカイブAPIより取得。
      </p>
    </div>
  );
}
