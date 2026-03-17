import { useState } from 'react';

export interface CorrectionParams {
  elevationLapseRate: number;     // ℃/100m (-0.6)
  referenceElevation: number;     // m (150)
  mountainPrecipCoeff: number;    // 倍率 (1.05)
  aspectTemp: {
    south: number;       // +0.8
    southwest: number;   // +0.6
    east: number;        // +0.3
    north: number;       // -0.5
    other: number;       // 0
  };
  aspectPrecip: {
    southwest: number;   // 1.05
    other: number;       // 1.0
  };
}

const STORAGE_KEY = 'rafatility_correction_params';

export const DEFAULT_PARAMS: CorrectionParams = {
  elevationLapseRate: -0.6,
  referenceElevation: 150,
  mountainPrecipCoeff: 1.05,
  aspectTemp: {
    south: 0.8,
    southwest: 0.6,
    east: 0.3,
    north: -0.5,
    other: 0,
  },
  aspectPrecip: {
    southwest: 1.05,
    other: 1.0,
  },
};

function load(): CorrectionParams {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_PARAMS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_PARAMS;
}

export function useCorrectionParams() {
  const [params, setParams] = useState<CorrectionParams>(load);

  const updateParams = (next: CorrectionParams) => {
    setParams(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetParams = () => {
    setParams(DEFAULT_PARAMS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { params, updateParams, resetParams };
}
