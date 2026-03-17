import type { Field, DailyWeather, CorrectedWeather } from '../types';
import type { CorrectionParams } from '../hooks/useCorrectionParams';
import { DEFAULT_PARAMS } from '../hooks/useCorrectionParams';

export function applyWeatherCorrection(
  weather: DailyWeather,
  field: Field,
  params: CorrectionParams = DEFAULT_PARAMS
): CorrectedWeather {
  // 標高補正: (圃場標高 - 基準標高) / 100 * 気温減率
  const elevationDiff = field.elevation - params.referenceElevation;
  const elevationCorrection = (elevationDiff / 100) * params.elevationLapseRate;

  // 斜面方向補正
  const aspectCorrection = params.aspectTemp[field.aspect] ?? 0;

  // 降水補正
  const precipCorrection = field.aspect === 'southwest'
    ? params.aspectPrecip.southwest
    : params.aspectPrecip.other;

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
