import { useState, useEffect } from 'react';

export interface MonthlyData {
  month: string;       // 'YYYY-MM'
  monthLabel: string;  // '1月'〜'12月'
  avgTempMax: number;
  avgTempMin: number;
  avgTemp: number;
  totalPrecip: number;
  totalSunshine: number; // 時間
  totalGdd: number;      // 有効積算温度 base10℃
  rainDays: number;      // 降水日数（1mm以上）
  maxDailyPrecip: number;
}

export interface YearlyData {
  year: number;
  monthly: MonthlyData[];
  annual: {
    avgTemp: number;
    totalPrecip: number;
    totalSunshine: number;
    totalGdd: number;
    rainDays: number;
  };
}

const CACHE_PREFIX = 'rafatility_yearly_';
const CACHE_HOURS = 24;
const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

function aggregateToMonthly(
  times: string[],
  maxTemps: number[],
  minTemps: number[],
  precips: number[],
  sunSecs: number[]
): MonthlyData[] {
  const byMonth: Record<string, {
    maxTemps: number[]; minTemps: number[];
    precips: number[]; sunHours: number[];
  }> = {};

  times.forEach((t, i) => {
    const m = t.slice(0, 7); // 'YYYY-MM'
    if (!byMonth[m]) byMonth[m] = { maxTemps: [], minTemps: [], precips: [], sunHours: [] };
    byMonth[m].maxTemps.push(maxTemps[i] ?? 0);
    byMonth[m].minTemps.push(minTemps[i] ?? 0);
    byMonth[m].precips.push(precips[i] ?? 0);
    byMonth[m].sunHours.push((sunSecs[i] ?? 0) / 3600);
  });

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => {
      const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
      const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);
      const avgMax = avg(d.maxTemps);
      const avgMin = avg(d.minTemps);
      const avgTp = (avgMax + avgMin) / 2;
      const gdd = sum(d.maxTemps.map((mx, i) => Math.max(0, ((mx + d.minTemps[i]) / 2) - 10)));
      return {
        month,
        monthLabel: `${parseInt(month.slice(5))}月`,
        avgTempMax: Math.round(avgMax * 10) / 10,
        avgTempMin: Math.round(avgMin * 10) / 10,
        avgTemp:    Math.round(avgTp * 10) / 10,
        totalPrecip: Math.round(sum(d.precips) * 10) / 10,
        totalSunshine: Math.round(sum(d.sunHours) * 10) / 10,
        totalGdd: Math.round(gdd),
        rainDays: d.precips.filter((p) => p >= 1).length,
        maxDailyPrecip: Math.round(Math.max(...d.precips) * 10) / 10,
      };
    });
}

async function fetchYearData(lat: number, lon: number, year: number): Promise<YearlyData> {
  const cacheKey = `${CACHE_PREFIX}${lat}_${lon}_${year}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { ts, d } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_HOURS * 3600 * 1000) return d;
    }
  } catch { /* ignore */ }

  const currentYear = new Date().getFullYear();
  const startDate = `${year}-01-01`;
  // 当年なら昨日まで、過去年なら12月31日まで
  const endDate = year < currentYear
    ? `${year}-12-31`
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() - 2); // アーカイブは2日前まで
        return d.toISOString().slice(0, 10);
      })();

  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration&timezone=Asia%2FTokyo`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('アーカイブAPIエラー');
  const json = await res.json();

  const times: string[]   = json.daily?.time ?? [];
  const maxT: number[]    = json.daily?.temperature_2m_max ?? [];
  const minT: number[]    = json.daily?.temperature_2m_min ?? [];
  const precip: number[]  = json.daily?.precipitation_sum ?? [];
  const sunSec: number[]  = json.daily?.sunshine_duration ?? [];

  const monthly = aggregateToMonthly(times, maxT, minT, precip, sunSec);

  const annual = {
    avgTemp:       Math.round((monthly.reduce((s, m) => s + m.avgTemp, 0) / (monthly.length || 1)) * 10) / 10,
    totalPrecip:   Math.round(monthly.reduce((s, m) => s + m.totalPrecip, 0) * 10) / 10,
    totalSunshine: Math.round(monthly.reduce((s, m) => s + m.totalSunshine, 0) * 10) / 10,
    totalGdd:      monthly.reduce((s, m) => s + m.totalGdd, 0),
    rainDays:      monthly.reduce((s, m) => s + m.rainDays, 0),
  };

  const result: YearlyData = { year, monthly, annual };
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), d: result }));
  } catch { /* quota exceeded */ }

  return result;
}

export function useYearlyData(lat: number, lon: number, years: number[]) {
  const [data, setData] = useState<YearlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon || years.length === 0) return;
    setLoading(true);
    setError(null);

    Promise.all(years.map((y) => fetchYearData(lat, lon, y)))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lat, lon, years.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
