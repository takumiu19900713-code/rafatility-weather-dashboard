import { useState, useEffect, useCallback } from 'react';
import type { DailyWeather, HourlyWeather, MinutelyWeather, WeatherApiResponse } from '../types';

const CACHE_KEY_PREFIX = 'weather_cache_';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: DailyWeather[];
  timestamp: number;
}

function parseApiResponse(data: WeatherApiResponse): DailyWeather[] {
  return data.daily.time.map((date, i) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i] ?? 0,
    tempMin: data.daily.temperature_2m_min[i] ?? 0,
    precipitation: data.daily.precipitation_sum[i] ?? 0,
    precipProbability: data.daily.precipitation_probability_max[i] ?? 0,
    weatherCode: data.daily.weathercode[i] ?? 0,
    windspeed: data.daily.windspeed_10m_max[i] ?? 0,
    humidityMax: data.daily.relative_humidity_2m_max[i] ?? 0,
    sunshineDuration: (data.daily.sunshine_duration?.[i] ?? 0) / 3600, // 秒→時間
  }));
}

export function useWeatherData(lat: number, lon: number, fieldId: string) {
  const [forecast, setForecast] = useState<DailyWeather[]>([]);
  const [past14, setPast14] = useState<DailyWeather[]>([]);
  const [hourly, setHourly] = useState<HourlyWeather[]>([]);
  const [minutely, setMinutely] = useState<MinutelyWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cacheKey = `${CACHE_KEY_PREFIX}${fieldId}`;
    try {
      // Check cache（ナウキャストは5分キャッシュ）
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const entry: CacheEntry & { past14: DailyWeather[]; hourly: HourlyWeather[]; minutely: MinutelyWeather[] } = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
          setForecast(entry.data);
          setPast14(entry.past14 ?? []);
          setHourly(entry.hourly ?? []);
          setMinutely(entry.minutely ?? []);
          setLastUpdated(new Date(entry.timestamp));
          setLoading(false);
          return;
        }
      }

      const base = 'https://api.open-meteo.com/v1/forecast';
      const commonParams = `latitude=${lat}&longitude=${lon}&timezone=Asia%2FTokyo`;
      const dailyParams = 'daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,relative_humidity_2m_max,sunshine_duration';

      const [forecastRes, pastRes, hourlyRes, minutelyRes] = await Promise.all([
        fetch(`${base}?${commonParams}&${dailyParams}&forecast_days=7`),
        fetch(`${base}?${commonParams}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,weathercode,windspeed_10m_max,precipitation_probability_max,sunshine_duration&past_days=14&forecast_days=1`),
        fetch(`${base}?${commonParams}&hourly=precipitation,precipitation_probability,weathercode,temperature_2m,relativehumidity_2m,windspeed_10m&forecast_days=2`),
        fetch(`${base}?${commonParams}&minutely_15=precipitation,weather_code,temperature_2m&forecast_days=1`),
      ]);

      if (!forecastRes.ok || !pastRes.ok || !hourlyRes.ok) throw new Error('APIエラーが発生しました');

      const forecastData: WeatherApiResponse = await forecastRes.json();
      const pastData: WeatherApiResponse = await pastRes.json();
      const hourlyData = await hourlyRes.json();
      const minutelyData = minutelyRes.ok ? await minutelyRes.json() : null;

      const parsedForecast = parseApiResponse(forecastData);
      const parsedPast = parseApiResponse(pastData);

      // 時間別データをパース（現在時刻以降12時間分）
      const nowHour = new Date().getHours();
      const todayDate = new Date().toISOString().split('T')[0];
      const parsedHourly: HourlyWeather[] = (hourlyData.hourly?.time ?? [])
        .map((t: string, i: number) => ({
          time: t,
          hour: new Date(t).getHours(),
          precipitation: hourlyData.hourly.precipitation[i] ?? 0,
          precipProbability: hourlyData.hourly.precipitation_probability[i] ?? 0,
          weatherCode: hourlyData.hourly.weathercode[i] ?? 0,
          temperature: hourlyData.hourly.temperature_2m[i] ?? 0,
          humidity: hourlyData.hourly.relativehumidity_2m[i] ?? 0,
          windspeed: Math.round((hourlyData.hourly.windspeed_10m[i] ?? 0) * 10) / 10,
        }))
        .filter((h: HourlyWeather) => {
          const d = h.time.split('T')[0];
          if (d === todayDate) return h.hour >= nowHour;
          return d > todayDate;
        })
        .slice(0, 12);

      // 15分別ナウキャスト（現在時刻以降2時間 = 8エントリ）
      const nowMs = Date.now();
      const parsedMinutely: MinutelyWeather[] = minutelyData
        ? ((minutelyData.minutely_15?.time ?? []) as string[])
            .map((t: string, i: number) => {
              const tMs = new Date(t).getTime();
              return {
                time: t,
                minuteOffset: Math.round((tMs - nowMs) / 60000),
                precipitation: minutelyData.minutely_15.precipitation[i] ?? 0,
                weatherCode: minutelyData.minutely_15.weather_code[i] ?? 0,
                temperature: minutelyData.minutely_15.temperature_2m[i] ?? 0,
              };
            })
            .filter((m: MinutelyWeather) => m.minuteOffset >= -7 && m.minuteOffset <= 30)
        : [];

      setForecast(parsedForecast);
      setPast14(parsedPast);
      setHourly(parsedHourly);
      setMinutely(parsedMinutely);
      const now = new Date();
      setLastUpdated(now);

      localStorage.setItem(cacheKey, JSON.stringify({
        data: parsedForecast,
        past14: parsedPast,
        hourly: parsedHourly,
        minutely: parsedMinutely,
        timestamp: now.getTime(),
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '不明なエラー';
      setError(msg);
      // Try to use cache even if expired
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const entry = JSON.parse(cached);
        setForecast(entry.data ?? []);
        setPast14(entry.past14 ?? []);
        setHourly(entry.hourly ?? []);
        setMinutely(entry.minutely ?? []);
        setLastUpdated(new Date(entry.timestamp));
      }
    } finally {
      setLoading(false);
    }
  }, [lat, lon, fieldId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { forecast, past14, hourly, minutely, loading, error, lastUpdated, refetch: fetchData };
}
