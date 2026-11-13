export type QuestionCategory =
  | "overlay"
  | "feedback"
  | "navigation"
  | "form"
  | "disclosure";

export interface Question {
  id: string;
  nameJa: string;
  nameEn: string;
  reading: string;
  description: string;
  /** AIへの指示にそのまま使える一文。用語を実際に使う形で覚えるため。 */
  exampleInstruction: string;
  demoType: string;
  category: QuestionCategory;
}

/** 見分けがつきにくい組み合わせと、その違いの説明。 */
export interface ConfusablePair {
  /** 小さい方のID（重複登録を避けるため、a < b を保つ）。 */
  a: string;
  b: string;
  distinction: string;
}

/**
 * 実務で呼び間違えやすいペア。
 * 選択肢生成時に互いを誤答候補として出さず、呼び分け特訓の出題にも使う。
 */
export const CONFUSABLE_PAIRS: ConfusablePair[] = [
  {
    a: "toast",
    b: "snackbar",
    distinction:
      "トーストは操作ボタンを持たない一方的な短い通知。スナックバーは画面下に出て「元に戻す」などのボタンを添えられる。",
  },
  {
    a: "dropdown",
    b: "select",
    distinction:
      "ドロップダウンは押すと操作メニューが開き、選ぶとその場で実行される。セレクトは値を1つ選んでフォームに残す入力欄。",
  },
  {
    a: "popover",
    b: "tooltip",
    distinction:
      "ツールチップはカーソルを合わせると出る読むだけの補足。ポップオーバーはクリックで開き、中にボタンや入力など操作できる要素を置ける。",
  },
  {
    a: "bottomsheet",
    b: "drawer",
    distinction:
      "ドロワーは左右の端から横にスライドして出るパネル。ボトムシートは画面の下から縦にせり上がってくる。",
  },
  {
    a: "progressbar",
    b: "slider",
    distinction:
      "スライダーはつまみを動かして値を決める入力。プログレスバーは進み具合を見せるだけで操作はできない。",
  },
];

/** 双方向の引き当て表。選択肢生成と説明表示で使う。 */
export const CONFUSABLE: Record<string, string[]> = CONFUSABLE_PAIRS.reduce(
  (acc, pair) => {
    (acc[pair.a] ??= []).push(pair.b);
    (acc[pair.b] ??= []).push(pair.a);
    return acc;
  },
  {} as Record<string, string[]>,
);

