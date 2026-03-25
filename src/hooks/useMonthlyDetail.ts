import { useState, useEffect } from 'react';

export interface DailyRecord {
  date: string;       // YYYY-MM-DD
  day: number;        // 1-31
  tempMax: number;
  tempMin: number;
  avgTemp: number;
  precipitation: number;
  sunshineDuration: number; // 時間
  gdd: number;        // 有効積算温度 base10℃
}

const CACHE_PREFIX = 'rafatility_monthly_detail_';
const CACHE_HOURS = 24;
const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 0); // month は 1-12 なのでそのまま渡すと翌月0日 = 月末
  return d.toISOString().slice(0, 10);
}

export function useMonthlyDetail(
  lat: number,
  lon: number,
  entries: { year: number; month: number }[]  // 最大2件（比較用）
) {
  const [data, setData] = useState<Record<string, DailyRecord[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = entries.map((e) => `${e.year}-${e.month}`).join(',');

  useEffect(() => {
    if (!lat || !lon || entries.length === 0) return;
    setLoading(true);
    setError(null);

    const fetches = entries.map(async ({ year, month }) => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate   = lastDayOfMonth(year, month);
      const cacheKey  = `${CACHE_PREFIX}${lat}_${lon}_${startDate}`;

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { ts, d } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_HOURS * 3600 * 1000)
            return { key: `${year}-${month}`, records: d as DailyRecord[] };
        }
      } catch { /* ignore */ }

      const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration&timezone=Asia%2FTokyo`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${year}年${month}月のデータ取得失敗`);
      const json = await res.json();

      const times: string[]  = json.daily?.time ?? [];
      const maxT: number[]   = json.daily?.temperature_2m_max ?? [];
      const minT: number[]   = json.daily?.temperature_2m_min ?? [];
      const precip: number[] = json.daily?.precipitation_sum ?? [];
      const sunSec: number[] = json.daily?.sunshine_duration ?? [];

      const records: DailyRecord[] = times.map((t, i) => {
        const avg = (maxT[i] + minT[i]) / 2;
        return {
          date: t,
          day: new Date(t).getDate(),
          tempMax: Math.round(maxT[i] * 10) / 10,
          tempMin: Math.round(minT[i] * 10) / 10,
          avgTemp: Math.round(avg * 10) / 10,
          precipitation: Math.round((precip[i] ?? 0) * 10) / 10,
          sunshineDuration: Math.round(((sunSec[i] ?? 0) / 3600) * 10) / 10,
          gdd: Math.round(Math.max(0, avg - 10) * 10) / 10,
        };
      });

      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), d: records }));
      } catch { /* ignore */ }

      return { key: `${year}-${month}`, records };
    });

    Promise.all(fetches)
      .then((results) => {
        const map: Record<string, DailyRecord[]> = {};
        results.forEach(({ key, records }) => { map[key] = records; });
        setData(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lat, lon, key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
