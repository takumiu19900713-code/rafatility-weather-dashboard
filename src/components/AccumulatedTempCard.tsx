import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { CorrectedWeather, DailyWeather } from '../types';
import type { HistoricalDay } from '../hooks/useHistoricalWeather';

// 品種別標準積算温度目標（基準温度10℃、開花起点）
const VARIETY_GDD_TARGET: Record<string, number> = {
  'シャインマスカット': 1100,
  'ピオーネ':           900,
  '巨峰':               850,
  'デラウェア':         700,
  'ナガノパープル':     1050,
};
const DEFAULT_GDD_TARGET = 1000;

function shiftDateByYears(dateStr: string, years: number): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function buildChartData(
  floweringDate: string,
  past14: DailyWeather[],
  forecast: CorrectedWeather[],
  lastYearData: HistoricalDay[]
) {
  if (!floweringDate) return [];

  const flowerDate = new Date(floweringDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今年データ（past14 + forecast）を結合してソート
  const allThisYear: { date: string; tempMax: number; tempMin: number; isForecast: boolean }[] = [
    ...past14.map((d) => ({ ...d, isForecast: false })),
    ...forecast.map((d) => ({ date: d.date, tempMax: d.correctedTempMax, tempMin: d.correctedTempMin, isForecast: true })),
  ].filter((d, i, arr) => arr.findIndex((x) => x.date === d.date) === i)
   .sort((a, b) => a.date.localeCompare(b.date));

  // 昨年の開花日
  const lastYearFlower = shiftDateByYears(floweringDate, -1);

  // チャートデータを生成（開花日からの日数を軸に）
  const maxDays = 130;
  const rows: {
    day: number;
    dateLabel: string;
    thisYearActual: number | null;
    thisYearForecast: number | null;
    lastYear: number | null;
  }[] = [];

  let gddThisActual = 0;
  let gddThisForecast = 0;
  let gddLastYear = 0;

  for (let d = 0; d <= maxDays; d++) {
    const thisDate = new Date(flowerDate);
    thisDate.setDate(thisDate.getDate() + d);
    const thisDateStr = thisDate.toISOString().slice(0, 10);

    const lastDate = new Date(lastYearFlower);
    lastDate.setDate(lastDate.getDate() + d);
    const lastDateStr = lastDate.toISOString().slice(0, 10);

    const isPast = thisDate <= today;
    const isFutureDate = thisDate > today;

    // 今年実績
    const thisEntry = isPast
      ? allThisYear.find((x) => x.date === thisDateStr && !x.isForecast)
      : null;
    if (thisEntry) {
      const avg = (thisEntry.tempMax + thisEntry.tempMin) / 2;
      gddThisActual += Math.max(0, avg - 10);
    }

    // 今年予報
    const forecastEntry = isFutureDate
      ? allThisYear.find((x) => x.date === thisDateStr && x.isForecast)
      : null;
    if (d === 0 || rows.length === 0) {
      gddThisForecast = gddThisActual;
    }
    if (forecastEntry) {
      const avg = (forecastEntry.tempMax + forecastEntry.tempMin) / 2;
      gddThisForecast += Math.max(0, avg - 10);
    }

    // 昨年実績
    const lastEntry = lastYearData.find((x) => x.date === lastDateStr);
    if (lastEntry) {
      gddLastYear += lastEntry.gdd;
    }

    // 開花日以降のみプロット
    if (thisDate >= flowerDate) {
      const monthDay = `${thisDate.getMonth() + 1}/${thisDate.getDate()}`;
      rows.push({
        day: d,
        dateLabel: d % 10 === 0 ? monthDay : '',
        thisYearActual: isPast && thisEntry ? Math.round(gddThisActual) : null,
        thisYearForecast: (isFutureDate && forecastEntry) ? Math.round(gddThisForecast) : null,
        lastYear: lastEntry ? Math.round(gddLastYear) : null,
      });
    }
  }

  return rows;
}

interface Props {
  floweringDate: string;
  crop: string;
  past14: DailyWeather[];
  forecast: CorrectedWeather[];
  lastYearData: HistoricalDay[];
  lastYearLoading: boolean;
  fieldName: string;
}

export function AccumulatedTempCard({
  floweringDate, crop, past14, forecast, lastYearData, lastYearLoading, fieldName,
}: Props) {
  if (!floweringDate) return null;

  const gddTarget = VARIETY_GDD_TARGET[crop] ?? DEFAULT_GDD_TARGET;
  const chartData = buildChartData(floweringDate, past14, forecast, lastYearData);

  // 予測出荷日（今年積算温度が目標に達する日）
  let predictedShipDay = 0;
  let lastYearShipDay = 0;
  for (const row of chartData) {
    const val = row.thisYearActual ?? row.thisYearForecast;
    if (val !== null && val >= gddTarget && predictedShipDay === 0) predictedShipDay = row.day;
    if (row.lastYear !== null && row.lastYear >= gddTarget && lastYearShipDay === 0) lastYearShipDay = row.day;
  }

  function dayToDate(baseDate: string, days: number) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
  }

  const lastYearFlower = shiftDateByYears(floweringDate, -1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-700">🌡️ 積算温度推移（{fieldName}）</h3>
        {lastYearLoading && (
          <span className="text-xs text-gray-400">昨年データ読込中…</span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        基準温度10℃ / 品種: {crop || '未設定'} / 目標積算温度: <strong>{gddTarget}℃・日</strong>
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis tick={{ fontSize: 10 }} unit="℃日" width={52} />
          <Tooltip
            formatter={(value, name) => [`${value}℃日`, String(name)]}
            labelFormatter={(label) => label ? `${label}` : ''}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {/* 目標積算温度ライン */}
          <ReferenceLine
            y={gddTarget}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{ value: `目標${gddTarget}℃日`, position: 'right', fontSize: 10, fill: '#ef4444' }}
          />
          {/* 今年実績 */}
          <Line
            type="monotone"
            dataKey="thisYearActual"
            name="今年（実績）"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {/* 今年予報 */}
          <Line
            type="monotone"
            dataKey="thisYearForecast"
            name="今年（予報）"
            stroke="#2563eb"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            connectNulls={false}
          />
          {/* 昨年実績 */}
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

      {/* サマリー */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">今年の予測出荷日</p>
          <p className="text-lg font-bold text-blue-800 mt-0.5">
            {predictedShipDay > 0 ? dayToDate(floweringDate, predictedShipDay) : '予報データ不足'}
          </p>
          <p className="text-xs text-blue-500">
            開花日 {floweringDate} から {predictedShipDay > 0 ? `${predictedShipDay}日後` : '—'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">昨年の出荷実績</p>
          <p className="text-lg font-bold text-gray-700 mt-0.5">
            {lastYearShipDay > 0 ? dayToDate(lastYearFlower, lastYearShipDay) : lastYearData.length === 0 ? 'データ取得中' : '—'}
          </p>
          <p className="text-xs text-gray-400">
            昨年開花日 {lastYearFlower} から {lastYearShipDay > 0 ? `${lastYearShipDay}日後` : '—'}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        ※ 積算温度 = Σ(日平均気温 − 10℃, 0以上) を開花日から累計。昨年データはOpen-Meteo気象アーカイブより取得。
      </p>
    </div>
  );
}
