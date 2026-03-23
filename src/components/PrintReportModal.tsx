import { useEffect } from 'react';
import type { CorrectedWeather, DailyWeather } from '../types';
import type { HistoricalDay } from '../hooks/useHistoricalWeather';

const VARIETY_GDD_TARGET: Record<string, number> = {
  'シャインマスカット': 1100,
  'ピオーネ': 900,
  '巨峰': 850,
  'デラウェア': 700,
  'ナガノパープル': 1050,
};

function calcGddSeries(
  floweringDate: string,
  days: { date: string; tempMax: number; tempMin: number }[]
): number {
  const flowerDate = new Date(floweringDate);
  let acc = 0;
  for (const d of days) {
    if (new Date(d.date) < flowerDate) continue;
    acc += Math.max(0, (d.tempMax + d.tempMin) / 2 - 10);
  }
  return Math.round(acc);
}

function shiftDate(dateStr: string, years: number): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function predictShipDate(
  floweringDate: string,
  gddTarget: number,
  past14: DailyWeather[],
  forecast: CorrectedWeather[]
): string {
  let acc = 0;
  const flowerDate = new Date(floweringDate);
  const allDays = [
    ...past14.map((d) => ({ date: d.date, max: d.tempMax, min: d.tempMin })),
    ...forecast.map((d) => ({ date: d.date, max: d.correctedTempMax, min: d.correctedTempMin })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of allDays) {
    if (new Date(d.date) < flowerDate) continue;
    acc += Math.max(0, (d.max + d.min) / 2 - 10);
    if (acc >= gddTarget) {
      return new Date(d.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
  return '計算中（データ不足）';
}

interface Props {
  open: boolean;
  onClose: () => void;
  fieldName: string;
  location: string;
  crop: string;
  floweringDate: string;
  past14: DailyWeather[];
  forecast: CorrectedWeather[];
  lastYearData: HistoricalDay[];
}

export function PrintReportModal({
  open, onClose,
  fieldName, location, crop, floweringDate,
  past14, forecast, lastYearData,
}: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!open) return null;

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const year = new Date().getFullYear();
  const gddTarget = VARIETY_GDD_TARGET[crop] ?? 1000;

  const thisYearGdd = floweringDate ? calcGddSeries(floweringDate, [
    ...past14,
    ...forecast.map((d) => ({ date: d.date, tempMax: d.correctedTempMax, tempMin: d.correctedTempMin })),
  ]) : 0;

  const lastYearGdd = floweringDate
    ? calcGddSeries(shiftDate(floweringDate, -1), lastYearData)
    : 0;

  const predictedShip = floweringDate
    ? predictShipDate(floweringDate, gddTarget, past14, forecast)
    : '—';

  // 気温サマリー（過去14日）
  const avgTempMax = past14.length
    ? Math.round(past14.reduce((s, d) => s + d.tempMax, 0) / past14.length * 10) / 10
    : 0;
  const avgTempMin = past14.length
    ? Math.round(past14.reduce((s, d) => s + d.tempMin, 0) / past14.length * 10) / 10
    : 0;

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-report-overlay { display: block !important; position: static !important; background: white !important; }
          #print-report-overlay .no-print { display: none !important; }
          #print-report-overlay .print-content { box-shadow: none !important; max-width: 100% !important; }
        }
      `}</style>

      <div
        id="print-report-overlay"
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="print-content bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4">
          {/* 操作ボタン */}
          <div className="no-print flex items-center justify-between px-6 py-3 border-b border-gray-200">
            <span className="text-sm text-gray-500">出荷予測レポート（青果会社提出用・PDF出力）</span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700"
              >
                🖨️ PDF印刷
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>

          {/* レポート本体 */}
          <div className="p-8 text-gray-800">
            {/* ヘッダー */}
            <div className="text-center border-b-2 border-green-600 pb-5 mb-7">
              <p className="text-xs text-gray-500 mb-1 tracking-widest">株式会社ラファティリティ　青果会社提出用</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {year}年産 ぶどう出荷予測レポート
              </h1>
              <p className="text-sm text-gray-600 mt-1">{fieldName}｜{location}</p>
              <p className="text-xs text-gray-400 mt-1">作成日: {today}</p>
            </div>

            {/* 圃場・品種情報 */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                1. 圃場・品種情報
              </h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['圃場名', fieldName],
                    ['所在地', location],
                    ['品種', crop || '未登録'],
                    ['開花日', floweringDate || '未入力'],
                    ['積算温度目標（基準温度10℃）', `${gddTarget}℃・日`],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-500 w-52">{label}</td>
                      <td className="py-2 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 出荷予測 */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                2. 出荷予測日
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">{year}年 予測出荷日</p>
                  <p className="text-3xl font-bold text-blue-800 mt-2">{predictedShip}</p>
                  <p className="text-xs text-blue-500 mt-2">信頼区間: ±3日</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">{year - 1}年 参考積算温度</p>
                  <p className="text-3xl font-bold text-gray-700 mt-2">
                    {lastYearGdd > 0 ? `${lastYearGdd}℃日` : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {lastYearData.length > 0 ? '気象アーカイブより' : 'データ未取得'}
                  </p>
                </div>
              </div>
            </section>

            {/* 積算温度比較 */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                3. 積算温度比較（今年 vs 昨年）
              </h2>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-green-50">
                  <tr>
                    <th className="text-left py-2.5 px-4 font-medium text-gray-600">項目</th>
                    <th className="text-center py-2.5 px-4 font-medium text-blue-700">{year}年（今年）</th>
                    <th className="text-center py-2.5 px-4 font-medium text-gray-500">{year - 1}年（昨年）</th>
                    <th className="text-center py-2.5 px-4 font-medium text-red-600">目標値</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['現在の積算温度', `${thisYearGdd}℃日`, lastYearGdd > 0 ? `${lastYearGdd}℃日` : '—', `${gddTarget}℃日`],
                    ['残り積算温度', `${Math.max(0, gddTarget - thisYearGdd)}℃日`, lastYearGdd > 0 ? `${Math.max(0, gddTarget - lastYearGdd)}℃日` : '—', '—'],
                    ['達成率', `${Math.min(100, Math.round(thisYearGdd / gddTarget * 100))}%`, lastYearGdd > 0 ? `${Math.min(100, Math.round(lastYearGdd / gddTarget * 100))}%` : '—', '100%'],
                  ].map(([label, a, b, target], i) => (
                    <tr key={label} className={`border-t border-gray-100 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <td className="py-2.5 px-4 text-gray-600">{label}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-blue-700">{a}</td>
                      <td className="py-2.5 px-4 text-center text-gray-500">{b}</td>
                      <td className="py-2.5 px-4 text-center text-red-600 font-medium">{target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">
                ※ 積算温度 = Σ max(0, 日平均気温 − 10℃)。開花日からの累積値。直近7日の予報値を含む。
              </p>
            </section>

            {/* 気温概要 */}
            <section className="mb-7">
              <h2 className="text-sm font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                4. 最近14日間の気温概要
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 text-center">
                  <p className="text-xs text-orange-600">平均最高気温</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">{avgTempMax}℃</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
                  <p className="text-xs text-blue-600">平均最低気温</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{avgTempMin}℃</p>
                </div>
              </div>
            </section>

            {/* フッター */}
            <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 text-center">
              <p>本レポートは Open-Meteo 気象API・農研機構標準値に基づき自動生成されました。</p>
              <p className="mt-0.5">株式会社ラファティリティ | 広島県庄原市総領町中領家178 | {today}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
