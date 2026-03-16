import type { CrackRisk } from '../types';

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

export function calcCrackRisk(precipData7days: number[]): CrackRisk {
  const totalPrecip = precipData7days.reduce((a, b) => a + b, 0);
  const maxDailyPrecip = Math.max(...precipData7days);
  const consecutiveRainDays = countConsecutive(precipData7days, (v) => v > 1);

  let score = 0;
  score += Math.min((totalPrecip / 50) * 40, 40);
  score += Math.min((maxDailyPrecip / 30) * 35, 35);
  score += Math.min((consecutiveRainDays / 5) * 25, 25);
  const roundedScore = Math.round(score);

  let level: 'low' | 'medium' | 'high';
  let advice: string;
  if (roundedScore < 40) {
    level = 'low';
    advice = '現在リスクは低いです。通常管理を継続してください。';
  } else if (roundedScore < 70) {
    level = 'medium';
    advice = '降雨後24時間は果実水分を注意してください。排水は早めに。';
  } else {
    level = 'high';
    advice = '排水を直ちに行ってください。着水確認と袋かけの点検を推奨します。';
  }

  return {
    score: roundedScore,
    level,
    advice,
    factors: { totalPrecip: Math.round(totalPrecip * 10) / 10, maxDailyPrecip, consecutiveRainDays },
  };
}
