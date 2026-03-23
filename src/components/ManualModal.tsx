import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #manual-overlay { display: block !important; position: static !important; background: white !important; }
          #manual-overlay .no-print { display: none !important; }
          #manual-overlay .print-content { box-shadow: none !important; max-width: 100% !important; }
        }
      `}</style>

      <div
        id="manual-overlay"
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="print-content bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4">

          {/* 操作ボタン */}
          <div className="no-print flex items-center justify-between px-6 py-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
            <span className="text-sm text-gray-500 font-medium">📄 取扱説明書</span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700"
              >
                🖨️ PDF印刷
              </button>
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>

          <div className="p-8 text-gray-800">

            {/* 表紙 */}
            <div className="text-center border-b-2 border-green-600 pb-6 mb-8">
              <div className="text-5xl mb-3">🍇</div>
              <p className="text-xs text-gray-400 tracking-widest mb-1">株式会社ラファティリティ</p>
              <h1 className="text-2xl font-bold text-gray-900">圃場単位 気象AIシステム</h1>
              <p className="text-sm text-green-700 font-medium mt-1">取扱説明書 v1.5（プロトタイプ版）</p>
              <p className="text-xs text-gray-400 mt-2">作成日: {today}</p>
            </div>

            {/* 目次 */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">目次</h2>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>このシステムについて</li>
                <li>ログイン方法</li>
                <li>基本的な使い方（画面の見方）</li>
                <li>機能一覧（現在できること）</li>
                <li>生育フェーズ別の活用方法</li>
                <li>管理者向け機能</li>
                <li>今後追加予定の機能（ロードマップ）</li>
              </ol>
            </section>

            {/* 1. このシステムについて */}
            <section className="mb-8">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                1. このシステムについて
              </h2>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  本システムは、ぶどう農家の生産管理を気象データとAI補正によってサポートするツールです。
                  気象庁APIをもとに、<strong>圃場ごとの標高・斜面方向・栽培形態（露地・ハウス）</strong>を反映した
                  気象補正を行い、より精度の高い現場向け情報を提供します。
                </p>
                <ul className="mt-3 space-y-1 list-disc list-inside text-xs text-gray-600">
                  <li>スマートフォン・タブレット・PCから利用可能</li>
                  <li>インターネット接続があればどこでも閲覧可能</li>
                  <li>データは最新の気象APIから自動取得・更新</li>
                  <li>管理者と現場スタッフで表示内容を分けて管理</li>
                </ul>
              </div>
            </section>

            {/* 2. ログイン方法 */}
            <section className="mb-8">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                2. ログイン方法
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                アプリを開くとログイン画面が表示されます。以下のIDとパスワードを入力してください。
              </p>
              <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-green-50">
                  <tr>
                    <th className="py-2 px-4 text-left font-medium text-gray-600 border-b border-gray-200">ログインID</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-600 border-b border-gray-200">パスワード</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-600 border-b border-gray-200">権限</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-600 border-b border-gray-200">用途</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['admin',  'rafatility2025', '管理者', '農場オーナー・責任者用'],
                    ['staff1', 'grape2025',      '従業員', '圃場スタッフA用'],
                    ['staff2', 'grape2025',      '従業員', '圃場スタッフB用'],
                  ].map(([id, pw, role, note]) => (
                    <tr key={id} className="border-t border-gray-100">
                      <td className="py-2 px-4 font-mono text-blue-700">{id}</td>
                      <td className="py-2 px-4 font-mono">{pw}</td>
                      <td className="py-2 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${role === '管理者' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {role}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-xs text-gray-500">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">※ 本番運用時は個人IDに変更予定</p>
            </section>

            {/* 3. 基本的な使い方 */}
            <section className="mb-8">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                3. 基本的な使い方（画面の見方）
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3 border-b border-gray-100 pb-3">
                  <span className="text-lg shrink-0">①</span>
                  <div>
                    <p className="font-bold">圃場を選ぶ</p>
                    <p className="text-xs text-gray-500 mt-0.5">画面上部の圃場選択ボタンをタップして、確認したい圃場を選択します。マップも連動して切り替わります。</p>
                  </div>
                </div>
                <div className="flex gap-3 border-b border-gray-100 pb-3">
                  <span className="text-lg shrink-0">②</span>
                  <div>
                    <p className="font-bold">今日の気象を確認する</p>
                    <p className="text-xs text-gray-500 mt-0.5">選択した圃場の今日の最高・最低気温、降水量、湿度が補正値で表示されます。標高や斜面の影響が反映されています。</p>
                  </div>
                </div>
                <div className="flex gap-3 border-b border-gray-100 pb-3">
                  <span className="text-lg shrink-0">③</span>
                  <div>
                    <p className="font-bold">リスクやアドバイスを確認する</p>
                    <p className="text-xs text-gray-500 mt-0.5">生育フェーズに応じて、裂果リスク・散水アドバイス・積算温度・出荷予測などのカードが自動表示されます。</p>
                  </div>
                </div>
                <div className="flex gap-3 pb-3">
                  <span className="text-lg shrink-0">④</span>
                  <div>
                    <p className="font-bold">7日間予報を確認する</p>
                    <p className="text-xs text-gray-500 mt-0.5">画面下部に7日間の気温・降水量の予報表があります。作業計画の参考にご利用ください。</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. 機能一覧 */}
            <section className="mb-8">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                4. 機能一覧（現在できること）
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-3 text-left font-medium text-gray-600 w-10">#</th>
                    <th className="py-2 px-3 text-left font-medium text-gray-600">機能</th>
                    <th className="py-2 px-3 text-left font-medium text-gray-600">内容</th>
                    <th className="py-2 px-3 text-center font-medium text-gray-600">表示条件</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1',  '🔐 ログイン認証',      'ID・パスワードによる認証。管理者/スタッフで表示内容を制御', '常時'],
                    ['2',  '🗺️ 圃場マップ',         'Googleマップで圃場の位置を確認。複数圃場を切り替え可能', '常時'],
                    ['3',  '🌤️ 気象サマリー',       '今日の気温・降水量・湿度。標高・斜面補正済み', '常時'],
                    ['4',  '⚠️ 裂果リスクゲージ',  '過去14日＋今後7日の降水パターンから裂果リスクをスコア化', '肥大期・梅雨期'],
                    ['5',  '🌧️ 雨ナウキャスト',    '今後数時間の降水予測（1時間・15分単位）', '冬季以外'],
                    ['6',  '💧 散水管理アドバイス', 'ET0（蒸発散量）計算による推奨散水量。14日間の水分収支グラフ', '梅雨期・収穫期'],
                    ['7',  '🌡️ 積算温度グラフ',    '開花日からの積算温度。昨年同期比較。出荷予測日の算出', '梅雨期・収穫期'],
                    ['8',  '📦 出荷予測カード',     '品種別GDD目標から出荷予測日を自動計算', '収穫期'],
                    ['9',  '📋 7日間予報テーブル',  '圃場補正済みの気温・降水量一覧', '常時'],
                    ['10', '📊 降水量グラフ',       '過去14日の補正前後の降水量比較', '常時'],
                    ['11', '📚 ナレッジ管理',       '農家固有のルール登録。裂果リスク計算に反映', '常時（編集は管理者のみ）'],
                    ['12', '📄 PDF出荷予測レポート','青果会社提出用PDF。積算温度・出荷予測日・昨年比較', '収穫期・梅雨期（管理者のみ）'],
                    ['13', '⚙️ 管理者設定',        '生育フェーズ・ステージ・開花日・気象補正パラメータの設定', '管理者のみ'],
                  ].map(([num, name, desc, condition]) => (
                    <tr key={num} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-400">{num}</td>
                      <td className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">{name}</td>
                      <td className="py-2 px-3 text-gray-500 leading-relaxed">{desc}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded whitespace-nowrap">{condition}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 5. 生育フェーズ別活用法 */}
            <section className="mb-8">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                5. 生育フェーズ別の活用方法
              </h2>
              <p className="text-xs text-gray-500 mb-3">管理者設定から季節フェーズを切り替えると、画面に表示されるカードが自動的に変わります。</p>
              <div className="space-y-3">
                {[
                  {
                    phase: '❄️ 冬季（12〜2月）',
                    color: 'bg-blue-50 border-blue-200',
                    items: ['7日間予報で降雪・霜を確認', '剪定作業のタイミング把握', '圃場設定・補正パラメータの見直し'],
                  },
                  {
                    phase: '🌸 春季（3〜5月）',
                    color: 'bg-pink-50 border-pink-200',
                    items: ['霜注意アラート（最低気温3℃以下で警告）', '萌芽・開花のタイミング記録', '開花日を設定パネルに入力'],
                  },
                  {
                    phase: '🌧️ 梅雨期（6〜7月）',
                    color: 'bg-indigo-50 border-indigo-200',
                    items: ['裂果リスクゲージで毎日リスクを確認', '散水管理カードで水分過多・不足を管理', '雨ナウキャストで作業タイミングを判断', '積算温度グラフで生育進度を確認'],
                  },
                  {
                    phase: '🍇 収穫期（8〜9月）',
                    color: 'bg-purple-50 border-purple-200',
                    items: ['出荷予測カードで出荷日を管理', 'PDF出力で青果会社に報告', '散水管理で糖度アップをサポート', '積算温度の昨年比較で収穫量を予測'],
                  },
                ].map((p) => (
                  <div key={p.phase} className={`rounded-xl border p-3 ${p.color}`}>
                    <p className="font-bold text-sm mb-2">{p.phase}</p>
                    <ul className="text-xs space-y-1 list-disc list-inside text-gray-600">
                      {p.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. 管理者向け機能 */}
            <section className="mb-8">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                6. 管理者向け機能
              </h2>
              <div className="space-y-3 text-sm">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-gray-700 mb-1">🌱 生育管理（管理者設定 → 生育管理タブ）</p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>季節フェーズを切り替えると表示カードが変わります</li>
                    <li>果実の生育ステージを設定すると裂果リスク計算の精度が上がります</li>
                    <li>開花日を入力すると積算温度グラフと出荷予測日が自動計算されます</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-gray-700 mb-1">⚙️ 気象補正（管理者設定 → 気象補正タブ）</p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>標高気温減率：100m上昇ごとの気温低下（推奨: -0.6℃）</li>
                    <li>斜面方向別の気温・降水補正係数を調整できます</li>
                    <li>農研機構レポートに基づく初期値が設定済みです</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-gray-700 mb-1">📚 ナレッジ管理</p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>農家独自の経験則をテキストルールとして登録できます</li>
                    <li>例:「〇〇圃場は南斜面で乾きやすい」「ハウス内は温度が2℃高い」</li>
                    <li>有効にしたルールは裂果リスク計算に自動反映されます</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-gray-700 mb-1">📄 PDF出荷予測レポート</p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>青果会社提出用のレポートをPDFで出力できます</li>
                    <li>積算温度・出荷予測日・昨年同期比較が1枚にまとまります</li>
                    <li>収穫期・梅雨期に表示される「PDF出力」ボタンから起動</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 7. ロードマップ */}
            <section className="mb-6">
              <h2 className="text-base font-bold text-green-700 border-l-4 border-green-500 pl-2 mb-3">
                7. 今後追加予定の機能（ロードマップ）
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-orange-600 mb-2">▶ Phase 2（2026年秋〜冬・実証実験後）</p>
                  <div className="space-y-2">
                    {[
                      ['📲 LINE通知',          '裂果リスク高・散水アラート・霜注意を自動でLINE通知'],
                      ['🦠 病害リスク計算',    '灰色かび病・べと病・うどんこ病の発生リスクを気温・湿度から算出'],
                      ['📱 個人ID管理',        '複数スタッフそれぞれの個人IDとパスワード設定'],
                      ['📝 作業記録の自動化',  '裂果リスクと連動した作業履歴の自動記録・Excelエクスポート'],
                    ].map(([name, desc]) => (
                      <div key={name as string} className="flex gap-2 text-sm">
                        <span className="text-orange-500 shrink-0">○</span>
                        <div>
                          <span className="font-medium">{name}</span>
                          <span className="text-xs text-gray-500 ml-2">{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-purple-600 mb-2">▶ Phase 3（2026年〜本格運用）</p>
                  <div className="space-y-2">
                    {[
                      ['🤖 気象補正の自動最適化', '実測データ蓄積後にAIが補正パラメータを自動調整'],
                      ['📡 土壌センサー連携',    '土壌水分センサーのデータを取り込み、散水精度を向上'],
                      ['🏭 出荷量予測AI',        '過去の収穫量データとの組み合わせで出荷量を予測'],
                      ['🌐 多農場対応',          '複数農場・複数品種を一括管理できるダッシュボード'],
                      ['📊 年間レポート生成',    '1年分の気象・収穫データをまとめた年次報告書の自動生成'],
                    ].map(([name, desc]) => (
                      <div key={name as string} className="flex gap-2 text-sm">
                        <span className="text-purple-500 shrink-0">○</span>
                        <div>
                          <span className="font-medium">{name}</span>
                          <span className="text-xs text-gray-500 ml-2">{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* フッター */}
            <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 text-center">
              <p>本書はプロトタイプ版（v1.5）の説明書です。機能・仕様は今後変更される場合があります。</p>
              <p className="mt-0.5">株式会社ラファティリティ | 広島県庄原市総領町中領家178 | {today}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
