import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { CorrectedWeather, DailyWeather, FruitStage } from '../types';
import { calcET0, calcETc, calcIrrigationNeed, GRAPE_KC } from '../utils/et0Calculator';

interface DayBalance {
  label: string;
  date: string;
  et0: number;
  etc: number;
  precipitation: number;
  irrigationNeed: number;
  balance: number;       // ETc - precipitation (正=不足, 負=過剰)
  cumBalance: number;    // 累積水分収支
  isForecast: boolean;
}

function buildBalanceData(
  lat: number,
  past14: DailyWeather[],
  forecast: CorrectedWeather[],
  fruitStage: FruitStage,
  roofType: string
): DayBalance[] {
  const rows: DayBalance[] = [];
  let cumBalance = 0;

  // 過去7日
  const past7 = past14.slice(-7);
  for (const d of past7) {
    const et0 = calcET0(lat, d.date, d.tempMax, d.tempMin);
    const etc = calcETc(et0, fruitStage, roofType);
    const balance = etc - d.precipitation;
    cumBalance += balance;
    const dt = new Date(d.date);
    rows.push({
      label: `${dt.getMonth() + 1}/${dt.getDate()}`,
      date: d.date,
      et0, etc,
      precipitation: d.precipitation,
      irrigationNeed: calcIrrigationNeed(etc, d.precipitation),
      balance: Math.round(balance * 10) / 10,
      cumBalance: Math.round(cumBalance * 10) / 10,
      isForecast: false,
    });
  }

  // 今後7日
  for (const d of forecast.slice(0, 7)) {
    const et0 = calcET0(lat, d.date, d.correctedTempMax, d.correctedTempMin);
    const etc = calcETc(et0, fruitStage, roofType);
    const precip = d.correctedPrecipitation;
    const balance = etc - precip;
    cumBalance += balance;
    const dt = new Date(d.date);
    rows.push({
      label: `${dt.getMonth() + 1}/${dt.getDate()}`,
      date: d.date,
      et0, etc,
      precipitation: precip,
      irrigationNeed: calcIrrigationNeed(etc, precip),
      balance: Math.round(balance * 10) / 10,
      cumBalance: Math.round(cumBalance * 10) / 10,
      isForecast: true,
    });
  }

  return rows;
}

function irrigationAdvice(
  todayEtc: number,
  todayPrecip: number,
  tomorrowEtc: number,
  tomorrowPrecip: number,
  cumBalance7: number
): { level: 'ok' | 'warning' | 'danger'; message: string; detail: string } {
  const todayNeed = calcIrrigationNeed(todayEtc, todayPrecip);
  const tomorrowNeed = calcIrrigationNeed(tomorrowEtc, tomorrowPrecip);

  if (cumBalance7 > 10) {
    return {
      level: 'ok',
      message: '散水を控えめに',
      detail: `7日間累積で水分過剰（+${cumBalance7.toFixed(1)}mm）。今日は散水を${Math.round(todayNeed > 0 ? 50 : 80)}%に減らしてください。`,
    };
  }
  if (cumBalance7 < -8) {
    return {
      level: 'danger',
      message: '散水量を増やしてください',
      detail: `7日間累積で水分不足（${cumBalance7.toFixed(1)}mm）。果実が乾燥ストレスを受けています。今日の推奨散水: ${todayNeed.toFixed(1)}mm。明日の予測: ${tomorrowNeed.toFixed(1)}mm。`,
    };
  }
  if (todayPrecip > todayEtc) {
    return {
      level: 'ok',
      message: '本日の散水不要',
      detail: `降水量（${todayPrecip.toFixed(1)}mm）が蒸散量（${todayEtc.toFixed(1)}mm）を上回っています。ただし明日晴れる場合は散水を再開（推奨: ${tomorrowNeed.toFixed(1)}mm）。`,
    };
  }
  return {
    level: 'warning',
    message: `本日推奨散水量: ${todayNeed.toFixed(1)}mm`,
    detail: `蒸散量 ${todayEtc.toFixed(1)}mm − 降水量 ${todayPrecip.toFixed(1)}mm = 不足分 ${todayNeed.toFixed(1)}mm。明日の推奨: ${tomorrowNeed.toFixed(1)}mm。`,
  };
}

interface Props {
  lat: number;
  past14: DailyWeather[];
  forecast: CorrectedWeather[];
  fruitStage: FruitStage;
  roofType: string;
  fieldName: string;
}

