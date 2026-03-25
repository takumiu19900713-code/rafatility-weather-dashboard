import { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { YearlyData } from '../hooks/useYearlyData';

type ViewMode = 'temp' | 'precip' | 'sunshine' | 'gdd';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

interface Props {
  dataList: YearlyData[];
  loading: boolean;
  error: string | null;
  fieldName: string;
}

export function YearlyAnalysisCard({ dataList, loading, error, fieldName }: Props) {
  const [view, setViewMode] = useState<ViewMode>('temp');
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="animate-pulse text-gray-400">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-sm">年間データを取得中…</p>
          <p className="text-xs mt-1 text-gray-300">最大で数秒かかる場合があります</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 text-sm text-red-600">
        ⚠️ データ取得エラー: {error}
      </div>
    );
  }

  if (dataList.length === 0) return null;

  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  // 全年を月ごとにマージしたチャートデータ
  const chartData = months.map((label, mi) => {
    const row: Record<string, string | number> = { month: label };
    dataList.forEach((yd) => {
      const m = yd.monthly[mi];
      if (!m) return;
      if (view === 'temp') {
        row[`${yd.year}年 最高`] = m.avgTempMax;
        row[`${yd.year}年 最低`] = m.avgTempMin;
      } else if (view === 'precip') {
        row[`${yd.year}年 降水量`] = m.totalPrecip;
        row[`${yd.year}年 雨日数`] = m.rainDays;
      } else if (view === 'sunshine') {
        row[`${yd.year}年`] = m.totalSunshine;
      } else if (view === 'gdd') {
        row[`${yd.year}年`] = m.totalGdd;
      }
    });
    return row;
  });

  const tabs: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'temp',     label: '気温',     icon: '🌡️' },
    { id: 'precip',   label: '降水量',   icon: '🌧️' },
    { id: 'sunshine', label: '日照時間', icon: '☀️' },
    { id: 'gdd',      label: '積算温度', icon: '📈' },
  ];

  const viewConfig = {
    temp:     { unit: '℃',   yLabel: '気温（℃）',     barKey: null },
    precip:   { unit: 'mm',  yLabel: '降水量（mm）',   barKey: '降水量' },
    sunshine: { unit: 'h',   yLabel: '日照時間（h）',  barKey: '' },
    gdd:      { unit: '℃日', yLabel: '積算温度（℃日）', barKey: '' },
  }[view];

  // 年別サマリーテーブル
  const summaryRows = [
    { label: '平均気温', key: 'avgTemp', unit: '℃' },
    { label: '年間降水量', key: 'totalPrecip', unit: 'mm' },
    { label: '年間日照時間', key: 'totalSunshine', unit: 'h' },
    { label: '有効積算温度', key: 'totalGdd', unit: '℃日' },
    { label: '降水日数', key: 'rainDays', unit: '日' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-700">📊 年間データ分析（{fieldName}）</h3>
        {loading && <span className="text-xs text-gray-400">取得中…</span>}
      </div>

      {/* 年サマリーテーブル */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-3 text-left text-gray-500 font-medium border-b border-gray-100">項目</th>
              {dataList.map((yd) => (
                <th key={yd.year} className="py-2 px-3 text-right text-gray-600 font-bold border-b border-gray-100">
                  {yd.year}年
                </th>
              ))}
              {dataList.length >= 2 && (
                <th className="py-2 px-3 text-right text-gray-500 font-medium border-b border-gray-100">前年差</th>
              )}
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => {
              const vals = dataList.map((yd) => (yd.annual as Record<string, number>)[row.key] ?? 0);
              const diff = vals.length >= 2 ? vals[0] - vals[vals.length - 1] : null;
              return (
                <tr key={row.key} className="border-b border-gray-50">
                  <td className="py-2 px-3 text-gray-500">{row.label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="py-2 px-3 text-right font-medium text-gray-700">
                      {v.toLocaleString()}{row.unit}
                    </td>
                  ))}
                  {diff !== null && (
                    <td className={`py-2 px-3 text-right font-bold ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}{row.unit}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setViewMode(t.id)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
              view === t.id ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
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
          <Tooltip
            formatter={(value, name) => [`${Number(value).toFixed(1)}${viewConfig.unit}`, String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />

          {view === 'temp' && dataList.map((yd, i) => (
            [
              <Line key={`max-${yd.year}`} type="monotone"
                dataKey={`${yd.year}年 最高`} stroke={COLORS[i % COLORS.length]}
                strokeWidth={2} dot={false} />,
              <Line key={`min-${yd.year}`} type="monotone"
                dataKey={`${yd.year}年 最低`} stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5} strokeDasharray="4 2" dot={false} />,
            ]
          ))}

          {view === 'precip' && dataList.map((yd, i) => (
            <Bar key={`precip-${yd.year}`}
              dataKey={`${yd.year}年 降水量`}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.75}
              radius={[2, 2, 0, 0]}
              barSize={dataList.length > 1 ? 10 : 18}
            />
          ))}

          {view === 'sunshine' && dataList.map((yd, i) => (
            <Bar key={`sun-${yd.year}`}
              dataKey={`${yd.year}年`}
              fill={i === 0 ? '#f59e0b' : COLORS[i]}
              fillOpacity={0.75}
              radius={[2, 2, 0, 0]}
              barSize={dataList.length > 1 ? 10 : 18}
            />
          ))}

          {view === 'gdd' && dataList.map((yd, i) => (
            <Bar key={`gdd-${yd.year}`}
              dataKey={`${yd.year}年`}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.75}
              radius={[2, 2, 0, 0]}
              barSize={dataList.length > 1 ? 10 : 18}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* 月別詳細テーブル（選択中のビューに合わせた表示） */}
      <details className="mt-3">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          月別詳細データを表示 ▼
        </summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1.5 px-2 text-left text-gray-500 border-b border-gray-100">月</th>
                {dataList.map((yd) => (
                  view === 'temp' ? (
                    ['最高','最低'].map((lbl) => (
                      <th key={`${yd.year}-${lbl}`} className="py-1.5 px-2 text-right text-gray-600 border-b border-gray-100">
                        {yd.year}/{lbl}
                      </th>
                    ))
                  ) : (
                    <th key={yd.year} className="py-1.5 px-2 text-right text-gray-600 border-b border-gray-100">
                      {yd.year}年
                    </th>
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
                      <td key={yd.year} className="py-1.5 px-2 text-right text-gray-700">{m.totalPrecip}mm<span className="text-gray-300 ml-1">({m.rainDays}日)</span></td>
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

      <p className="text-xs text-gray-300 mt-3">
        ※ Open-Meteo アーカイブAPI（気象観測データ）より取得。圃場補正は未適用。
      </p>
    </div>
  );
}
