# UI Rush

UIコンポーネントの名称・読み・説明を4択で確認するWebクイズです。
操作できるデモを見て「このUIは何という？」に答えます。1問の制限時間は3〜8秒。

公開URL: <https://tonbiattack.github.io/ui-rush/>

- 仕様書: [`docs/spec.md`](docs/spec.md)
- デザイン方針: [`docs/design.md`](docs/design.md)

## 特徴

- 用語**50語**＋キーボード操作**10問**を収録。すべてに操作できるデモがある
- **1問3/5/8秒（既定5秒）** の制限時間。残り秒数とプログレスバーを表示し、0秒で時間切れ＝不正解
- 回答は1回だけ。回答とタイマーの競合・二重タップ・バックグラウンド復帰でも**1問1結果**
- 正誤と短い解説を表示している間は**タイマーが停止**。読み終えてから「次へ」で進む（自動送りも選択可）
- 解説には**AIへの指示例**（「右上にトーストで『保存しました』と出して」など）を併記
- 次のモードを選べる
  - **通常**: デモを見て名称を4択で回答
  - **逆引き**: 「画面下から出る操作メニュー」のような要件文から名称を4択で回答
  - **呼び分け特訓**: 紛らわしいペアを2択で集中特訓
  - **キーボード操作**: Tab / Esc / Space などの基本操作を4択で回答
  - **UIパーツ探し**: 模擬画面に並んだ部品を直接押して回答
  - **60秒タイムアタック**: 60秒で何問正解できるか。自己ベストを保存
  - **苦手復習**: 誤答・時間切れの問題だけを再出題
  - **今日の復習**: 間隔反復（1→3→7→14→30→60日）で期限が来た用語を出題
- **用語図鑑**（`/terms`）: 分類ごとに全用語のデモをその場で開いて操作できる（時間制限なし）
- **用語と別名**（`/dictionary`）: 別名・読み・英語名で検索でき、呼び分けの違いを一覧できる
- **音声回答**: 対応ブラウザでは「声で答える」から名称を発話して回答できる（表記ゆれを吸収）
- 5問/10問/20問、セッションごとにシャッフル（同一セッション内で重複なし）
- PCでは数字キー **1〜4** で回答、**Enter / Space** で次へ
- `localStorage` に問題別の正解・不正解・時間切れ回数・次回復習日を保存
- 公開URLでは Cloudflare Web Analytics でアクセス数だけを計測しています（Cookieなし・個人情報の送信なし）。クイズの動作に必要な通信はありません
- スマホ優先のレスポンシブ、`prefers-reduced-motion` 配慮、色だけに依存しない正誤表示

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開きます。

## 公開（GitHub Pages）

`main` へ push すると `.github/workflows/deploy-pages.yml` が静的サイトをビルドし、GitHub Pages へ配信します。

ローカルで同じ成果物を確認する場合:

```bash
NEXT_PUBLIC_BASE_PATH=/ui-rush npm run build   # Windows PowerShell: $env:NEXT_PUBLIC_BASE_PATH="/ui-rush"
npx serve out
```

プロジェクトページ（`/<repo>/`）で配信されるため、`NEXT_PUBLIC_BASE_PATH` にリポジトリ名を渡します。
独自ドメインやユーザーページで配信する場合は空文字のままで構いません。

### スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm start` | ビルド成果物の起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScriptの型チェック |
| `npm test` | ユニットテスト（Vitest） |

## 構成

```
src/
  app/
    page.tsx            ホーム（設定・モード・履歴・自己ベスト）
    quiz/page.tsx       クイズ（クエリで設定を受け取る）
    result/page.tsx     結果
    terms/page.tsx      用語図鑑（分類別・デモ付き）
    dictionary/page.tsx 用語と別名（検索・呼び分け一覧）
  components/
    ui-kit.tsx          罫線・標本枠・仕様表などの共通パーツ
    quiz-client.tsx     タイマー・回答・待機/自動進行
    spotlight-client.tsx UIパーツ探し（模擬画面から部品を選ぶ）
    result-client.tsx   結果集計と復習導線
    dictionary-client.tsx 別名検索と呼び分け一覧
    ui-demos.tsx        既存20種類の操作可能なUIデモ
    ui-demos-extra.tsx  追加30種類のデモとキーボード操作の図
    term-detail.tsx     指示例・呼び分けのコツ・用語サマリ
    term-card.tsx       図鑑の1項目（デモを折りたたみ表示）
  lib/
    questions.ts        問題データ（名称・別名・読み・分類・指示例・逆引き文・曖昧ペア）
    quiz.ts             出題生成・状態遷移・時間切れ判定・集計（純粋関数）
    history.ts          localStorageの学習履歴（保存・復元・苦手抽出・間隔反復）
    result-storage.ts   直近セッションの結果をsessionStorageへ受け渡し
    use-best-scores.ts  タイムアタックの自己ベスト
    use-speech.ts       音声回答（Web Speech API、表記ゆれ吸収）
```

判定・進行・集計は `src/lib/quiz.ts` の純粋関数として実装し、`src/lib/quiz.test.ts` と `src/lib/modes.test.ts` で自動テストしています。
タイマーは `performance.now()` の実時間で管理しているため、タブが裏に回っても復帰時に正しい残時間へ追いつきます。

## データについて

バックエンド・DB・認証は使いません。学習履歴と設定はブラウザの `localStorage` にのみ保存され、
ホームから削除できます。壊れた保存データは読み取り可能な範囲だけ復元し、読めなければ空の履歴として扱います。
