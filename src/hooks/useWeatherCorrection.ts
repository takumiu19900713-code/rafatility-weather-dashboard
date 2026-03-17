import { useMemo } from 'react';
import type { Field, DailyWeather, CorrectedWeather } from '../types';
import type { CorrectionParams } from './useCorrectionParams';
import { applyWeatherCorrection } from '../utils/weatherCorrection';

export function useWeatherCorrection(
  weatherData: DailyWeather[],
  field: Field | null,
  params?: CorrectionParams
): CorrectedWeather[] {
  return useMemo(() => {
    if (!field || weatherData.length === 0) return [];
    return weatherData.map((w) => applyWeatherCorrection(w, field, params));
  }, [weatherData, field, params]);
}
