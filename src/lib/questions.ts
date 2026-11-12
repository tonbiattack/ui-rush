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
  demoType: string;
  category: QuestionCategory;
}

/**
 * 同じ問いに対して正解が複数あると解釈されうる組み合わせ。
 * 選択肢生成時に、互いを誤答候補として出さない。
 */
export const CONFUSABLE: Record<string, string[]> = {
  toast: ["snackbar"],
  snackbar: ["toast"],
  dropdown: ["select"],
  select: ["dropdown"],
  tooltip: ["popover"],
  popover: ["tooltip"],
  drawer: ["bottomsheet"],
  bottomsheet: ["drawer"],
  slider: ["progressbar"],
  progressbar: ["slider"],
};

export const QUESTIONS: Question[] = [
  {
    id: "accordion",
    nameJa: "アコーディオン",
    nameEn: "Accordion",
    reading: "あこーでぃおん",
    description:
      "見出しをタップすると中身が開閉する折りたたみ式のリスト。必要な情報だけを開いて読める。",
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