export function IrrigationAdviceCard({ lat, past14, forecast, fruitStage, roofType, fieldName }: Props) {
  if (past14.length === 0 || forecast.length === 0) return null;

  const data = buildBalanceData(lat, past14, forecast, fruitStage, roofType);
  const today = data.find((d) => !d.isForecast && data.indexOf(d) === data.filter((x) => !x.isForecast).length - 1);
  const tomorrow = data.find((d) => d.isForecast);
  const cum7 = data.slice(-7).reduce((s, d) => s + d.balance, 0);

  const advice = today && tomorrow
    ? irrigationAdvice(today.etc, today.precipitation, tomorrow.etc, tomorrow.precipitation, Math.round(cum7 * 10) / 10)
    : null;

  const kc = GRAPE_KC[fruitStage] ?? 0.7;

  const levelStyle = {
    ok:      'bg-green-50 border-green-300 text-green-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    danger:  'bg-red-50 border-red-300 text-red-800',
  };
  const levelIcon = { ok: '💧', warning: '⚠️', danger: '🚨' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-700">💧 散水管理アドバイス（{fieldName}）</h3>
        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
          ET0ベース / Kc={kc}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        蒸散量（ET0 × Kc）と降水量の差から散水必要量を算出。過去7日＋今後7日の水分収支を表示。
      </p>

      {/* アドバイスボックス */}
      {advice && (
        <div className={`rounded-xl border p-3 mb-4 ${levelStyle[advice.level]}`}>
          <p className="font-bold text-sm mb-1">{levelIcon[advice.level]} {advice.message}</p>
          <p className="text-xs leading-relaxed">{advice.detail}</p>
        </div>
      )}

      {/* 水分収支グラフ */}
      <p className="text-xs text-gray-500 font-medium mb-2">水分収支（降水量 − 作物蒸散量ETc）過去7日＋今後7日</p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis
            tick={{ fontSize: 10 }}
            unit="mm"
            width={44}
            label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}mm`,
              name === 'precipitation' ? '降水量' :
              name === 'etc' ? '作物蒸散量(ETc)' :
              name === 'cumBalance' ? '累積収支' : String(name),
            ]}
            labelFormatter={(l) => `${l}`}
          />
          <Legend
            formatter={(v) =>
              v === 'precipitation' ? '降水量' :
              v === 'etc' ? '作物蒸散量(ETc)' :
              v === 'cumBalance' ? '累積水分収支' : v
            }
            wrapperStyle={{ fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
          {/* 今日の境界線 */}
          <ReferenceLine x={data.find((d) => d.isForecast)?.label} stroke="#9ca3af" strokeDasharray="4 2" label={{ value: '今日', fontSize: 9, fill: '#6b7280' }} />
          <Bar dataKey="precipitation" fill="#60a5fa" opacity={0.7} radius={[2, 2, 0, 0]} />
          <Bar dataKey="etc" fill="#f97316" opacity={0.6} radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="cumBalance" stroke="#7c3aed" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 今後7日の数値テーブル */}
      <div className="mt-4 overflow-x-auto">
        <p className="text-xs text-gray-500 font-medium mb-1.5">今後7日間の散水推奨量</p>
        <table className="w-full text-xs border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-1.5 px-2 text-left font-medium text-gray-600 border-b border-gray-200">日付</th>
              <th className="py-1.5 px-2 text-center font-medium text-orange-600 border-b border-gray-200">ETc(mm)</th>
              <th className="py-1.5 px-2 text-center font-medium text-blue-600 border-b border-gray-200">降水(mm)</th>
              <th className="py-1.5 px-2 text-center font-medium text-purple-700 border-b border-gray-200">推奨散水(mm)</th>
            </tr>
          </thead>
          <tbody>
            {data.filter((d) => d.isForecast).map((d) => (
              <tr key={d.date} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-1.5 px-2 text-gray-700">{d.label}</td>
                <td className="py-1.5 px-2 text-center text-orange-600 font-medium">{d.etc.toFixed(1)}</td>
                <td className="py-1.5 px-2 text-center text-blue-600">{d.precipitation.toFixed(1)}</td>
                <td className={`py-1.5 px-2 text-center font-bold ${d.irrigationNeed > 0 ? 'text-purple-700' : 'text-green-600'}`}>
                  {d.irrigationNeed > 0 ? d.irrigationNeed.toFixed(1) : '不要'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ※ ET0: Hargreaves-Samani法（FAO-56）。ETc = ET0 × Kc（{fruitStage}: {kc}）× 栽培形態係数。
        降水量は気象API補正値。散水量は目安であり、実際の土壌水分計との併用を推奨します。
      </p>
    </div>
  );
}
