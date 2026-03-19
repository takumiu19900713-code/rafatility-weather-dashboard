import type { CorrectedWeather, DailyWeather, UserRole } from '../types';

// 品種別標準日数（開花〜収穫）
const STANDARD_DAYS: Record<string, number> = {
  'シャインマスカット': 110,
  'ピオーネ':          70,
  '巨峰':              65,
  'デラウェア':        55,
  'ナガノパープル':    105,
};
const DEFAULT_DAYS = 100;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calcElapsedDays(floweringDate: string): number {
  const diff = Date.now() - new Date(floweringDate).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function calcAccumulatedTemp(
  floweringDate: string,
  past14: DailyWeather[],
  forecast: CorrectedWeather[]
): number {
  const flowerDate = new Date(floweringDate);
  let acc = 0;
  const allDays: { date: string; tempMax: number; tempMin: number }[] = [
    ...past14,
    ...forecast,
  ];
  for (const day of allDays) {
    if (new Date(day.date) >= flowerDate) {
      const avg = (day.tempMax + day.tempMin) / 2;
      acc += Math.max(0, avg - 10);
    }
  }
  return Math.round(acc);
}

function exportCSV(data: object, filename: string) {
  const rows = Object.entries(data).map(([k, v]) => `"${k}","${String(v)}"`);
  const csv = '\uFEFF' + rows.join('\n'); // BOM付きUTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  fieldName: string;
  crop: string;
  floweringDate: string;
  past14: DailyWeather[];
  forecast: CorrectedWeather[];
  crackRiskScore: number;
  role: UserRole;
}

export function ShipmentForecastCard({
  fieldName, crop, floweringDate, past14, forecast, crackRiskScore, role,
}: Props) {
  if (!floweringDate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-4">
        <h3 className="font-bold text-gray-700 mb-2">🍇 出荷予測</h3>
        <p className="text-sm text-amber-600">
          開花日を入力すると出荷予測日が表示されます。<br />
          （生育フェーズバーの「開花日」欄から入力 ※管理者のみ）
        </p>
      </div>
    );
  }

  const standardDays = STANDARD_DAYS[crop] ?? DEFAULT_DAYS;
  const elapsedDays = calcElapsedDays(floweringDate);
  const remainingDays = Math.max(0, standardDays - elapsedDays);
  const predictedShipDate = addDays(floweringDate, standardDays);
  const accTemp = calcAccumulatedTemp(floweringDate, past14, forecast);
  const precip7days = forecast.slice(0, 7).reduce((s, d) => s + d.correctedPrecipitation, 0);

  const exportData = {
    圃場名: fieldName,
    品種: crop || '未設定',
    開花日: floweringDate,
    '経過日数（日）': elapsedDays,
    '残り日数（標準）': remainingDays,
    '積算温度（℃・日）': accTemp,
    '品種別標準日数（日）': standardDays,
    予測出荷日: predictedShipDate,
    '信頼区間': '±3日',
    '直近7日間降水量（mm）': Math.round(precip7days * 10) / 10,
    '現在の裂果リスクスコア': crackRiskScore,
    出力日時: new Date().toLocaleString('ja-JP'),
  };

  const progressPct = Math.min(100, Math.round((elapsedDays / standardDays) * 100));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4" id="shipment-forecast-print">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-700">🍇 出荷予測（{fieldName}）</h3>
        {role === '管理者' && (
          <div className="flex gap-2">
            <button
              onClick={() => exportCSV(exportData, `出荷予測_${fieldName}.csv`)}
              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition"
            >
              Excel出力
            </button>
            <button
              onClick={() => exportJSON(exportData, `出荷予測_${fieldName}.json`)}
              className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition"
            >
              JSON出力
            </button>
            <button
              onClick={() => window.print()}
              className="text-xs bg-gray-600 text-white px-2.5 py-1 rounded-lg hover:bg-gray-700 transition"
            >
              PDF印刷
            </button>
          </div>
        )}
      </div>

      {/* 進捗バー */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>開花日 {floweringDate}</span>
          <span>予測出荷日 {predictedShipDate} （±3日）</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full bg-green-500 flex items-center justify-end pr-1 transition-all"
            style={{ width: `${progressPct}%` }}
          >
            {progressPct > 20 && (
              <span className="text-white text-xs font-bold">{progressPct}%</span>
            )}
          </div>
        </div>
      </div>

      {/* 数値グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '経過日数', value: `${elapsedDays}日`, sub: `標準${standardDays}日` },
          { label: '残り日数', value: `${remainingDays}日`, sub: crop || '未設定' },
          { label: '積算温度', value: `${accTemp}℃日`, sub: '基準温度10℃' },
          { label: '裂果リスク', value: `${crackRiskScore}点`, sub: '現在スコア' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ※ 積算温度は過去14日＋7日予報から算出（概算値）。標準日数は品種名で自動設定。
      </p>
    </div>
  );
}
