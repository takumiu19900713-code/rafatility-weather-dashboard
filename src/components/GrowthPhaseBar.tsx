import type { FruitStage, GrowthPhase, UserRole } from '../types';

const PHASES: GrowthPhase[] = ['冬季', '春季', '梅雨期', '収穫期'];
const PHASE_EMOJI: Record<GrowthPhase, string> = {
  冬季: '❄️', 春季: '🌸', 梅雨期: '🌧️', 収穫期: '🍇',
};
const STAGES: FruitStage[] = ['開花前', '開花〜着果', '肥大期', '収穫期'];
const STAGE_COLOR: Record<FruitStage, string> = {
  '開花前':     'bg-blue-100 text-blue-700 border-blue-300',
  '開花〜着果': 'bg-orange-100 text-orange-700 border-orange-300',
  '肥大期':     'bg-red-100 text-red-700 border-red-300',
  '収穫期':     'bg-green-100 text-green-700 border-green-300',
};
const STAGE_COEFF_LABEL: Record<FruitStage, string> = {
  '開花前':     '×0.5',
  '開花〜着果': '×1.0',
  '肥大期':     '×1.5',
  '収穫期':     '×1.2',
};

interface Props {
  phase: GrowthPhase;
  fruitStage: FruitStage;
  floweringDate: string;
  role: UserRole;
  onPhaseChange: (p: GrowthPhase) => void;
  onStageChange: (s: FruitStage) => void;
  onFloweringDateChange: (d: string) => void;
}

export function GrowthPhaseBar({
  phase, fruitStage, floweringDate, role,
  onPhaseChange, onStageChange, onFloweringDateChange,
}: Props) {
  const isAdmin = role === '管理者';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-3">
      {/* 生育フェーズタブ */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5 font-medium">🌱 生育フェーズ</p>
        <div className="flex gap-2 flex-wrap">
          {PHASES.map((p) => (
            <button
              key={p}
              onClick={() => isAdmin && onPhaseChange(p)}
              disabled={!isAdmin}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${phase === p
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : isAdmin
                    ? 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400'
                    : 'bg-gray-50 text-gray-400 border-gray-100 cursor-default'
                }`}
            >
              {PHASE_EMOJI[p]} {p}
            </button>
          ))}
          {!isAdmin && (
            <span className="text-xs text-gray-400 self-center ml-1">（管理者のみ変更可）</span>
          )}
        </div>
      </div>

      {/* 着果ステージ + 開花日入力 */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">🍇 着果ステージ（裂果リスク係数）</p>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => isAdmin && onStageChange(s)}
                disabled={!isAdmin}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                  ${fruitStage === s
                    ? `${STAGE_COLOR[s]} shadow-sm ring-1 ring-current`
                    : isAdmin
                      ? 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-default'
                  }`}
              >
                {s}
                <span className="ml-1 font-bold">{STAGE_COEFF_LABEL[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 開花日入力（管理者のみ） */}
        {isAdmin && (
          <div className="shrink-0">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">📅 開花日</p>
            <input
              type="date"
              value={floweringDate}
              onChange={(e) => onFloweringDateChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
