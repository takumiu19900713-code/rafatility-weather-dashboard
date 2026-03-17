import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FieldSelector } from './components/FieldSelector';
import { FieldMap } from './components/FieldMap';
import { WeatherSummaryCard } from './components/WeatherSummaryCard';
import { CrackRiskGauge } from './components/CrackRiskGauge';
import { ForecastTable } from './components/ForecastTable';
import { PrecipitationChart } from './components/PrecipitationChart';
import { AIAdviceCard } from './components/AIAdviceCard';
import { WorkLogCard } from './components/WorkLogCard';
import { AILearningCard } from './components/AILearningCard';
import { useWeatherData } from './hooks/useWeatherData';
import { useWeatherCorrection } from './hooks/useWeatherCorrection';
import { useWorkLog } from './hooks/useWorkLog';
import { calcCrackRisk } from './utils/crackRiskCalculator';
import { applyWeatherCorrection } from './utils/weatherCorrection';
import { FIELDS } from './data/fields';

function App() {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(FIELDS[0].id);

  const selectedField = FIELDS.find((f) => f.id === selectedFieldId) ?? null;

  const { forecast, past14, loading, error, lastUpdated, refetch } = useWeatherData(
    selectedField?.lat ?? FIELDS[0].lat,
    selectedField?.lon ?? FIELDS[0].lon,
    selectedFieldId
  );

  const correctedForecast = useWeatherCorrection(forecast, selectedField);

  const today = correctedForecast[0] ?? null;

  const crackRisk = useMemo(() => {
    if (correctedForecast.length === 0) return null;
    const precips = correctedForecast.slice(0, 7).map((d) => d.correctedPrecipitation);
    return calcCrackRisk(precips);
  }, [correctedForecast]);

  const { logs: workLogs } = useWorkLog(selectedFieldId, crackRisk?.score ?? 0, today);

  // Also compute past14 corrected (already done via useWeatherCorrection)
  const correctedPast14Final = useMemo(() => {
    if (!selectedField || past14.length === 0) return [];
    return past14.map((w) => applyWeatherCorrection(w, selectedField));
  }, [past14, selectedField]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header lastUpdated={lastUpdated} onRefresh={refetch} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            ⚠️ {error} (キャッシュデータを表示中)
          </div>
        )}

        {/* Field selector */}
        <FieldSelector
          fields={FIELDS}
          selectedId={selectedFieldId}
          onSelect={setSelectedFieldId}
        />

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="md:col-span-1 lg:col-span-1">
            <FieldMap
              fields={FIELDS}
              selectedField={selectedField}
              onSelectField={setSelectedFieldId}
            />
          </div>

          {/* Weather summary */}
          <div className="md:col-span-1 lg:col-span-1">
            <WeatherSummaryCard
              today={today}
              fieldName={selectedField?.name ?? ''}
            />
          </div>

          {/* Crack risk gauge */}
          <div className="md:col-span-2 lg:col-span-1">
            <CrackRiskGauge risk={crackRisk} />
          </div>
        </div>

        {/* AI Advice */}
        <AIAdviceCard risk={crackRisk} field={selectedField} />

        {/* Work log + AI Learning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WorkLogCard
            fieldId={selectedFieldId}
            fieldName={selectedField?.name ?? ''}
            crackRiskScore={crackRisk?.score ?? 0}
            todayWeather={today}
          />
          <AILearningCard logs={workLogs} />
        </div>

        {/* Forecast table */}
        <ForecastTable forecast={correctedForecast} />

        {/* Precipitation chart */}
        <PrecipitationChart past14={past14} correctedPast14={correctedPast14Final} />

        {loading && (
          <div className="text-center text-sm text-gray-400 py-2">データ更新中...</div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 mt-4 border-t">
        © 2025 株式会社ラファティリティ | 圃場単位気象AI補正ダッシュボード v1.0 MVP<br />
        広島県庄原市総領町中領家178
      </footer>
    </div>
  );
}

export default App;
