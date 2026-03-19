import type { CrackRisk, DailyWeather, FruitStage, KnowledgeRule } from '../types';
import { STAGE_COEFFICIENT } from '../types';

function countConsecutive(arr: number[], predicate: (v: number) => boolean): number {
  let max = 0;
  let cur = 0;
  for (const v of arr) {
    if (predicate(v)) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 0;
    }
  }
  return max;
}

// 直前の連続晴天日数（降水<1mmを晴天とみなす）
function calcDryDaysBefore(past14: DailyWeather[]): number {
  // past14は古い順→新しい順に並んでいる想定。末尾から逆にカウント
  let count = 0;
  for (let i = past14.length - 1; i >= 0; i--) {
    if (past14[i].precipitation < 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// ナレッジルールを評価してボーナス点を合算
function applyKnowledgeRules(
  rules: KnowledgeRule[],
  fieldId: string,
  context: {
    dryDays: number;
    maxDailyPrecip: number;
    humidityMax: number;
    consecutiveRainDays: number;
  }
): number {
  let bonus = 0;
  for (const rule of rules) {
    if (!rule.active) continue;
    if (rule.fieldId !== 'all' && rule.fieldId !== fieldId) continue;

    const c = rule.condition;
    const match =
      (c.dryDaysMin === undefined || context.dryDays >= c.dryDaysMin) &&
      (c.rainMmMin === undefined || context.maxDailyPrecip >= c.rainMmMin) &&
      (c.humidityPctMin === undefined || context.humidityMax >= c.humidityPctMin) &&
      (c.consecutiveRainMin === undefined || context.consecutiveRainDays >= c.consecutiveRainMin);

    if (match) bonus += rule.riskBonus;
  }
  return Math.min(bonus, 50); // ナレッジボーナス上限50点
}

export function calcCrackRisk(
  precipData7days: number[],
  options?: {
    past14?: DailyWeather[];
    roofType?: 'open' | 'unheated_house' | 'heated_house';
    fieldId?: string;
    knowledgeRules?: KnowledgeRule[];
    humidityMax?: number;
    fruitStage?: FruitStage;
  }
): CrackRisk {
  const roofType = options?.roofType ?? 'open';
  const past14 = options?.past14 ?? [];
  const fieldId = options?.fieldId ?? '';
  const knowledgeRules = options?.knowledgeRules ?? [];
  const humidityMax = options?.humidityMax ?? 0;
  const fruitStage = options?.fruitStage;
  const stageCoeff = fruitStage ? STAGE_COEFFICIENT[fruitStage] : 1.0;

  const totalPrecip = precipData7days.reduce((a, b) => a + b, 0);
  const maxDailyPrecip = Math.max(...precipData7days, 0);
  const consecutiveRainDays = countConsecutive(precipData7days, (v) => v > 1);

  // ハウス係数：ハウスは直接雨が当たらないため、1日最大降水の影響を大幅に軽減
  const roofFactor = roofType === 'open' ? 1.0 : 0.35;

  // 基本スコア
  let score = 0;
  score += Math.min((totalPrecip / 50) * 40, 40) * (roofType === 'open' ? 1.0 : 0.5);
  score += Math.min((maxDailyPrecip / 30) * 35, 35) * roofFactor;
  score += Math.min((consecutiveRainDays / 5) * 25, 25);

  // 着果ステージ係数を基本スコアに適用
  score = score * stageCoeff;

  // 乾燥後急雨ボーナス（past14から直前の連続晴天日数を算出）
  const dryDaysBefore = past14.length > 0 ? calcDryDaysBefore(past14) : 0;
  let dryRainBonus = 0;
  if (maxDailyPrecip >= 10) {
    if (dryDaysBefore >= 14) dryRainBonus = 25;
    else if (dryDaysBefore >= 7) dryRainBonus = 15;
    else if (dryDaysBefore >= 4) dryRainBonus = 8;
  } else if (maxDailyPrecip >= 5) {
    if (dryDaysBefore >= 14) dryRainBonus = 15;
    else if (dryDaysBefore >= 7) dryRainBonus = 8;
  }
  score += dryRainBonus;

  // 農家ナレッジルールによるボーナス
  const knowledgeBonus = applyKnowledgeRules(knowledgeRules, fieldId, {
    dryDays: dryDaysBefore,
    maxDailyPrecip,
    humidityMax,
    consecutiveRainDays,
  });
  score += knowledgeBonus;

  const roundedScore = Math.min(Math.round(score), 100);

  let level: 'low' | 'medium' | 'high';
  let advice: string;

  if (roundedScore < 40) {
    level = 'low';
    if (roofType !== 'open') {
      advice = 'リスクは低いです。ハウス内の通気と土壌水分を確認してください。';
    } else {
      advice = '現在リスクは低いです。通常管理を継続してください。';
    }
  } else if (roundedScore < 70) {
    level = 'medium';
    if (dryDaysBefore >= 7) {
      advice = `乾燥${dryDaysBefore}日後の降雨です。根の急激な吸水に注意。排水は早めに。`;
    } else if (roofType !== 'open') {
      advice = '湿度上昇に注意。ハウス換気を強化し、病気リスクも確認してください。';
    } else {
      advice = '降雨後24時間は果実水分を注意してください。排水は早めに。';
    }
  } else {
    level = 'high';
    if (dryDaysBefore >= 14) {
      advice = `⚠️ 長期乾燥(${dryDaysBefore}日)後の急雨。裂果リスク最高。即排水・収穫判断を。`;
    } else if (roofType !== 'open') {
      advice = '根の過剰吸水リスクが高い。土壌水分管理と換気を最優先に。';
    } else {
      advice = '排水を直ちに行ってください。着水確認と袋かけの点検を推奨します。';
    }
  }

  return {
    score: roundedScore,
    level,
    advice,
    factors: {
      totalPrecip: Math.round(totalPrecip * 10) / 10,
      maxDailyPrecip,
      consecutiveRainDays,
      dryDaysBefore,
      dryRainBonus,
      knowledgeBonus,
    },
  };
}
