import { useState, useMemo } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { HelpModal } from './components/HelpModal';
import { ManualModal } from './components/ManualModal';
import { BottomNav } from './components/BottomNav';
import type { AppTab } from './components/BottomNav';
import { HeroWeatherCard } from './components/HeroWeatherCard';
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
import { ShipmentForecastCard } from './components/ShipmentForecastCard';
import { AccumulatedTempCard } from './components/AccumulatedTempCard';
import { AccumulatedSunshineCard } from './components/AccumulatedSunshineCard';
import { PrintReportModal } from './components/PrintReportModal';
import { IrrigationAdviceCard } from './components/IrrigationAdviceCard';
import { useWeatherData } from './hooks/useWeatherData';
import { useWeatherCorrection } from './hooks/useWeatherCorrection';
import { useWorkLog } from './hooks/useWorkLog';
import { useCorrectionParams } from './hooks/useCorrectionParams';
import { useFields } from './hooks/useFields';
import { useKnowledge } from './hooks/useKnowledge';
import { useGrowthPhase } from './hooks/useGrowthPhase';
import { useAuth } from './hooks/useAuth';
import type { AuthUser } from './hooks/useAuth';
import { useHistoricalWeather } from './hooks/useHistoricalWeather';
import { calcCrackRisk } from './utils/crackRiskCalculator';
import { applyWeatherCorrection } from './utils/weatherCorrection';

function App() {
  const { user, login, logout } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);
  if (!user) return <LoginScreen login={login} />;
  return <Dashboard user={user} onLogout={logout} onHelp={() => setHelpOpen(true)} helpOpen={helpOpen} onHelpClose={() => setHelpOpen(false)} />;
}

