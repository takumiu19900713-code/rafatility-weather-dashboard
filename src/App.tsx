import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FieldSelector } from './components/FieldSelector';
import { FieldMap } from './components/FieldMap';
import { WeatherSummaryCard } from './components/WeatherSummaryCard';
import { CrackRiskGauge } from './components/CrackRiskGauge';
import { ForecastTable } from './components/ForecastTable';
import { PrecipitationChart } from './components/PrecipitationChart';
import { AIAdviceCard } from './components/AIAdviceCard';
import { RainNowcastCard } from './components/RainNowcastCard';
import { KnowledgeCard } from './components/KnowledgeCard';
import { SettingsPanel } from './components/SettingsPanel';
import { FieldRegistrationModal } from './components/FieldRegistrationModal';
import { GrowthPhaseBar } from './components/GrowthPhaseBar';
import { ShipmentForecastCard } from './components/ShipmentForecastCard';
import { AccumulatedTempCard } from './components/AccumulatedTempCard';
import { PrintReportModal } from './components/PrintReportModal';
import { useWeatherData } from './hooks/useWeatherData';
import { useWeatherCorrection } from './hooks/useWeatherCorrection';
import { useWorkLog } from './hooks/useWorkLog';
import { useCorrectionParams } from './hooks/useCorrectionParams';
import { useFields } from './hooks/useFields';
import { useKnowledge } from './hooks/useKnowledge';
import { useGrowthPhase } from './hooks/useGrowthPhase';
import { useUserRole } from './hooks/useUserRole';
import { useHistoricalWeather } from './hooks/useHistoricalWeather';
import { calcCrackRisk } from './utils/crackRiskCalculator';
import { applyWeatherCorrection } from './utils/weatherCorrection';

