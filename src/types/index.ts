export interface Field {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  aspect: 'south' | 'southwest' | 'east' | 'north' | 'other';
  location: string;
}

export interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipProbability: number;
  weatherCode: number;
  windspeed: number;
  humidityMax: number;
}

export interface CorrectedWeather extends DailyWeather {
  correctedTempMax: number;
  correctedTempMin: number;
  correctedPrecipitation: number;
  correctionDetails: {
    elevationCorrection: number;
    aspectCorrection: number;
    precipCorrection: number;
  };
}

export interface CrackRisk {
  score: number;
  level: 'low' | 'medium' | 'high';
  advice: string;
  factors: {
    totalPrecip: number;
    maxDailyPrecip: number;
    consecutiveRainDays: number;
  };
}

export interface WeatherApiResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
    windspeed_10m_max: number[];
    relative_humidity_2m_max: number[];
  };
}
