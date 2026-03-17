import React, { useState } from 'react';
import type { Field } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (field: Omit<Field, 'id' | 'isCustom'>) => void;
}

const ASPECT_OPTIONS: { value: Field['aspect']; label: string }[] = [
  { value: 'south',     label: '南向き（日射最大・+0.8℃）' },
  { value: 'southwest', label: '南西向き（午後日射・+0.6℃）' },
  { value: 'east',      label: '東向き（午前日射・+0.3℃）' },
  { value: 'north',     label: '北向き（日射少・-0.5℃）' },
  { value: 'other',     label: 'その他・平坦（補正なし）' },
];

const CROP_OPTIONS = [
  'ピオーネ', 'シャインマスカット', 'ニューベリーA', '安芸クイーン',
  '巨峰', 'デラウェア', '藤稔', 'マスカットベーリーA', '瀬戸ジャイアンツ', 'その他',
];

type Step = 'address' | 'confirm' | 'details';

interface GeoResult {
  name: string;
  lat: number;
  lon: number;
  elevation: number;
}

export const FieldRegistrationModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [geoError, setGeoError] = useState('');

  const [form, setForm] = useState({
    name: '',
    aspect: 'south' as Field['aspect'],
    crop: 'ピオーネ',
    area: '',
    manager: '',
  });

  if (!open) return null;

  const handleGeocode = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    setGeoError('');
    try {
      // Step 1: Nominatim (OpenStreetMap) で日本語住所を検索
      const nominatimRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=ja&countrycodes=jp`,
        { headers: { 'Accept-Language': 'ja' } }
      );
      const nominatimData = await nominatimRes.json();
      if (!nominatimData.length) throw new Error('住所が見つかりませんでした。もう少し広い範囲（市区町村名）で試してください。');
      const r = nominatimData[0];
      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);

      // Step 2: Open-Meteo Elevation APIで標高取得
      const elevRes = await fetch(
        `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`
      );
      const elevData = await elevRes.json();
      const elevation = Math.round(elevData.elevation?.[0] ?? 0);

      const locationName = r.display_name.split(',').slice(0, 3).join(' ').trim();
      setGeoResult({ name: locationName, lat, lon, elevation });
      setForm(f => ({ ...f, name: r.display_name.split(',')[0].trim() }));
      setStep('confirm');
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = () => {
    if (!geoResult) return;
    onSave({
      name: form.name || geoResult.name,
      lat: geoResult.lat,
      lon: geoResult.lon,
      elevation: geoResult.elevation,
      aspect: form.aspect,
      location: geoResult.name,
      crop: form.crop,
      area: form.area ? parseFloat(form.area) : undefined,
      manager: form.manager || undefined,
    });
    // Reset
    setStep('address');
    setAddress('');
    setGeoResult(null);
    setForm({ name: '', aspect: 'south', crop: 'ピオーネ', area: '', manager: '' });
    onClose();
  };

  const handleClose = () => {
    setStep('address');
    setAddress('');
    setGeoResult(null);
    setGeoError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={handleClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">🌿 圃場を追加</h2>
            <p className="text-xs text-gray-400">
              {step === 'address' && '住所を入力して座標・標高を自動取得'}
              {step === 'confirm' && '取得結果を確認してください'}
              {step === 'details' && '圃場の詳細情報を入力'}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="px-5 py-5 space-y-4">

          {/* Step 1: Address */}
          {step === 'address' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所・地名を入力</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGeocode()}
                    placeholder="例: 庄原市総領町、三次市、新潟市南区"
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleGeocode}
                    disabled={geocoding || !address.trim()}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-primary-hover"
                  >
                    {geocoding ? '検索中...' : '検索'}
                  </button>
                </div>
                {geoError && <p className="text-red-500 text-xs mt-1">{geoError}</p>}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1">
                <p className="font-bold">🤖 自動取得される情報</p>
                <p>✅ 緯度・経度 — OpenStreetMap Nominatim（日本語住所対応）</p>
                <p>✅ 標高 — Open-Meteo Elevation API（国土地理院DEM準拠）</p>
                <p>⚙️ 斜面方向 — 次のステップで選択（農研機構標準補正値を適用）</p>
              </div>
            </>
          )}

          {/* Step 2: Confirm geo */}
          {step === 'confirm' && geoResult && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-green-700">✅ 取得完了</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-gray-400">地点名</p>
                    <p className="font-bold text-gray-800">{geoResult.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-gray-400">標高（自動取得）</p>
                    <p className="font-bold text-gray-800">{geoResult.elevation} m</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-gray-400">緯度</p>
                    <p className="font-bold text-gray-800">{geoResult.lat.toFixed(5)}°N</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-gray-400">経度</p>
                    <p className="font-bold text-gray-800">{geoResult.lon.toFixed(5)}°E</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <p className="font-bold mb-1">🏔️ 斜面方向について</p>
                <p>国土地理院DEMからの自動取得は高精度解析が必要なため、次のステップで手動選択してください。Googleマップの航空写真で圃場の向きをご確認ください。</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">
                  ← 住所を修正
                </button>
                <button onClick={() => setStep('details')} className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-bold hover:bg-primary-hover">
                  詳細情報を入力 →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">圃場名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="例: 第1圃場"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">斜面方向 * <span className="text-gray-400">（AI気温補正に影響）</span></label>
                  <select
                    value={form.aspect}
                    onChange={e => setForm(f => ({ ...f, aspect: e.target.value as Field['aspect'] }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {ASPECT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ぶどう品種</label>
                  <select
                    value={form.crop}
                    onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">栽培面積 (a)</label>
                    <input
                      type="number"
                      value={form.area}
                      onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                      placeholder="例: 10"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">管理担当者</label>
                    <input
                      type="text"
                      value={form.manager}
                      onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}
                      placeholder="例: 山田"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {geoResult && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <p className="font-bold text-gray-600">📍 登録される情報</p>
                  <p>標高: {geoResult.elevation}m ／ 緯度: {geoResult.lat.toFixed(4)} ／ 経度: {geoResult.lon.toFixed(4)}</p>
                  <p>補正: 農研機構標準値ベース（設定パネルで変更可）</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('confirm')} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">
                  ← 戻る
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim()}
                  className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-bold disabled:opacity-50 hover:bg-primary-hover"
                >
                  🌿 圃場を登録
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
