import type { WorkLog, LearnedPattern } from '../types';

export function analyzePatterns(logs: WorkLog[]): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  const evaluated = logs.filter(l => l.outcome !== null);
  if (evaluated.length === 0) return patterns;

  // パターン1: 高リスク時の散水停止 → 結果良好
  const stopHighRisk = evaluated.filter(
    l => l.action === 'stop_irrigate' && l.crackRiskScore >= 60 && l.outcome === 'good'
  );
  if (stopHighRisk.length > 0) {
    patterns.push({
      condition: 'リスクスコア60以上',
      action: 'stop_irrigate',
      outcome: 'good',
      count: stopHighRisk.length,
      recommendation: `リスク高時の散水停止で裂果回避 (${stopHighRisk.length}件の成功実績)`,
    });
  }

  // パターン2: 低リスク時の散水 → 結果良好
  const irrigateLowRisk = evaluated.filter(
    l => l.action === 'irrigate' && l.crackRiskScore < 40 && l.outcome === 'good'
  );
  if (irrigateLowRisk.length > 0) {
    patterns.push({
      condition: 'リスクスコア40未満',
      action: 'irrigate',
      outcome: 'good',
      count: irrigateLowRisk.length,
      recommendation: `低リスク時の散水は安全 (${irrigateLowRisk.length}件の成功実績)`,
    });
  }

  // パターン3: 高リスク時の散水 → 裂果発生
  const irrigateHighRisk = evaluated.filter(
    l => l.action === 'irrigate' && l.crackRiskScore >= 60 && l.outcome === 'bad'
  );
  if (irrigateHighRisk.length > 0) {
    patterns.push({
      condition: 'リスクスコア60以上での散水',
      action: 'irrigate',
      outcome: 'bad',
      count: irrigateHighRisk.length,
      recommendation: `高リスク時の散水で裂果発生 → 散水停止を推奨 (${irrigateHighRisk.length}件の失敗実績)`,
    });
  }

  return patterns;
}

export function calcAIAccuracy(logs: WorkLog[]): number {
  const evaluated = logs.filter(l => l.outcome !== null);
  if (evaluated.length === 0) return 0;
  // 記録件数に応じた擬似精度（実際はML結果）
  return Math.min(50 + evaluated.length * 5, 95);
}
