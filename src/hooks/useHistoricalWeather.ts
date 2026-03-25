import { useState, useEffect } from 'react';

export interface HistoricalDay {
  date: string;           // YYYY-MM-DD
  tempMax: number;
  tempMin: number;
  gdd: number;            // 日別有効積算温度（基準温度10℃）
  avgTemp: number;        // 日平均気温
  sunshineDuration: number; // 日照時間（時間）
}

const CACHE_PREFIX = 'rafatility_historical_';
const CACHE_HOURS = 24;
const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

function shiftDateByYears(dateStr: string, years: number): string {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function useHistoricalWeather(
  lat: number,
  lon: number,
  floweringDate: string   // 今年の開花日 YYYY-MM-DD
) {
  const [data, setData] = useState<HistoricalDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!floweringDate) return;

    // 昨年の対応期間を計算（開花日〜130日後）
    const lastYearStart = shiftDateByYears(floweringDate, -1);
    const lastYearEnd = (() => {
      const d = new Date(lastYearStart);
      d.setDate(d.getDate() + 130);
      // アーカイブAPIは数日前までしか取得できない
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 5);
      return (d < yesterday ? d : yesterday).toISOString().slice(0, 10);
    })();

    const cacheKey = `${CACHE_PREFIX}${lat}_${lon}_${lastYearStart}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { ts, d } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_HOURS * 3600 * 1000) {
          setData(d);
          return;
        }
      }
    } catch { /* ignore */ }

    setLoading(true);
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${lastYearStart}&end_date=${lastYearEnd}&daily=temperature_2m_max,temperature_2m_min,sunshine_duration&timezone=Asia%2FTokyo`;

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const times: string[] = json.daily?.time ?? [];
        const maxTemps: number[] = json.daily?.temperature_2m_max ?? [];
        const minTemps: number[] = json.daily?.temperature_2m_min ?? [];
        const sunSecs: number[] = json.daily?.sunshine_duration ?? [];

        const parsed: HistoricalDay[] = times.map((t, i) => {
          const avg = (maxTemps[i] + minTemps[i]) / 2;
          return {
            date: t,
            tempMax: maxTemps[i],
            tempMin: minTemps[i],
            avgTemp: avg,
            gdd: Math.max(0, avg - 10),
            sunshineDuration: (sunSecs[i] ?? 0) / 3600,
          };
        });

        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), d: parsed }));
        setData(parsed);
      })
      .catch(() => { /* APIエラー時はデータなし */ })
      .finally(() => setLoading(false));
  }, [lat, lon, floweringDate]);

  return { data, loading };
}