export const QUESTIONS: Question[] = [
  {
    id: "accordion",
    nameJa: "アコーディオン",
    nameEn: "Accordion",
    reading: "あこーでぃおん",
    description:
      "見出しをタップすると中身が開閉する折りたたみ式のリスト。必要な情報だけを開いて読める。",
    exampleInstruction: "設定画面の詳細項目は、アコーディオンにして折りたたんでおいて。",
    demoType: "accordion",
    category: "disclosure",
  },
  {
    id: "modal",
    nameJa: "モーダル",
    nameEn: "Modal",
    reading: "もーだる",
    description:
      "画面の上に重なって表示され、閉じるまで背後の操作を遮るダイアログ。確認や入力に使う。",
    exampleInstruction: "削除する前に、モーダルで確認ダイアログを出して。",
    demoType: "modal",
    category: "overlay",
  },
  {
    id: "drawer",
    nameJa: "ドロワー",
    nameEn: "Drawer",
    reading: "どろわー",
    description:
      "画面の端からスライドして出てくるパネル。引き出しのように開閉し、メニューによく使う。",
    exampleInstruction: "スマホでは左からドロワーでメニューを開けるようにして。",
    demoType: "drawer",
    category: "overlay",
  },
  {
    id: "toast",
    nameJa: "トースト",
    nameEn: "Toast",
    reading: "とーすと",
    description:
      "画面の隅に短時間だけ浮かぶ小さな通知。操作を妨げず、保存できたことなどを知らせる。",
    exampleInstruction: "保存できたら右上にトーストで「保存しました」と出して。",
    demoType: "toast",
    category: "feedback",
  },
  {
    id: "snackbar",
    nameJa: "スナックバー",
    nameEn: "Snackbar",
    reading: "すなっくばー",
    description:
      "画面の下に現れる通知で、「元に戻す」などの操作ボタンを添えられるのが特徴。",
    exampleInstruction: "削除したら画面下にスナックバーで「元に戻す」を出して。",
    demoType: "snackbar",
    category: "feedback",
  },
  {
    id: "tooltip",
    nameJa: "ツールチップ",
    nameEn: "Tooltip",
    reading: "つーるちっぷ",
    description:
      "対象にカーソルを合わせるかフォーカスすると、すぐ近くに出る短い説明。操作要素は含めない。",
    exampleInstruction: "このアイコンにツールチップで「コピー」と説明を付けて。",
    demoType: "tooltip",
    category: "overlay",
  },
  {
    id: "popover",
    nameJa: "ポップオーバー",
    nameEn: "Popover",
    reading: "ぽぷおーばー",
    description:
      "ボタンの近くに開く小さなパネル。メニューや設定など、操作できる中身を載せられる。",
    exampleInstruction: "歯車ボタンを押したら、ポップオーバーで表示設定を開いて。",
    demoType: "popover",
    category: "overlay",
  },
  {
    id: "tabs",
    nameJa: "タブ",
    nameEn: "Tabs",
    reading: "たぶ",
    description:
      "同じ画面の中で、並んだ見出しを切り替えて表示内容を変えるナビゲーション。",
    exampleInstruction: "このページはタブで「概要・仕様・履歴」を切り替えられるようにして。",
    demoType: "tabs",
    category: "navigation",
  },
  {
    id: "carousel",
    nameJa: "カルーセル",
    nameEn: "Carousel",
    reading: "かるーせる",
    description:
      "左右にスライドして、複数の画像やカードを順番に見せる表示。回転木馬が語源。",
    exampleInstruction: "トップの画像はカルーセルで3枚を横にスワイプできるようにして。",
    demoType: "carousel",
    category: "navigation",
  },
  {
    id: "bottomsheet",
    nameJa: "ボトムシート",
    nameEn: "Bottom sheet",
    reading: "ぼとむしーと",
    description:
      "画面の下からせり上がってくるパネル。スマホで選択肢や詳細を出すときによく使う。",
    exampleInstruction: "スマホで写真を追加するときは、ボトムシートで選択肢を出して。",
    demoType: "bottomsheet",
    category: "overlay",
  },
  {
    id: "dropdown",
    nameJa: "ドロップダウン",
    nameEn: "Dropdown",
    reading: "どろっぷだうん",
    description:
      "ボタンを押すと下に開くメニュー。項目を選ぶとその操作が実行される。",
    exampleInstruction: "各行の操作メニューはドロップダウンで「編集・複製・削除」を出して。",
    demoType: "dropdown",
    category: "navigation",
  },
  {
    id: "select",
    nameJa: "セレクト",
    nameEn: "Select",
    reading: "せれくと",
    description:
      "選択肢の一覧から1つを選ぶ入力フォーム。選んだ値が欄に残る。",
    exampleInstruction: "通知の頻度はセレクトで「毎日・週1回・月1回」から選ばせて。",
    demoType: "select",
    category: "form",
  },
  {
    id: "checkbox",
    nameJa: "チェックボックス",
    nameEn: "Checkbox",
    reading: "ちぇっくぼっくす",
    description:
      "四角い枠にチェックを入れる選択肢。複数同時に選べる。",
    exampleInstruction: "通知の手段はチェックボックスで、複数選べるようにして。",
    demoType: "checkbox",
    category: "form",
  },
  {
    id: "radio",
    nameJa: "ラジオボタン",
    nameEn: "Radio button",
    reading: "らじおぼたん",
    description:
      "丸い選択肢のうち、1つだけを選ぶ入力。選ぶと他の選択は外れる。",
    exampleInstruction: "配送方法はラジオボタンで、1つだけ選べるようにして。",
    demoType: "radio",
    category: "form",
  },
  {
    id: "toggleswitch",
    nameJa: "トグルスイッチ",
    nameEn: "Toggle switch",
    reading: "とぐるすいっち",
    description:
      "つまみを左右に動かして、オンとオフを切り替えるスイッチ。設定の有効化などに使う。",
    exampleInstruction: "自動保存のオン・オフはトグルスイッチにして。",
    demoType: "toggleswitch",
    category: "form",
  },
  {
    id: "slider",
    nameJa: "スライダー",
    nameEn: "Slider",
    reading: "すらいだー",
    description:
      "つまみをドラッグして、音量や明るさなどの数値を連続的に決める入力。",
    exampleInstruction: "音量はスライダーで、0〜100の範囲を調整できるようにして。",
    demoType: "slider",
    category: "form",
  },
  {
    id: "progressbar",
    nameJa: "プログレスバー",
    nameEn: "Progress bar",
    reading: "ぷろぐれすばー",
    description:
      "処理の進み具合を横棒の長さや色で示す表示。ユーザーは完了までの目安を知れる。",
    exampleInstruction: "アップロード中はプログレスバーで進み具合を見せて。",
    demoType: "progressbar",
    category: "feedback",
  },
  {
    id: "skeleton",
    nameJa: "スケルトン",
    nameEn: "Skeleton",
    reading: "すけるとん",
    description:
      "読み込み中の間、完成後の形を灰色の枠で仮表示するもの。体感の待ち時間を短くする。",
    exampleInstruction: "一覧の読み込み中はスケルトンを出して、ちらつきを抑えて。",
    demoType: "skeleton",
    category: "feedback",
  },
  {
    id: "breadcrumb",
    nameJa: "パンくずリスト",
    nameEn: "Breadcrumb",
    reading: "ぱんくずりすと",
    description:
      "現在地までの階層を「ホーム > 製品 > 詳細」のように並べ、上位へ戻れるようにする。",
    exampleInstruction: "詳細ページの上部にパンくずリストを出して、上位の階層に戻れるようにして。",
    demoType: "breadcrumb",
    category: "navigation",
  },
  {
    id: "pagination",
    nameJa: "ページネーション",
    nameEn: "Pagination",
    reading: "ぺーじねーしょん",
    description:
      "複数ページに分かれた内容を、番号や前後のボタンで行き来するためのリンク群。",
    exampleInstruction: "検索結果の下にページネーションを付けて、前後のページに移動できるようにして。",
    demoType: "pagination",
    category: "navigation",
  },
];

