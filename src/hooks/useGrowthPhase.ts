import { useState, useEffect } from 'react';
import type { FruitStage, GrowthPhase } from '../types';

function detectPhase(): GrowthPhase {
  const m = new Date().getMonth() + 1;
  if (m === 12 || m <= 2) return '冬季';
  if (m <= 5) return '春季';
  if (m <= 7) return '梅雨期';
  return '収穫期';
}

const PHASE_KEY = 'rafatility_growth_phase';
const STAGE_KEY = 'rafatility_fruit_stage';
const FLOWERING_PREFIX = 'rafatility_flowering_';

export function useGrowthPhase(fieldId: string) {
  const [phase, setPhaseState] = useState<GrowthPhase>(
    () => (localStorage.getItem(PHASE_KEY) as GrowthPhase) ?? detectPhase()
  );
  const [fruitStage, setFruitStageState] = useState<FruitStage>(
    () => (localStorage.getItem(STAGE_KEY) as FruitStage) ?? '肥大期'
  );
  const [floweringDate, setFloweringDateState] = useState<string>(
    () => localStorage.getItem(FLOWERING_PREFIX + fieldId) ?? ''
  );

  // 圃場切替時に開花日をリロード
  useEffect(() => {
    setFloweringDateState(localStorage.getItem(FLOWERING_PREFIX + fieldId) ?? '');
  }, [fieldId]);

  const setPhase = (p: GrowthPhase) => {
    localStorage.setItem(PHASE_KEY, p);
    setPhaseState(p);
  };
  const setFruitStage = (s: FruitStage) => {
    localStorage.setItem(STAGE_KEY, s);
    setFruitStageState(s);
  };
  const setFloweringDate = (date: string) => {
    localStorage.setItem(FLOWERING_PREFIX + fieldId, date);
    setFloweringDateState(date);
  };

  return { phase, fruitStage, floweringDate, setPhase, setFruitStage, setFloweringDate };
}
