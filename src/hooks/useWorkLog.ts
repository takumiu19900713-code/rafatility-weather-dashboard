import { useState, useCallback } from 'react';
import type { WorkLog, WorkAction, CorrectedWeather } from '../types';

const STORAGE_KEY = 'rafatility_work_logs';

function loadLogs(): WorkLog[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveLogs(logs: WorkLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function useWorkLog(fieldId: string, crackRiskScore: number, todayWeather: CorrectedWeather | null) {
  const [logs, setLogs] = useState<WorkLog[]>(loadLogs);

  const addLog = useCallback((action: WorkAction, note = '') => {
    const today = new Date().toISOString().split('T')[0];
    const newLog: WorkLog = {
      id: `${Date.now()}`,
      fieldId,
      date: today,
      action,
      crackRiskScore,
      weatherSnapshot: {
        tempMax: todayWeather?.correctedTempMax ?? 0,
        tempMin: todayWeather?.correctedTempMin ?? 0,
        precipitation: todayWeather?.correctedPrecipitation ?? 0,
        precip7days: 0,
      },
      outcome: null,
      note,
    };
    const updated = [newLog, ...loadLogs()];
    saveLogs(updated);
    setLogs(updated);
  }, [fieldId, crackRiskScore, todayWeather]);

  const updateOutcome = useCallback((id: string, outcome: 'good' | 'bad') => {
    const updated = loadLogs().map(l => l.id === id ? { ...l, outcome } : l);
    saveLogs(updated);
    setLogs(updated);
  }, []);

  const fieldLogs = logs.filter(l => l.fieldId === fieldId);

  return { logs: fieldLogs, allLogs: logs, addLog, updateOutcome };
}