export const QUESTIONS_BY_ID: ReadonlyMap<string, Question> = new Map(
  QUESTIONS.map((question) => [question.id, question]),
);

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  overlay: "重なり表示",
  feedback: "フィードバック",
  navigation: "ナビゲーション",
  form: "フォーム",
  disclosure: "開閉",
};

/** 同カテゴリの候補が足りないときの代替カテゴリ（近い系統から補充する）。 */
export const CATEGORY_FALLBACK: Record<QuestionCategory, QuestionCategory[]> = {
  disclosure: ["navigation", "overlay"],
  overlay: ["disclosure", "feedback"],
  feedback: ["overlay", "form"],
  navigation: ["disclosure", "form"],
  form: ["feedback", "navigation"],
};

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS_BY_ID.get(id);
}

export function isConfusable(a: string, b: string): boolean {
  return CONFUSABLE[a]?.includes(b) ?? false;
}

/** 2つの用語の違い。ペアとして登録されていなければ undefined。 */
export function getDistinction(a: string, b: string): string | undefined {
  return CONFUSABLE_PAIRS.find(
    (pair) => (pair.a === a && pair.b === b) || (pair.a === b && pair.b === a),
  )?.distinction;
}

/** その用語と呼び間違えやすい相手のID一覧。 */
export function getConfusablePartners(id: string): string[] {
  return CONFUSABLE[id] ?? [];
}
