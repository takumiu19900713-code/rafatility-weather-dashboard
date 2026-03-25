// 着果ステージ
export type FruitStage = '開花前' | '開花〜着果' | '肥大期' | '収穫期';
export const STAGE_COEFFICIENT: Record<FruitStage, number> = {
  '開花前':     0.5,
  '開花〜着果': 1.0,
  '肥大期':     1.5,
  '収穫期':     1.2,
};

// 生育フェーズ
export type GrowthPhase = '冬季' | '春季' | '梅雨期' | '収穫期';

// ユーザーロール
export type UserRole = '従業員' | '管理者';

// 出荷予測データ
export interface ShipmentForecastData {
  fieldName: string;
  crop: string;
  floweringDate: string;
  elapsedDays: number;
  accumulatedTemp: number;
  standardDays: number;
  predictedShipDate: string;
  confidenceRange: string;
  precip7days: number;
  crackRiskHistory: { date: string; score: number }[];
}

export interface Field {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  aspect: 'south' | 'southwest' | 'east' | 'north' | 'other';
  location: string;
  crop?: string;        // 品種名
  area?: number;        // 栽培面積 (a)
  manager?: string;     // 管理担当者
  roofType?: 'open' | 'unheated_house' | 'heated_house'; // 露地/無加温/加温ハウス
  isCustom?: boolean;   // ユーザー追加圃場
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
  sunshineDuration: number; // 日照時間（時間）
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
    dryDaysBefore: number;    // 直前の連続晴天日数
    dryRainBonus: number;     // 乾燥後急雨ボーナス点
    knowledgeBonus: number;   // 農家ナレッジルールによる加算
  };
}

// 15分別ナウキャスト
export interface MinutelyWeather {
  time: string;
  minuteOffset: number; // 現在時刻からの経過分
  precipitation: number;
  weatherCode: number;
  temperature: number;
}

// 時間別天気
export interface HourlyWeather {
  time: string;        // ISO datetime
  hour: number;        // 0-23
  precipitation: number;
  precipProbability: number;
  weatherCode: number;
  temperature: number;
  humidity: number;    // 相対湿度 %
  windspeed: number;   // 風速 m/s
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
    sunshine_duration: number[]; // 秒単位
  };
}

// 作業種別
export type WorkAction =
  | 'irrigate'       // 散水した
  | 'stop_irrigate'  // 散水停止
  | 'harvest'        // 収穫した
  | 'bagging'        // 袋かけ
  | 'inspection'     // 点検・観察
  | 'crack_found'    // 裂果発見
  | 'fertilize'      // 施肥した
  | 'spray';         // 農薬散布

// 作業記録
export interface WorkLog {
  id: string;
  fieldId: string;
  date: string;          // YYYY-MM-DD
  action: WorkAction;
  crackRiskScore: number;
  weatherSnapshot: {
    tempMax: number;
    tempMin: number;
    precipitation: number;
    precip7days: number;
  };
  outcome: 'good' | 'bad' | null; // 後から入力
  note: string;
}

// AIが検出したパターン
export interface LearnedPattern {
  condition: string;   // 条件説明
  action: WorkAction;
  outcome: 'good' | 'bad';
  count: number;
  recommendation: string;
}

// 農家ナレッジルール
export interface KnowledgeRule {
  id: string;
  fieldId: string;     // 'all' で全圃場共通
  title: string;       // ルール名
  note: string;        // 農家メモ（自由記述）
  condition: {
    dryDaysMin?: number;     // 連続晴天日数の下限
    rainMmMin?: number;      // 降雨量の下限 (mm)
    humidityPctMin?: number; // 最大湿度の下限 (%)
    consecutiveRainMin?: number; // 連続雨天日数の下限
  };
  riskBonus: number;   // スコアへの加算値（0〜50）
  active: boolean;
  createdAt: string;
}
