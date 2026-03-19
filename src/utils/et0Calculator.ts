// FAO-56 Hargreaves-Samani法による参照蒸発散量（ET0）計算
// 単位: mm/day

// ぶどうの生育ステージ別作物係数（Kc）
export const GRAPE_KC: Record<string, number> = {
  '開花前':     0.30,
  '開花〜着果': 0.60,
  '肥大期':     0.85,
  '収穫期':     0.70,
};

// 栽培形態による係数（ハウス内は太陽放射・風が減少）
export const ROOF_ET0_FACTOR: Record<string, number> = {
  'open':            1.0,
  'unheated_house':  0.70,
  'heated_house':    0.65,
};

function getDayOfYear(dateStr: string): number {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

/**
 * ET0計算（Hargreaves-Samani法）
 * @param lat  緯度（度）
 * @param date 日付 YYYY-MM-DD
 * @param tempMax 最高気温（℃）
 * @param tempMin 最低気温（℃）
 * @returns ET0 (mm/day)
 */
export function calcET0(
  lat: number,
  date: string,
  tempMax: number,
  tempMin: number
): number {
  const doy = getDayOfYear(date);
  const phi = (lat * Math.PI) / 180;

  // 地球-太陽間距離の逆数の二乗（dr）
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * doy) / 365);
  // 太陽赤緯（δ）
  const delta = 0.409 * Math.sin((2 * Math.PI * doy) / 365 - 1.39);
  // 日没時角（ωs）
  const ws = Math.acos(-Math.tan(phi) * Math.tan(delta));
  // 大気外日射量（Ra, MJ/m²/day）
  const Gsc = 0.082; // 太陽定数 MJ/m²/min
  const Ra =
    ((24 * 60) / Math.PI) *
    Gsc *
    dr *
    (ws * Math.sin(phi) * Math.sin(delta) +
      Math.cos(phi) * Math.cos(delta) * Math.sin(ws));

  const Tmean = (tempMax + tempMin) / 2;
  const TD = Math.max(0, tempMax - tempMin);
  // Hargreaves-Samani式
  const ET0 = 0.0023 * (Tmean + 17.8) * Math.sqrt(TD) * Ra;

  return Math.max(0, Math.round(ET0 * 10) / 10);
}

/**
 * 作物蒸散量（ETc）= ET0 × Kc × 栽培形態係数
 */
export function calcETc(
  et0: number,
  fruitStage: string,
  roofType: string
): number {
  const kc = GRAPE_KC[fruitStage] ?? 0.7;
  const roofFactor = ROOF_ET0_FACTOR[roofType] ?? 1.0;
  return Math.max(0, Math.round(et0 * kc * roofFactor * 10) / 10);
}

/**
 * 散水量の推奨値 = max(0, ETc - 降水量)
 */
export function calcIrrigationNeed(etC: number, precipitation: number): number {
  return Math.max(0, Math.round((etC - precipitation) * 10) / 10);
}
