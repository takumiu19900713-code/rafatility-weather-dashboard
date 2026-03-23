import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    icon: '🗺️',
    title: '圃場マップ・選択',
    body: '画面上部のボタンで圃場を切り替えます。マップはGoogleマップと連動しており、タップすると現地の地図を確認できます。',
  },
  {
    icon: '🌤️',
    title: '今日の気象サマリー',
    body: '選択中の圃場の今日の気象（最高・最低気温・降水量・湿度）をAI補正した値で表示します。標高や斜面方向による微気候を反映しています。',
  },
  {
    icon: '⚠️',
    title: '裂果リスクゲージ',
    body: '果実の肥大期・梅雨期に表示されます。過去14日の降水パターンと今後7日の予報から、裂果が起きやすい状況かをスコアで示します。赤に近いほど注意が必要です。',
  },
  {
    icon: '🌧️',
    title: '雨ナウキャスト',
    body: '今後数時間の降水予測をリアルタイムで表示します。圃場作業のタイミング判断にご活用ください（冬季は非表示）。',
  },
  {
    icon: '💧',
    title: '散水管理アドバイス',
    body: '蒸発散量（ET0）と降水量のバランスから、今日の推奨散水量を算出します。梅雨期・収穫期に表示。雨が降っても土壌が乾く場合があるため、累積水分収支グラフで確認してください。',
  },
  {
    icon: '🌡️',
    title: '積算温度グラフ',
    body: '開花日からの積算温度（基準温度10℃）を表示します。昨年との比較や出荷予測日の目安として利用できます。梅雨期・収穫期に表示。',
  },
  {
    icon: '📦',
    title: '出荷予測',
    body: '積算温度の目標値（品種別）から出荷予測日を自動計算します。青果会社・製菓会社への提出用PDFもここから出力できます（管理者のみ）。',
  },
  {
    icon: '📋',
    title: '7日間予報テーブル',
    body: '圃場補正済みの気温・降水量を一覧で確認できます。圃場ごとに標高や向きによる補正が適用されています。',
  },
  {
    icon: '📚',
    title: 'ナレッジ管理',
    body: '管理者は圃場固有のルール（例: 〇〇圃場は南斜面で乾きやすい）を登録できます。蓄積した知識が裂果リスク計算に反映されます。',
  },
  {
    icon: '🔑',
    title: '管理者設定',
    body: '画面下部の「管理者設定」から季節フェーズ・生育ステージ・開花日を設定できます。フェーズを切り替えると表示されるカードが変わります。',
  },
];

export const HelpModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">📖 使い方ガイド</h2>
            <p className="text-xs text-gray-400">ラファティリティ 気象AIシステム</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* 導入説明 */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
            <p className="font-bold mb-1">このアプリについて</p>
            <p>圃場ごとの標高・斜面方向をもとにAIが気象データを補正し、裂果リスクや散水管理・出荷予測をサポートするシステムです。</p>
          </div>
        </div>

        {/* 各機能説明 */}
        <div className="px-5 py-3 space-y-3 pb-6">
          {sections.map((s) => (
            <div key={s.title} className="flex gap-3 border-b border-gray-100 pb-3">
              <span className="text-2xl shrink-0">{s.icon}</span>
              <div>
                <p className="font-bold text-sm text-gray-700">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.body}</p>
              </div>
            </div>
          ))}

          {/* ログインID案内 */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
            <p className="font-bold text-gray-600 mb-2">ログインID（プロトタイプ用）</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-gray-400">管理者</span>
              <span className="font-mono">admin / rafatility2025</span>
              <span className="text-gray-400">スタッフA</span>
              <span className="font-mono">staff1 / grape2025</span>
              <span className="text-gray-400">スタッフB</span>
              <span className="font-mono">staff2 / grape2025</span>
            </div>
            <p className="mt-2 text-gray-400">※ 正式運用時は個人IDに変更予定</p>
          </div>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t px-5 py-4">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white rounded-xl py-2 text-sm font-bold hover:bg-green-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
