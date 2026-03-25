import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useMonthlyDetail } from '../hooks/useMonthlyDetail';

type DayView = 'temp' | 'precip' | 'sunshine';

const CURRENT_YEAR  = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const MIN_YEAR = 2015;

const MONTH_LABELS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

interface Props {
  lat: number;
  lon: number;
  fieldName: string;
}

export function MonthlyDetailCard({ lat, lon, fieldName }: Props) {
  const [year,  setYear]  = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareYear, setCompareYear] = useState(CURRENT_YEAR - 1);
  const [view, setView] = useState<DayView>('temp');

  const yearOptions = Array.from(
    { length: CURRENT_YEAR - MIN_YEAR + 1 },
    (_, i) => CURRENT_YEAR - i
  );

  const entries = useMemo(() => {
    const base = [{ year, month }];
    if (compareEnabled) base.push({ year: compareYear, month });
    return base;
  }, [year, month, compareEnabled, compareYear]);

  const { data, loading, error } = useMonthlyDetail(lat, lon, entries);

  const primary   = data[`${year}-${month}`]   ?? [];
  const secondary = data[`${compareYear}-${month}`] ?? [];

  // 日別チャートデータ（最大31日）
  const chartData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const p = primary.find((r) => r.day === day);
    const s = secondary.find((r) => r.day === day);
    return {
      day: `${day}日`,
      [`${year}年最高`]:   p?.tempMax ?? null,
      [`${year}年最低`]:   p?.tempMin ?? null,
      [`${year}年降水量`]: p?.precipitation ?? null,
      [`${year}年日照`]:   p?.sunshineDuration ?? null,
      ...(compareEnabled ? {
        [`${compareYear}年最高`]:   s?.tempMax ?? null,
        [`${compareYear}年最低`]:   s?.tempMin ?? null,
        [`${compareYear}年降水量`]: s?.precipitation ?? null,
        [`${compareYear}年日照`]:   s?.sunshineDuration ?? null,
      } : {}),
    };
  }).filter((_, i) => i < primary.length || (compareEnabled && i < secondary.length));

  // 月間サマリー
  const summarize = (records: typeof primary) => ({
    avgTempMax:    records.length ? Math.round(records.reduce((s, r) => s + r.tempMax, 0) / records.length * 10) / 10 : null,
    avgTempMin:    records.length ? Math.round(records.reduce((s, r) => s + r.tempMin, 0) / records.length * 10) / 10 : null,
    totalPrecip:   Math.round(records.reduce((s, r) => s + r.precipitation, 0) * 10) / 10,
    totalSunshine: Math.round(records.reduce((s, r) => s + r.sunshineDuration, 0) * 10) / 10,
    totalGdd:      Math.round(records.reduce((s, r) => s + r.gdd, 0)),
    rainDays:      records.filter((r) => r.precipitation >= 1).length,
    maxPrecip:     Math.round(Math.max(...records.map((r) => r.precipitation), 0) * 10) / 10,
  });

  const primarySummary   = summarize(primary);
  const secondarySummary = compareEnabled ? summarize(secondary) : null;

  const tabs: { id: DayView; icon: string; label: string }[] = [
    { id: 'temp',     icon: '🌡️', label: '気温' },
    { id: 'precip',   icon: '🌧️', label: '降水量' },
    { id: 'sunshine', icon: '☀️', label: '日照' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
      <h3 className="font-bold text-gray-700 mb-3">📅 月別日次データ（{fieldName}）</h3>

      {/* セレクター */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-3">
        {/* 対象年月 */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1.5">表示する年月</p>
          <div className="flex gap-2">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-300">
              {yearOptions.map((y) => <option key={y} value={y}>{y}年</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-300">
              {MONTH_LABELS.map((lbl, i) => (
                <option key={i + 1} value={i + 1}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 比較年 */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={compareEnabled}
              onChange={(e) => setCompareEnabled(e.target.checked)}
              className="w-4 h-4 accent-green-600" />
            <span className="text-xs text-gray-600 font-medium">前年と比較する</span>
          </label>
          {compareEnabled && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">比較年：</span>
              <select value={compareYear} onChange={(e) => setCompareYear(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-300">
                {yearOptions.filter((y) => y !== year).map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <span className="text-xs text-gray-400">{MONTH_LABELS[month - 1]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ローディング */}
      {loading && (
        <div className="py-8 text-center text-gray-400 animate-pulse">
          <p className="text-2xl mb-2">📡</p>
          <p className="text-sm">{year}年{MONTH_LABELS[month - 1]}のデータを取得中…</p>
        </div>
      )}

      {/* エラー */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* データ表示 */}
      {!loading && primary.length > 0 && (
        <>
          {/* 月間サマリー */}
          <div className={`grid gap-2 mb-4 ${compareEnabled && secondarySummary ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {compareEnabled && secondarySummary ? (
              /* 比較モード: 2列でそれぞれの年を表示 */
              <>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  {[
                    { label: '平均最高気温', p: primarySummary.avgTempMax, s: secondarySummary.avgTempMax, unit: '℃', color: 'text-red-600' },
                    { label: '平均最低気温', p: primarySummary.avgTempMin, s: secondarySummary.avgTempMin, unit: '℃', color: 'text-blue-600' },
                    { label: '月間降水量',   p: primarySummary.totalPrecip, s: secondarySummary.totalPrecip, unit: 'mm', color: 'text-blue-500' },
                    { label: '月間日照時間', p: primarySummary.totalSunshine, s: secondarySummary.totalSunshine, unit: 'h', color: 'text-yellow-600' },
                    { label: '有効積算温度', p: primarySummary.totalGdd, s: secondarySummary.totalGdd, unit: '℃日', color: 'text-green-600' },
                    { label: '降水日数',     p: primarySummary.rainDays, s: secondarySummary.rainDays, unit: '日', color: 'text-gray-600' },
                  ].map((item) => {
                    const diff = item.p !== null && item.s !== null ? item.p - item.s : null;
                    return (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-2.5 text-xs">
                        <p className="text-gray-400 mb-1">{item.label}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-gray-400">{year}年</p>
                            <p className={`font-bold text-sm ${item.color}`}>{item.p ?? '—'}{item.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400">{compareYear}年</p>
                            <p className="font-medium text-gray-500">{item.s ?? '—'}{item.unit}</p>
                          </div>
                        </div>
                        {diff !== null && (
                          <p className={`text-[10px] font-bold mt-1 ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                            差: {diff > 0 ? '+' : ''}{diff.toFixed(1)}{item.unit}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* 単年モード */
              [
                { label: '平均最高', value: primarySummary.avgTempMax, unit: '℃', color: 'text-red-600' },
                { label: '月間降水', value: primarySummary.totalPrecip, unit: 'mm', color: 'text-blue-600' },
                { label: '月間日照', value: primarySummary.totalSunshine, unit: 'h', color: 'text-yellow-600' },
                { label: '積算温度', value: primarySummary.totalGdd, unit: '℃日', color: 'text-green-600' },
                { label: '降水日数', value: primarySummary.rainDays, unit: '日', color: 'text-gray-600' },
                { label: '最大日雨量', value: primarySummary.maxPrecip, unit: 'mm', color: 'text-indigo-600' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                  <p className={`font-bold text-sm ${item.color}`}>{item.value ?? '—'}<span className="text-[10px] font-normal ml-0.5">{item.unit}</span></p>
                </div>
              ))
            )}
          </div>

          {/* ビュータブ */}
          <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                  view === t.id ? 'bg-white shadow text-green-700' : 'text-gray-500'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* 日別グラフ */}
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 8 }} interval={4} />
              {view === 'temp' && (
                <>
                  <YAxis tick={{ fontSize: 9 }} unit="℃" width={40} />
                  <Tooltip formatter={(v, n) => [`${v}℃`, String(n)]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey={`${year}年最高`} stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey={`${year}年最低`} stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                  {compareEnabled && <>
                    <Line type="monotone" dataKey={`${compareYear}年最高`} stroke="#fca5a5" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
                    <Line type="monotone" dataKey={`${compareYear}年最低`} stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
                  </>}
                </>
              )}
              {view === 'precip' && (
                <>
                  <YAxis tick={{ fontSize: 9 }} unit="mm" width={40} />
                  <Tooltip formatter={(v, n) => [`${v}mm`, String(n)]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey={`${year}年降水量`} fill="#3b82f6" fillOpacity={0.75} radius={[2,2,0,0]} barSize={compareEnabled ? 6 : 10} />
                  {compareEnabled && <Bar dataKey={`${compareYear}年降水量`} fill="#93c5fd" fillOpacity={0.65} radius={[2,2,0,0]} barSize={6} />}
                </>
              )}
              {view === 'sunshine' && (
                <>
                  <YAxis tick={{ fontSize: 9 }} unit="h" width={36} domain={[0, 14]} />
                  <Tooltip formatter={(v, n) => [`${v}h`, String(n)]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey={`${year}年日照`} fill="#f59e0b" fillOpacity={0.75} radius={[2,2,0,0]} barSize={compareEnabled ? 6 : 10} />
                  {compareEnabled && <Bar dataKey={`${compareYear}年日照`} fill="#fcd34d" fillOpacity={0.65} radius={[2,2,0,0]} barSize={6} />}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* 日別テーブル（折りたたみ） */}
          <details className="mt-3">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none py-1">
              日別詳細データ ▼
            </summary>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-[11px] border-collapse min-w-[320px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-1.5 px-2 text-left text-gray-500">日</th>
                    <th className="py-1.5 px-2 text-right text-red-500">最高℃</th>
                    <th className="py-1.5 px-2 text-right text-blue-500">最低℃</th>
                    <th className="py-1.5 px-2 text-right text-blue-600">降水mm</th>
                    <th className="py-1.5 px-2 text-right text-yellow-600">日照h</th>
                    <th className="py-1.5 px-2 text-right text-green-600">GDD</th>
                  </tr>
                </thead>
                <tbody>
                  {primary.map((r) => (
                    <tr key={r.date} className={`border-b border-gray-50 ${r.precipitation >= 10 ? 'bg-blue-50' : ''}`}>
                      <td className="py-1 px-2 text-gray-500 font-medium">{r.day}日</td>
                      <td className="py-1 px-2 text-right text-red-600">{r.tempMax}</td>
                      <td className="py-1 px-2 text-right text-blue-600">{r.tempMin}</td>
                      <td className="py-1 px-2 text-right text-gray-700">{r.precipitation > 0 ? r.precipitation : '—'}</td>
                      <td className="py-1 px-2 text-right text-yellow-700">{r.sunshineDuration}</td>
                      <td className="py-1 px-2 text-right text-green-700">{r.gdd}</td>
                    </tr>
                  ))}
                  {/* 合計行 */}
                  <tr className="bg-gray-50 font-bold border-t border-gray-200">
                    <td className="py-1.5 px-2 text-gray-500">合計/平均</td>
                    <td className="py-1.5 px-2 text-right text-red-600">{primarySummary.avgTempMax}℃</td>
                    <td className="py-1.5 px-2 text-right text-blue-600">{primarySummary.avgTempMin}℃</td>
                    <td className="py-1.5 px-2 text-right text-gray-700">{primarySummary.totalPrecip}mm</td>
                    <td className="py-1.5 px-2 text-right text-yellow-700">{primarySummary.totalSunshine}h</td>
                    <td className="py-1.5 px-2 text-right text-green-700">{primarySummary.totalGdd}℃日</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}

      <p className="text-xs text-gray-300 mt-3">
        ※ Open-Meteo アーカイブAPIより取得（{MIN_YEAR}年〜現在）。圃場補正未適用。
      </p>
    </div>
  );
}