function Dashboard({ user, onLogout, onHelp, helpOpen, onHelpClose }: {
  user: AuthUser; onLogout: () => void; onHelp: () => void; helpOpen: boolean; onHelpClose: () => void;
}) {
  const isAdmin = user.role === '管理者';
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const { fields, addField, deleteField, updateField } = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id ?? 'F001');
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [printReportOpen, setPrintReportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { params, updateParams, resetParams } = useCorrectionParams(selectedFieldId);
  const { rules, addRule, toggleRule, deleteRule } = useKnowledge();
  const { phase, fruitStage, floweringDate, setPhase, setFruitStage, setFloweringDate } = useGrowthPhase(selectedFieldId);

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const { forecast, past14, hourly, minutely, loading, error, lastUpdated, refetch } = useWeatherData(
    selectedField?.lat ?? fields[0]?.lat ?? 34.92,
    selectedField?.lon ?? fields[0]?.lon ?? 133.05,
    selectedFieldId
  );

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
      past14, roofType: selectedField?.roofType ?? 'open',
      fieldId: selectedFieldId, knowledgeRules: rules,
      humidityMax: today?.humidityMax ?? 0, fruitStage,
    });
  }, [correctedForecast, past14, selectedField, selectedFieldId, rules, today, fruitStage]);

  useWorkLog(selectedFieldId, crackRisk?.score ?? 0, today);

  const correctedPast14Final = useMemo(() => {
    if (!selectedField || past14.length === 0) return [];
    return past14.map((w) => applyWeatherCorrection(w, selectedField, params));
  }, [past14, selectedField, params]);

  const frostAlertDay = phase === '春季'
    ? correctedForecast.slice(0, 7).find((d) => d.correctedTempMin <= 3)
    : null;
  const showCrackRisk = fruitStage === '肥大期' || phase === '梅雨期';
  const showIrrigation = phase === '梅雨期' || phase === '収穫期';
  const showAccumulated = (phase === '梅雨期' || phase === '収穫期') && !!floweringDate;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ─── コンパクトヘッダー ─── */}
      <header className="bg-green-700 text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍇</span>
          <div>
            <p className="font-bold text-sm leading-tight">ラファティリティ 気象AI</p>
            <p className="text-green-200 text-[10px]">{user.name} · {user.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <span className="text-green-300 text-xs">更新中…</span>}
          <button onClick={onHelp}
            className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full hover:bg-white/30">
            ❓
          </button>
          <button onClick={() => setManualOpen(true)}
            className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full hover:bg-white/30">
            📄
          </button>
        </div>
      </header>

      {/* ─── エラーバナー ─── */}
      {error && (
        <div className="mx-4 mt-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">
          ⚠️ {error}（キャッシュデータ表示中）
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/*              ホーム タブ               */}
      {/* ══════════════════════════════════════ */}
      {activeTab === 'home' && (
        <div>
          {/* ヒーローカード */}
          <HeroWeatherCard
            today={today}
            field={selectedField}
            phase={phase}
            fruitStage={fruitStage}
            onRefresh={refetch}
            loading={loading}
            lastUpdated={lastUpdated}
          />

          {/* クイックアクション */}
          <div className="mx-4 mt-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex justify-around">
                {[
                  { icon: '🔄', label: '更新', action: () => refetch(), badge: null },
                  { icon: '📍', label: '圃場', action: () => setActiveTab('field'), badge: null },
                  { icon: '⚠️', label: 'リスク', action: () => setActiveTab('home'), badge: crackRisk ? crackRisk.level === 'high' ? '高' : crackRisk.level === 'medium' ? '中' : null : null },
                  { icon: '📊', label: 'データ', action: () => setActiveTab('data'), badge: null },
                  { icon: '⚙️', label: '設定', action: () => isAdmin ? setSettingsOpen(true) : null, badge: null },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    className="flex flex-col items-center gap-1.5 relative">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-2xl hover:bg-green-100 transition active:scale-95">
                      {item.icon}
                    </div>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500 font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 霜アラート */}
          {frostAlertDay && (
            <div className="mx-4 mt-3 bg-blue-50 border border-blue-300 text-blue-800 rounded-xl p-3 text-sm font-medium">
              🌡️ 霜注意：{frostAlertDay.date} 最低 <strong>{frostAlertDay.correctedTempMin.toFixed(1)}℃</strong> の予報。新芽・花芽に注意。
            </div>
          )}

          {/* 裂果リスクゲージ（ホームに表示） */}
          {showCrackRisk && crackRisk && (
            <div className="mx-4 mt-3">
              <CrackRiskGauge risk={crackRisk} fruitStage={fruitStage} />
            </div>
          )}

          {/* 散水アドバイス（重要）*/}
          {showIrrigation && (
            <div className="mx-4 mt-3">
              <IrrigationAdviceCard
                lat={selectedField?.lat ?? 34.92}
                past14={past14}
                forecast={correctedForecast}
                fruitStage={fruitStage}
                roofType={selectedField?.roofType ?? 'open'}
                fieldName={selectedField?.name ?? ''}
              />
            </div>
          )}

          {/* AIアドバイス */}
          {showCrackRisk && (
            <div className="mx-4 mt-3">
              <AIAdviceCard risk={crackRisk} field={selectedField} />
            </div>
          )}

          {/* フッター */}
          <div className="mx-4 mt-4 pb-2 text-center text-[10px] text-gray-300">
            © 2026 株式会社ラファティリティ v1.5
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/*              圃場 タブ                */}
      {/* ══════════════════════════════════════ */}
      {activeTab === 'field' && (
        <div className="px-4 pt-3 space-y-3">
          <FieldSelector
            fields={fields}
            selectedId={selectedFieldId}
            onSelect={setSelectedFieldId}
            onAddField={() => setFieldModalOpen(true)}
            onDeleteField={deleteField}
            onUpdateRoofType={(id, roofType) => updateField(id, { roofType })}
          />
          <FieldMap fields={fields} selectedField={selectedField} onSelectField={setSelectedFieldId} />

          {/* 圃場詳細カード */}
          {selectedField && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-700 mb-3">📋 圃場情報</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['品種', selectedField.crop ?? '未設定'],
                  ['場所', selectedField.location],
                  ['栽培形態', selectedField.roofType === 'open' ? '露地' : selectedField.roofType === 'unheated_house' ? '無加温ハウス' : '加温ハウス'],
                  ['標高', `${selectedField.elevation}m`],
                  ['面積', selectedField.area ? `${selectedField.area}a` : '未設定'],
                  ['管理者', selectedField.manager ?? '未設定'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-50 pb-1">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-gray-700 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/*              気象 タブ                */}
      {/* ══════════════════════════════════════ */}
      {activeTab === 'weather' && (
        <div className="px-4 pt-3 space-y-3">
          <WeatherSummaryCard today={today} fieldName={selectedField?.name ?? ''} />
          {phase !== '冬季' && <RainNowcastCard hourly={hourly} minutely={minutely} />}
          <ForecastTable forecast={correctedForecast} />
          <PrecipitationChart past14={past14} correctedPast14={correctedPast14Final} />
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/*              データ タブ              */}
      {/* ══════════════════════════════════════ */}
      {activeTab === 'data' && (
        <div className="px-4 pt-3 space-y-3">
          {showAccumulated ? (
            <>
              <AccumulatedTempCard
                floweringDate={floweringDate}
                crop={selectedField?.crop ?? ''}
                past14={past14}
                forecast={correctedForecast}
                lastYearData={lastYearData}
                lastYearLoading={lastYearLoading}
                fieldName={selectedField?.name ?? ''}
              />
              <AccumulatedSunshineCard
                startDate={floweringDate}
                past14={past14}
                forecast={correctedForecast}
                lastYearData={lastYearData}
                lastYearLoading={lastYearLoading}
                fieldName={selectedField?.name ?? ''}
              />
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-400">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm">梅雨期または収穫期に切り替えると<br />積算温度・日照時間グラフが表示されます</p>
              <p className="text-xs mt-1 text-gray-300">管理者設定 → 生育管理 から設定</p>
            </div>
          )}
          {phase === '収穫期' && (
            <ShipmentForecastCard
              fieldName={selectedField?.name ?? ''}
              crop={selectedField?.crop ?? ''}
              floweringDate={floweringDate}
              past14={past14}
              forecast={correctedForecast}
              crackRiskScore={crackRisk?.score ?? 0}
              role={user.role}
            />
          )}
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/*              設定 タブ               */}
      {/* ══════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="px-4 pt-3 space-y-3">

          {/* ユーザー情報カード */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
                {user.role === '管理者' ? '🔑' : '👤'}
              </div>
              <div>
                <p className="font-bold text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role} · ID: {user.id}</p>
              </div>
            </div>
            <button onClick={onLogout}
              className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50">
              ログアウト
            </button>
          </div>

          {/* 管理者専用ボタン群 */}
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
              <p className="text-xs text-gray-400 font-medium mb-3">管理者メニュー</p>
              {[
                { icon: '🌱', label: '生育フェーズ・ステージ設定', sub: `現在: ${phase} · ${fruitStage}`, action: () => setSettingsOpen(true) },
                { icon: '📄', label: 'PDF出荷予測レポート', sub: '青果会社提出用', action: () => setPrintReportOpen(true) },
                { icon: '📄', label: '取扱説明書', sub: 'プロトタイプ v1.5', action: () => setManualOpen(true) },
              ].map((item) => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition text-left active:scale-98">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <span className="ml-auto text-gray-300">›</span>
                </button>
              ))}
            </div>
          )}

          {/* ナレッジ管理 */}
          <KnowledgeCard
            fieldId={selectedFieldId}
            fieldName={selectedField?.name ?? ''}
            rules={rules}
            onAdd={isAdmin ? addRule : undefined}
            onToggle={isAdmin ? toggleRule : undefined}
            onDelete={isAdmin ? deleteRule : undefined}
          />

          {!isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <button onClick={() => setManualOpen(true)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-green-50 transition text-left">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">取扱説明書</p>
                  <p className="text-xs text-gray-400">プロトタイプ v1.5</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── ボトムナビゲーション ─── */}
      <BottomNav active={activeTab} onChange={setActiveTab} isAdmin={isAdmin} />

      {/* ─── モーダル群 ─── */}
      <HelpModal open={helpOpen} onClose={onHelpClose} />
      <ManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        params={params}
        onSave={updateParams}
        onReset={resetParams}
        fieldName={selectedField?.name}
        phase={phase}
        fruitStage={fruitStage}
        floweringDate={floweringDate}
        onPhaseChange={setPhase}
        onStageChange={setFruitStage}
        onFloweringDateChange={setFloweringDate}
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