function App() {
  const { fields, addField, deleteField, updateField } = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id ?? 'F001');
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [printReportOpen, setPrintReportOpen] = useState(false);
  const { params, updateParams, resetParams } = useCorrectionParams(selectedFieldId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { rules, addRule, toggleRule, deleteRule } = useKnowledge();
  const { role, isAdmin, setRole } = useUserRole();
  const {
    phase, fruitStage, floweringDate,
    setPhase, setFruitStage, setFloweringDate,
  } = useGrowthPhase(selectedFieldId);

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const { forecast, past14, hourly, minutely, loading, error, lastUpdated, refetch } = useWeatherData(
    selectedField?.lat ?? fields[0]?.lat ?? 34.92,
    selectedField?.lon ?? fields[0]?.lon ?? 133.05,
    selectedFieldId
  );

  // 昨年度の気温アーカイブ（梅雨期・収穫期のみ取得）
  const shouldFetchHistory = (phase === '収穫期' || phase === '梅雨期') && !!floweringDate;
  const { data: lastYearData, loading: lastYearLoading } = useHistoricalWeather(
    shouldFetchHistory ? (selectedField?.lat ?? 34.92) : 0,
    shouldFetchHistory ? (selectedField?.lon ?? 133.05) : 0,
    shouldFetchHistory ? floweringDate : ''
  );

  const correctedForecast = useWeatherCorrection(forecast, selectedField, params);
  const today = correctedForecast[0] ?? null;

  const crackRisk = useMemo(() => {
    if (correctedForecast.length === 0) return null;
    const precips = correctedForecast.slice(0, 7).map((d) => d.correctedPrecipitation);
    return calcCrackRisk(precips, {
      past14,
      roofType: selectedField?.roofType ?? 'open',
      fieldId: selectedFieldId,
      knowledgeRules: rules,
      humidityMax: today?.humidityMax ?? 0,
      fruitStage,
    });
  }, [correctedForecast, past14, selectedField, selectedFieldId, rules, today, fruitStage]);

  // 作業記録は裏でkeep（Excelエクスポート用）
  useWorkLog(selectedFieldId, crackRisk?.score ?? 0, today);

  const correctedPast14Final = useMemo(() => {
    if (!selectedField || past14.length === 0) return [];
    return past14.map((w) => applyWeatherCorrection(w, selectedField, params));
  }, [past14, selectedField, params]);

  // 春季：霜アラート
  const frostAlertDay = phase === '春季'
    ? correctedForecast.slice(0, 7).find((d) => d.correctedTempMin <= 3)
    : null;

  // 裂果リスクは肥大期のみ表示
  const showCrackRisk = fruitStage === '肥大期';

  return (
    <div className="min-h-screen bg-gray-100">
      <Header lastUpdated={lastUpdated} onRefresh={refetch} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            ⚠️ {error} (キャッシュデータを表示中)
          </div>
        )}

        {/* 春季：霜アラート */}
        {frostAlertDay && (
          <div className="bg-blue-50 border border-blue-300 text-blue-800 rounded-xl p-3 text-sm font-medium">
            🌡️ 霜注意アラート：{frostAlertDay.date} の最低気温{' '}
            <strong>{frostAlertDay.correctedTempMin.toFixed(1)}℃</strong> の予報。
            新芽・花芽への凍霜害に注意してください。
          </div>
        )}

        {/* Field selector */}
        <FieldSelector
          fields={fields}
          selectedId={selectedFieldId}
          onSelect={setSelectedFieldId}
          onAddField={() => setFieldModalOpen(true)}
          onDeleteField={deleteField}
          onUpdateRoofType={(id, roofType) => updateField(id, { roofType })}
        />

        {/* 生育フェーズ・生育ステージ */}
        <GrowthPhaseBar
          phase={phase}
          fruitStage={fruitStage}
          floweringDate={floweringDate}
          role={role}
          onPhaseChange={setPhase}
          onStageChange={setFruitStage}
          onFloweringDateChange={setFloweringDate}
        />

        {/* Main grid */}
        <div className={`grid grid-cols-1 gap-4 ${showCrackRisk ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          <div>
            <FieldMap fields={fields} selectedField={selectedField} onSelectField={setSelectedFieldId} />
          </div>
          <div>
            <WeatherSummaryCard today={today} fieldName={selectedField?.name ?? ''} />
          </div>
          {/* 裂果リスクは肥大期のみ */}
          {showCrackRisk && (
            <div className="md:col-span-2 lg:col-span-1">
              <CrackRiskGauge risk={crackRisk} fruitStage={fruitStage} />
            </div>
          )}
        </div>

        {/* 雨ナウキャスト（冬季以外） */}
        {phase !== '冬季' && (
          <RainNowcastCard hourly={hourly} minutely={minutely} />
        )}

        {/* 積算温度グラフ（梅雨期・収穫期） */}
        {(phase === '梅雨期' || phase === '収穫期') && floweringDate && (
          <AccumulatedTempCard
            floweringDate={floweringDate}
            crop={selectedField?.crop ?? ''}
            past14={past14}
            forecast={correctedForecast}
            lastYearData={lastYearData}
            lastYearLoading={lastYearLoading}
            fieldName={selectedField?.name ?? ''}
          />
        )}

        {/* 出荷予測（収穫期のみ） */}
        {phase === '収穫期' && (
          <ShipmentForecastCard
            fieldName={selectedField?.name ?? ''}
            crop={selectedField?.crop ?? ''}
            floweringDate={floweringDate}
            past14={past14}
            forecast={correctedForecast}
            crackRiskScore={crackRisk?.score ?? 0}
            role={role}
          />
        )}

        {/* PDF出力ボタン（管理者・梅雨期または収穫期） */}
        {isAdmin && (phase === '収穫期' || phase === '梅雨期') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700 text-sm">📄 出荷予測レポート（青果会社・製菓会社提出用）</p>
              <p className="text-xs text-gray-500 mt-0.5">
                積算温度・出荷予測日・昨年比較をPDFで出力します
              </p>
            </div>
            <button
              onClick={() => setPrintReportOpen(true)}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition shrink-0 ml-4"
            >
              PDF出力
            </button>
          </div>
        )}

        {/* AI Advice（肥大期のみ） */}
        {showCrackRisk && (
          <AIAdviceCard risk={crackRisk} field={selectedField} />
        )}

        {/* 農家ナレッジルール */}
        <KnowledgeCard
          fieldId={selectedFieldId}
          fieldName={selectedField?.name ?? ''}
          rules={rules}
          onAdd={isAdmin ? addRule : undefined}
          onToggle={isAdmin ? toggleRule : undefined}
          onDelete={isAdmin ? deleteRule : undefined}
        />

        {/* Forecast table */}
        <ForecastTable forecast={correctedForecast} />

        {/* Precipitation chart */}
        <PrecipitationChart past14={past14} correctedPast14={correctedPast14Final} />

        {loading && (
          <div className="text-center text-sm text-gray-400 py-2">データ更新中...</div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 mt-4 border-t relative">
        {isAdmin && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="absolute left-4 bottom-6 flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
          >
            ⚙️ 補正パラメータ設定
          </button>
        )}
        <button
          onClick={() => setRole(isAdmin ? '従業員' : '管理者')}
          className={`absolute right-4 bottom-6 flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors
            ${isAdmin
              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
        >
          {isAdmin ? '🔑 管理者' : '👤 従業員'}
        </button>
        © 2025 株式会社ラファティリティ | 圃場単位気象AI補正ダッシュボード v1.3<br />
        広島県庄原市総領町中領家178
      </footer>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        params={params}
        onSave={updateParams}
        onReset={resetParams}
        fieldName={selectedField?.name}
      />

      <FieldRegistrationModal
        open={fieldModalOpen}
        onClose={() => setFieldModalOpen(false)}
        onSave={(fieldData) => {
          const newField = addField(fieldData);
          setSelectedFieldId(newField.id);
        }}
      />

      <PrintReportModal
        open={printReportOpen}
        onClose={() => setPrintReportOpen(false)}
        fieldName={selectedField?.name ?? ''}
        location={selectedField?.location ?? ''}
        crop={selectedField?.crop ?? ''}
        floweringDate={floweringDate}
        past14={past14}
        forecast={correctedForecast}
        lastYearData={lastYearData}
      />
    </div>
  );
}

export default App;
