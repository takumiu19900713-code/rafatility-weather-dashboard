import { useState, useCallback } from 'react';

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

const STORAGE_KEY = 'rafatility_correction_params_v2';

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

function loadForField(fieldId: string): CorrectionParams {
  try {
    const all = localStorage.getItem(STORAGE_KEY);
    if (all) {
      const map = JSON.parse(all) as Record<string, CorrectionParams>;
      if (map[fieldId]) return { ...DEFAULT_PARAMS, ...map[fieldId] };
    }
  } catch {}
  return DEFAULT_PARAMS;
}

function saveForField(fieldId: string, params: CorrectionParams) {
  try {
    const all = localStorage.getItem(STORAGE_KEY);
    const map = all ? (JSON.parse(all) as Record<string, CorrectionParams>) : {};
    map[fieldId] = params;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function deleteForField(fieldId: string) {
  try {
    const all = localStorage.getItem(STORAGE_KEY);
    if (!all) return;
    const map = JSON.parse(all) as Record<string, CorrectionParams>;
    delete map[fieldId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function useCorrectionParams(fieldId: string) {
  const [params, setParams] = useState<CorrectionParams>(() => loadForField(fieldId));
  const [currentFieldId, setCurrentFieldId] = useState(fieldId);

  // 圃場が切り替わったらパラメータを再ロード
  if (fieldId !== currentFieldId) {
    setCurrentFieldId(fieldId);
    setParams(loadForField(fieldId));
  }

  const updateParams = useCallback((next: CorrectionParams) => {
    setParams(next);
    saveForField(fieldId, next);
  }, [fieldId]);

  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    deleteForField(fieldId);
  }, [fieldId]);

  return { params, updateParams, resetParams };
}
