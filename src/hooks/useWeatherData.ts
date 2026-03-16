import { useState, useEffect, useCallback } from 'react';
import type { DailyWeather, WeatherApiResponse } from '../types';

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
  }));
}

export function useWeatherData(lat: number, lon: number, fieldId: string) {
  const [forecast, setForecast] = useState<DailyWeather[]>([]);
  const [past14, setPast14] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cacheKey = `${CACHE_KEY_PREFIX}${fieldId}`;
    try {
      // Check cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const entry: CacheEntry & { past14: DailyWeather[] } = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
          setForecast(entry.data);
          setPast14(entry.past14 ?? []);
          setLastUpdated(new Date(entry.timestamp));
          setLoading(false);
          return;
        }
      }

      const base = 'https://api.open-meteo.com/v1/forecast';
      const commonParams = `latitude=${lat}&longitude=${lon}&timezone=Asia%2FTokyo`;
      const dailyParams = 'daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,relative_humidity_2m_max';

      const [forecastRes, pastRes] = await Promise.all([
        fetch(`${base}?${commonParams}&${dailyParams}&forecast_days=7`),
        fetch(`${base}?${commonParams}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,weathercode,windspeed_10m_max,precipitation_probability_max&past_days=14&forecast_days=1`),
      ]);

      if (!forecastRes.ok || !pastRes.ok) throw new Error('APIエラーが発生しました');

      const forecastData: WeatherApiResponse = await forecastRes.json();
      const pastData: WeatherApiResponse = await pastRes.json();

      const parsedForecast = parseApiResponse(forecastData);
      const parsedPast = parseApiResponse(pastData);

      setForecast(parsedForecast);
      setPast14(parsedPast);
      const now = new Date();
      setLastUpdated(now);

      localStorage.setItem(cacheKey, JSON.stringify({
        data: parsedForecast,
        past14: parsedPast,
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

  return { forecast, past14, loading, error, lastUpdated, refetch: fetchData };
}
