import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { useYearlyData } from '../hooks/useYearlyData';

type ViewMode = 'temp' | 'precip' | 'sunshine' | 'gdd';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2015;
const MAX_SELECTABLE_YEARS = 5;

interface Props {
  lat: number;
  lon: number;
  fieldName: string;
}

export function YearlyAnalysisCard({ lat, lon, fieldName }: Props) {
  const [view, setViewMode] = useState<ViewMode>('temp');
  const [fromYear, setFromYear] = useState(CURRENT_YEAR - 2);
  const [toYear, setToYear] = useState(CURRENT_YEAR);

  // fromYear〜toYearの配列（最大5年）
  const years = useMemo(() => {
    const from = Math.min(fromYear, toYear);
    const to   = Math.max(fromYear, toYear);
    const diff = to - from + 1;
    const capped = Math.min(diff, MAX_SELECTABLE_YEARS);
    return Array.from({ length: capped }, (_, i) => to - i).reverse();
  }, [fromYear, toYear]);

  const { data: dataList, loading, error } = useYearlyData(lat, lon, years);

  const yearOptions = Array.from(
    { length: CURRENT_YEAR - MIN_YEAR + 1 },
    (_, i) => CURRENT_YEAR - i
  );

  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  // グラフデータを月別に生成
  const chartData = months.map((label, mi) => {
    const row: Record<string, string | number> = { month: label };
    dataList.forEach((yd) => {
      const m = yd.monthly[mi];
      if (!m) return;
      if (view === 'temp') {
        row[`${yd.year}年最高`] = m.avgTempMax;
        row[`${yd.year}年最低`] = m.avgTempMin;
      } else if (view === 'precip') {
        row[`${yd.year}年`] = m.totalPrecip;
      } else if (view === 'sunshine') {
        row[`${yd.year}年`] = m.totalSunshine;
      } else if (view === 'gdd') {
        row[`${yd.year}年`] = m.totalGdd;
      }
    });
    return row;
  });

  const viewConfig = {
    temp:     { unit: '℃',   label: '気温（℃）' },
    precip:   { unit: 'mm',  label: '月間降水量（mm）' },
    sunshine: { unit: 'h',   label: '月間日照（h）' },
    gdd:      { unit: '℃日', label: '月間積算温度（℃日）' },
  }[view];

  const tabs: { id: ViewMode; icon: string; label: string }[] = [
    { id: 'temp',     icon: '🌡️', label: '気温' },
    { id: 'precip',   icon: '🌧️', label: '降水量' },
    { id: 'sunshine', icon: '☀️', label: '日照' },
    { id: 'gdd',      icon: '📈', label: '積算温度' },
  ];

  const summaryRows = [
    { label: '平均気温',     key: 'avgTemp',       unit: '℃' },
    { label: '年間降水量',   key: 'totalPrecip',   unit: 'mm' },
    { label: '年間日照時間', key: 'totalSunshine', unit: 'h' },
    { label: '有効積算温度', key: 'totalGdd',      unit: '℃日' },
    { label: '降水日数',     key: 'rainDays',      unit: '日' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">

      {/* タイトル + 期間選択 */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-700 mb-3">📊 年間データ分析（{fieldName}）</h3>

        {/* 期間ピッカー */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 font-medium mb-2">表示期間を選択（最大5年）</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 block mb-1">開始年</label>
              <select
                value={fromYear}
                onChange={(e) => setFromYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
            </div>
            <span className="text-gray-400 mt-4">〜</span>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 block mb-1">終了年</label>
              <select
                value={toYear}
                onChange={(e) => setToYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
            </div>
          </div>
          {years.length === MAX_SELECTABLE_YEARS && Math.abs(toYear - fromYear) + 1 > MAX_SELECTABLE_YEARS && (
            <p className="text-[10px] text-orange-500 mt-1.5">
              ※ 最大5年まで表示可能です（直近{MAX_SELECTABLE_YEARS}年を表示中）
            </p>
          )}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {years.map((y) => (
              <span key={y} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {y}年
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ローディング */}
      {loading && (
        <div className="py-8 text-center text-gray-400">
          <div className="animate-pulse">
            <p className="text-2xl mb-2">📡</p>
            <p className="text-sm">アーカイブデータを取得中…</p>
            <p className="text-xs mt-1 text-gray-300">{years.join('・')}年分</p>
          </div>
        </div>
      )}

      {/* エラー */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* データ表示 */}
      {!loading && dataList.length > 0 && (
        <>
          {/* サマリーテーブル */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs border-collapse min-w-[300px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-2 px-2 text-left text-gray-500 font-medium">項目</th>
                  {dataList.map((yd) => (
                    <th key={yd.year} className="py-2 px-2 text-right text-gray-700 font-bold">{yd.year}年</th>
                  ))}
                  {dataList.length >= 2 && (
                    <th className="py-2 px-2 text-right text-gray-400 font-medium">
                      {dataList[dataList.length - 1].year}→{dataList[0].year}差
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => {
                  const vals = dataList.map((yd) => (yd.annual as Record<string, number>)[row.key] ?? 0);
                  const diff = vals.length >= 2 ? vals[0] - vals[vals.length - 1] : null;
                  return (
                    <tr key={row.key} className="border-b border-gray-50">
                      <td className="py-2 px-2 text-gray-500">{row.label}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="py-2 px-2 text-right font-medium text-gray-700">
                          {v.toLocaleString()}{row.unit}
                        </td>
                      ))}
                      {diff !== null && (
                        <td className={`py-2 px-2 text-right font-bold ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}{row.unit}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ビュータブ */}
          <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setViewMode(t.id)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                  view === t.id ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* グラフ */}
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} unit={viewConfig.unit} width={46} />
              <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}${viewConfig.unit}`, String(name)]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />

              {view === 'temp' && dataList.map((yd, i) => ([
                <Line key={`max-${yd.year}`} type="monotone"
                  dataKey={`${yd.year}年最高`} stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2} dot={false} />,
                <Line key={`min-${yd.year}`} type="monotone"
                  dataKey={`${yd.year}年最低`} stroke={COLORS[i % COLORS.length]}
                  strokeWidth={1.5} strokeDasharray="4 2" dot={false} />,
              ]))}

              {(view === 'precip' || view === 'sunshine' || view === 'gdd') && dataList.map((yd, i) => (
                <Bar key={`${view}-${yd.year}`}
                  dataKey={`${yd.year}年`}
                  fill={view === 'sunshine' && i === 0 ? '#f59e0b' : COLORS[i % COLORS.length]}
                  fillOpacity={0.75}
                  radius={[2, 2, 0, 0]}
                  barSize={dataList.length > 3 ? 7 : dataList.length > 1 ? 10 : 18}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>

          {/* 月別詳細（折りたたみ） */}
          <details className="mt-3">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none py-1">
              月別詳細データ ▼
            </summary>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-[11px] border-collapse min-w-[300px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-1.5 px-2 text-left text-gray-500">月</th>
                    {dataList.map((yd) => (
                      view === 'temp' ? (
                        ['最高','最低'].map((lbl) => (
                          <th key={`${yd.year}-${lbl}`} className="py-1.5 px-2 text-right text-gray-500">
                            {yd.year}/{lbl}
                          </th>
                        ))
                      ) : (
                        <th key={yd.year} className="py-1.5 px-2 text-right text-gray-500">{yd.year}年</th>
                      )
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {months.map((label, mi) => (
                    <tr key={label} className="border-b border-gray-50">
                      <td className="py-1.5 px-2 text-gray-500 font-medium">{label}</td>
                      {dataList.map((yd) => {
                        const m = yd.monthly[mi];
                        if (!m) return <td key={yd.year} className="py-1.5 px-2 text-right text-gray-300">—</td>;
                        if (view === 'temp') return (
                          <>
                            <td key={`${yd.year}-max`} className="py-1.5 px-2 text-right text-red-600">{m.avgTempMax}℃</td>
                            <td key={`${yd.year}-min`} className="py-1.5 px-2 text-right text-blue-600">{m.avgTempMin}℃</td>
                          </>
                        );
                        if (view === 'precip') return (
                          <td key={yd.year} className="py-1.5 px-2 text-right text-gray-700">
                            {m.totalPrecip}mm <span className="text-gray-300">({m.rainDays}日)</span>
                          </td>
                        );
                        if (view === 'sunshine') return (
                          <td key={yd.year} className="py-1.5 px-2 text-right text-yellow-700">{m.totalSunshine}h</td>
                        );
                        return (
                          <td key={yd.year} className="py-1.5 px-2 text-right text-green-700">{m.totalGdd}℃日</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}

      <p className="text-xs text-gray-300 mt-3">
        ※ Open-Meteo アーカイブAPI（気象観測データ）より取得。圃場補正未適用。最大5年・{MIN_YEAR}年〜現在まで選択可能。
      </p>
    </div>
  );
}
