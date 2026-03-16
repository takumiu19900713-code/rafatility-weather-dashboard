import type { Field, DailyWeather, CorrectedWeather } from '../types';

const ASPECT_TEMP_CORRECTION: Record<string, number> = {
  south: 0.8,
  southwest: 0.6,
  east: 0.3,
  north: -0.5,
  other: 0,
};

const ASPECT_PRECIP_CORRECTION: Record<string, number> = {
  south: 1.0,
  southwest: 1.05,
  east: 1.0,
  north: 1.0,
  other: 1.03,
};

export function applyWeatherCorrection(
  weather: DailyWeather,
  field: Field
): CorrectedWeather {
  const elevationCorrection = -((field.elevation - 0) / 100) * 0.6;
  const aspectCorrection = ASPECT_TEMP_CORRECTION[field.aspect] ?? 0;
  const precipCorrection = ASPECT_PRECIP_CORRECTION[field.aspect] ?? 1.0;

  return {
    ...weather,
    correctedTempMax: Math.round((weather.tempMax + elevationCorrection + aspectCorrection) * 10) / 10,
    correctedTempMin: Math.round((weather.tempMin + elevationCorrection + aspectCorrection) * 10) / 10,
    correctedPrecipitation: Math.round(weather.precipitation * precipCorrection * 10) / 10,
    correctionDetails: {
      elevationCorrection: Math.round(elevationCorrection * 10) / 10,
      aspectCorrection,
      precipCorrection,
    },
  };
}
