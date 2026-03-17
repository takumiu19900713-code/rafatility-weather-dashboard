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
import { RainNowcastCard } from './components/RainNowcastCard';
import { SettingsPanel } from './components/SettingsPanel';
import { FieldRegistrationModal } from './components/FieldRegistrationModal';
import { useWeatherData } from './hooks/useWeatherData';
import { useWeatherCorrection } from './hooks/useWeatherCorrection';
import { useWorkLog } from './hooks/useWorkLog';
import { useCorrectionParams } from './hooks/useCorrectionParams';
import { useFields } from './hooks/useFields';
import { calcCrackRisk } from './utils/crackRiskCalculator';
import { applyWeatherCorrection } from './utils/weatherCorrection';

function App() {
  const { fields, addField, deleteField } = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id ?? 'F001');
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const { params, updateParams, resetParams } = useCorrectionParams();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const { forecast, past14, hourly, loading, error, lastUpdated, refetch } = useWeatherData(
    selectedField?.lat ?? fields[0]?.lat ?? 34.92,
    selectedField?.lon ?? fields[0]?.lon ?? 133.05,
    selectedFieldId
  );

  const correctedForecast = useWeatherCorrection(forecast, selectedField, params);

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
    return past14.map((w) => applyWeatherCorrection(w, selectedField, params));
  }, [past14, selectedField, params]);

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
          fields={fields}
          selectedId={selectedFieldId}
          onSelect={setSelectedFieldId}
          onAddField={() => setFieldModalOpen(true)}
          onDeleteField={deleteField}
        />

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="md:col-span-1 lg:col-span-1">
            <FieldMap
              fields={fields}
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

        {/* Rain nowcast */}
        <RainNowcastCard hourly={hourly} />

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

      <footer className="text-center text-xs text-gray-400 py-6 mt-4 border-t relative">
        <button
          onClick={() => setSettingsOpen(true)}
          className="absolute left-4 bottom-6 flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          ⚙️ 補正パラメータ設定
        </button>
        © 2025 株式会社ラファティリティ | 圃場単位気象AI補正ダッシュボード v1.0 MVP<br />
        広島県庄原市総領町中領家178
      </footer>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        params={params}
        onSave={updateParams}
        onReset={resetParams}
      />

      <FieldRegistrationModal
        open={fieldModalOpen}
        onClose={() => setFieldModalOpen(false)}
        onSave={(fieldData) => {
          const newField = addField(fieldData);
          setSelectedFieldId(newField.id);
        }}
      />
    </div>
  );
}

export default App;
