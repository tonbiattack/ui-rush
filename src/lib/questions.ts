export type QuestionCategory =
  | "overlay"
  | "feedback"
  | "navigation"
  | "form"
  | "disclosure"
  | "content"
  | "data"
  | "layout";

/** term: 通常の用語 / keyboard: キーボード操作の用語 */
export type QuestionKind = "term" | "keyboard";

export interface Question {
  id: string;
  kind: QuestionKind;
  nameJa: string;
  nameEn: string;
  reading: string;
  /** 別名・表記ゆれ。検索と音声回答の照合にだけ使い、問題としては出さない。 */
  aliases: string[];
  description: string;
  /** AIへの指示にそのまま使える一文。 */
  exampleInstruction: string;
  /** 逆引きモードの出題文。名称を含めない。 */
  reversePrompt: string;
  demoType: string;
  category: QuestionCategory;
}

/** 見分けがつきにくい組み合わせと、その違いの説明。 */
export interface ConfusablePair {
  a: string;
  b: string;
  distinction: string;
}

/**
 * 実務で呼び間違えやすいペア。
 * 選択肢生成時に互いを誤答候補として出さず、呼び分け特訓・別名辞典の比較にも使う。
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
  {
    a: "combobox",
    b: "select",
    distinction:
      "コンボボックスは入力欄に文字を打って候補を絞り込める。セレクトは一覧から選ぶだけで、打ち込みはできない。",
  },
  {
    a: "tabs",
    b: "tabbar",
    distinction:
      "タブは同じ画面の中で表示内容を切り替える。タブバーは画面下に固定され、アプリの主要画面そのものを切り替える。",
  },
  {
    a: "badge",
    b: "chip",
    distinction:
      "バッジは件数や状態を示す小さな印で、それ自体は押さない。チップは入力済みの条件やタグを表し、押して外せる。",
  },
  {
    a: "alert",
    b: "banner",
    distinction:
      "アラートは操作の結果や注意をその場に出す。バナーは画面幅いっぱいに置く告知で、閉じるまで残ることが多い。",
  },
  {
    a: "progressbar",
    b: "progressring",
    distinction:
      "プログレスバーは横棒で進み具合を示す。プログレスリングは円弧で示し、狭い場所やボタン内に収めたいときに使う。",
  },
  {
    a: "spinner",
    b: "progressbar",
    distinction:
      "スピナーは「待っている」ことだけを示す。プログレスバーは何割終わったかという量を示す。",
  },
];

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
    kind: "term",
    nameJa: "アコーディオン",
    nameEn: "Accordion",
    reading: "あこーでぃおん",
    aliases: ["アコーディオンパネル", "折りたたみ"],
    description:
      "見出しをタップすると中身が開閉する折りたたみ式のリスト。必要な情報だけを開いて読める。",
    exampleInstruction: "設定画面の詳細項目は、アコーディオンにして折りたたんでおいて。",
    reversePrompt: "項目が縦に長いので、見出しだけ並べて、押した項目の中身だけ開くようにしたい。",
    demoType: "accordion",
    category: "disclosure",
  },
  {
    id: "modal",
    kind: "term",
    nameJa: "モーダル",
    nameEn: "Modal",
    reading: "もーだる",
    aliases: ["ダイアログ", "モーダルダイアログ"],
    description:
      "画面の上に重なって表示され、閉じるまで背後の操作を遮るダイアログ。確認や入力に使う。",
    exampleInstruction: "削除する前に、モーダルで確認ダイアログを出して。",
    reversePrompt: "削除の前に一度確認を挟みたい。背景は操作できないようにしたい。",
    demoType: "modal",
    category: "overlay",
  },
  {
    id: "drawer",
    kind: "term",
    nameJa: "ドロワー",
    nameEn: "Drawer",
    reading: "どろわー",
    aliases: ["サイドドロワー", "引き出しメニュー"],
    description:
      "画面の端からスライドして出てくるパネル。引き出しのように開閉し、メニューによく使う。",
    exampleInstruction: "スマホでは左からドロワーでメニューを開けるようにして。",
    reversePrompt: "スマホでメニューを普段は隠しておき、ボタンを押したら横から出す。",
    demoType: "drawer",
    category: "overlay",
  },
  {
    id: "toast",
    kind: "term",
    nameJa: "トースト",
    nameEn: "Toast",
    reading: "とーすと",
    aliases: ["トースト通知"],
    description:
      "画面の隅に短時間だけ浮かぶ小さな通知。操作を妨げず、保存できたことなどを知らせる。",
    exampleInstruction: "保存できたら右上にトーストで「保存しました」と出して。",
    reversePrompt: "保存できたことを、操作を妨げずに数秒だけ知らせたい。",
    demoType: "toast",
    category: "feedback",
  },
  {
    id: "snackbar",
    kind: "term",
    nameJa: "スナックバー",
    nameEn: "Snackbar",
    reading: "すなっくばー",
    aliases: ["アクションバー付き通知"],
    description:
      "画面の下に現れる通知で、「元に戻す」などの操作ボタンを添えられるのが特徴。",
    exampleInstruction: "削除したら画面下にスナックバーで「元に戻す」を出して。",
    reversePrompt: "削除したあと、画面下に「元に戻す」ボタン付きで知らせたい。",
    demoType: "snackbar",
    category: "feedback",
  },
  {
    id: "tooltip",
    kind: "term",
    nameJa: "ツールチップ",
    nameEn: "Tooltip",
    reading: "つーるちっぷ",
    aliases: ["ヒント表示"],
    description:
      "対象にカーソルを合わせるかフォーカスすると、すぐ近くに出る短い説明。操作要素は含めない。",
    exampleInstruction: "このアイコンにツールチップで「コピー」と説明を付けて。",
    reversePrompt: "アイコンの意味を、カーソルを合わせたときだけ短く説明したい。",
    demoType: "tooltip",
    category: "overlay",
  },
  {
    id: "popover",
    kind: "term",
    nameJa: "ポップオーバー",
    nameEn: "Popover",
    reading: "ぽぷおーばー",
    aliases: ["ポップアップパネル"],
    description:
      "ボタンの近くに開く小さなパネル。メニューや設定など、操作できる中身を載せられる。",
    exampleInstruction: "歯車ボタンを押したら、ポップオーバーで表示設定を開いて。",
    reversePrompt: "歯車ボタンのすぐ近くに、チェックボックス入りの小さな設定パネルを出したい。",
    demoType: "popover",
    category: "overlay",
  },
  {
    id: "tabs",
    kind: "term",
    nameJa: "タブ",
    nameEn: "Tabs",
    reading: "たぶ",
    aliases: ["タブ切り替え"],
    description:
      "同じ画面の中で、並んだ見出しを切り替えて表示内容を変えるナビゲーション。",
    exampleInstruction: "このページはタブで「概要・仕様・履歴」を切り替えられるようにして。",
    reversePrompt: "同じ画面の中で、概要・仕様・履歴を切り替えて見せたい。",
    demoType: "tabs",
    category: "navigation",
  },
  {
    id: "carousel",
    kind: "term",
    nameJa: "カルーセル",
    nameEn: "Carousel",
    reading: "かるーせる",
    aliases: ["スライダーショー", "スライドショー"],
    description:
      "左右にスライドして、複数の画像やカードを順番に見せる表示。回転木馬が語源。",
    exampleInstruction: "トップの画像はカルーセルで3枚を横にスワイプできるようにして。",
    reversePrompt: "画像を3枚、横にスワイプして順番に見せたい。",
    demoType: "carousel",
    category: "navigation",
  },
  {
    id: "bottomsheet",
    kind: "term",
    nameJa: "ボトムシート",
    nameEn: "Bottom sheet",
    reading: "ぼとむしーと",
    aliases: ["ボトムシートダイアログ"],
    description:
      "画面の下からせり上がってくるパネル。スマホで選択肢や詳細を出すときによく使う。",
    exampleInstruction: "スマホで写真を追加するときは、ボトムシートで選択肢を出して。",
    reversePrompt: "スマホで画面の下から選択肢を出したい。",
    demoType: "bottomsheet",
    category: "overlay",
  },
  {
    id: "dropdown",
    kind: "term",
    nameJa: "ドロップダウン",
    nameEn: "Dropdown",
    reading: "どろっぷだうん",
    aliases: ["ドロップダウンメニュー"],
    description:
      "ボタンを押すと下に開くメニュー。項目を選ぶとその操作が実行される。",
    exampleInstruction: "各行の操作メニューはドロップダウンで「編集・複製・削除」を出して。",
    reversePrompt: "一覧の各行で、押すと「編集・複製・削除」が出るメニューがほしい。",
    demoType: "dropdown",
    category: "navigation",
  },
  {
    id: "select",
    kind: "term",
    nameJa: "セレクト",
    nameEn: "Select",
    reading: "せれくと",
    aliases: ["セレクトボックス", "プルダウン", "選択ボックス"],
    description:
      "選択肢の一覧から1つを選ぶ入力フォーム。選んだ値が欄に残る。",
    exampleInstruction: "通知の頻度はセレクトで「毎日・週1回・月1回」から選ばせて。",
    reversePrompt: "3つの候補から1つ選ばせて、選んだ値をフォームに残したい。",
    demoType: "select",
    category: "form",
  },
  {
    id: "checkbox",
    kind: "term",
    nameJa: "チェックボックス",
    nameEn: "Checkbox",
    reading: "ちぇっくぼっくす",
    aliases: ["チェック欄"],
    description:
      "四角い枠にチェックを入れる選択肢。複数同時に選べる。",
    exampleInstruction: "通知の手段はチェックボックスで、複数選べるようにして。",
    reversePrompt: "通知の手段を、複数同時に選べるようにしたい。",
    demoType: "checkbox",
    category: "form",
  },
  {
    id: "radio",
    kind: "term",
    nameJa: "ラジオボタン",
    nameEn: "Radio button",
    reading: "らじおぼたん",
    aliases: ["ラジオ"],
    description:
      "丸い選択肢のうち、1つだけを選ぶ入力。選ぶと他の選択は外れる。",
    exampleInstruction: "配送方法はラジオボタンで、1つだけ選べるようにして。",
    reversePrompt: "配送方法を、必ず1つだけ選べるようにしたい。",
    demoType: "radio",
    category: "form",
  },
  {
    id: "toggleswitch",
    kind: "term",
    nameJa: "トグルスイッチ",
    nameEn: "Toggle switch",
    reading: "とぐるすいっち",
    aliases: ["スイッチ", "オンオフスイッチ"],
    description:
      "つまみを左右に動かして、オンとオフを切り替えるスイッチ。設定の有効化などに使う。",
    exampleInstruction: "自動保存のオン・オフはトグルスイッチにして。",
    reversePrompt: "自動保存のオンとオフを、つまみで切り替えられるようにしたい。",
    demoType: "toggleswitch",
    category: "form",
  },
  {
    id: "slider",
    kind: "term",
    nameJa: "スライダー",
    nameEn: "Slider",
    reading: "すらいだー",
    aliases: ["レンジスライダー"],
    description:
      "つまみをドラッグして、音量や明るさなどの数値を連続的に決める入力。",
    exampleInstruction: "音量はスライダーで、0〜100の範囲を調整できるようにして。",
    reversePrompt: "音量を0〜100のあいだで、連続的に調整できるようにしたい。",
    demoType: "slider",
    category: "form",
  },
  {
    id: "progressbar",
    kind: "term",
    nameJa: "プログレスバー",
    nameEn: "Progress bar",
    reading: "ぷろぐれすばー",
    aliases: ["進捗バー"],
    description:
      "処理の進み具合を横棒の長さや色で示す表示。ユーザーは完了までの目安を知れる。",
    exampleInstruction: "アップロード中はプログレスバーで進み具合を見せて。",
    reversePrompt: "アップロードの進み具合を、横棒の長さで見せたい。",
    demoType: "progressbar",
    category: "feedback",
  },
  {
    id: "skeleton",
    kind: "term",
    nameJa: "スケルトン",
    nameEn: "Skeleton",
    reading: "すけるとん",
    aliases: ["スケルトンスクリーン", "プレースホルダ"],
    description:
      "読み込み中の間、完成後の形を灰色の枠で仮表示するもの。体感の待ち時間を短くする。",
    exampleInstruction: "一覧の読み込み中はスケルトンを出して、ちらつきを抑えて。",
    reversePrompt: "読み込み中に、完成後の形を灰色の枠で仮表示しておきたい。",
    demoType: "skeleton",
    category: "feedback",
  },
  {
    id: "breadcrumb",
    kind: "term",
    nameJa: "パンくずリスト",
    nameEn: "Breadcrumb",
    reading: "ぱんくずりすと",
    aliases: ["パンくず", "ブレッドクラム"],
    description:
      "現在地までの階層を「ホーム > 製品 > 詳細」のように並べ、上位へ戻れるようにする。",
    exampleInstruction: "詳細ページの上部にパンくずリストを出して、上位の階層に戻れるようにして。",
    reversePrompt: "今どの階層にいるかを上部に並べ、上位へ戻れるようにしたい。",
    demoType: "breadcrumb",
    category: "navigation",
  },
  {
    id: "pagination",
    kind: "term",
    nameJa: "ページネーション",
    nameEn: "Pagination",
    reading: "ぺーじねーしょん",
    aliases: ["ページ送り", "ページャー"],
    description:
      "複数ページに分かれた内容を、番号や前後のボタンで行き来するためのリンク群。",
    exampleInstruction: "検索結果の下にページネーションを付けて、前後のページに移動できるようにして。",
    reversePrompt: "検索結果を10件ずつに分けて、前後のページへ移動できるようにしたい。",
    demoType: "pagination",
    category: "navigation",
  },
  {
    id: "combobox",
    kind: "term",
    nameJa: "コンボボックス",
    nameEn: "Combo box",
    reading: "こんぼぼっくす",
    aliases: ["オートコンプリート", "入力付きセレクト"],
    description:
      "入力欄に文字を打つと候補が絞り込まれ、一覧から選べる入力。候補が多いときに向く。",
    exampleInstruction: "部署の選択は候補が多いので、コンボボックスにして絞り込めるようにして。",
    reversePrompt: "候補が200件あるので、文字を打って絞り込んでから選べるようにしたい。",
    demoType: "combobox",
    category: "form",
  },
  {
    id: "stepper",
    kind: "term",
    nameJa: "ステッパー",
    nameEn: "Stepper",
    reading: "すてっぱー",
    aliases: ["数値ステッパー", "増減ボタン"],
    description:
      "数字の左右にある「−」「＋」で、数量を1ずつ増減させる入力。",
    exampleInstruction: "チケットの枚数はステッパーで、1枚ずつ増やせるようにして。",
    reversePrompt: "数量を「−」と「＋」で1ずつ増減させたい。",
    demoType: "stepper",
    category: "form",
  },
  {
    id: "chip",
    kind: "term",
    nameJa: "チップ",
    nameEn: "Chip",
    reading: "ちっぷ",
    aliases: ["タグチップ", "フィルターチップ"],
    description:
      "選んだ条件やタグを表す小さな要素。×を押すと外せる。",
    exampleInstruction: "絞り込み条件はチップで並べて、×で外せるようにして。",
    reversePrompt: "選んだ絞り込み条件を小さく並べて、押したら外せるようにしたい。",
    demoType: "chip",
    category: "content",
  },
  {
    id: "badge",
    kind: "term",
    nameJa: "バッジ",
    nameEn: "Badge",
    reading: "ばっじ",
    aliases: ["通知バッジ", "カウントバッジ"],
    description:
      "未読件数や状態を表す小さな印。アイコンや見出しに重ねて置く。",
    exampleInstruction: "ベルアイコンにバッジで未読件数を出して。",
    reversePrompt: "ベルアイコンに未読件数を小さく重ねて示したい。",
    demoType: "badge",
    category: "feedback",
  },
  {
    id: "avatar",
    kind: "term",
    nameJa: "アバター",
    nameEn: "Avatar",
    reading: "あばたー",
    aliases: ["プロフィール画像", "ユーザーアイコン"],
    description:
      "ユーザーの写真や頭文字を丸く表示する要素。誰の発言かを示す。",
    exampleInstruction: "コメント欄の左にアバターを出して。",
    reversePrompt: "コメントの横に、その人の写真や頭文字を丸く出したい。",
    demoType: "avatar",
    category: "content",
  },
  {
    id: "segmentedcontrol",
    kind: "term",
    nameJa: "セグメントコントロール",
    nameEn: "Segmented control",
    reading: "せぐめんとこんとろーる",
    aliases: ["セグメントボタン", "切り替えボタン"],
    description:
      "横並びのボタンのうち1つを選び、表示を切り替える。タブに似るが、選択状態が1つに限られる点が特徴。",
    exampleInstruction: "表示形式はセグメントコントロールで「リスト・グリッド」を切り替えて。",
    reversePrompt: "リスト表示とグリッド表示を、横並びのボタンで切り替えたい。",
    demoType: "segmentedcontrol",
    category: "navigation",
  },
  {
    id: "textfield",
    kind: "term",
    nameJa: "テキストフィールド",
    nameEn: "Text field",
    reading: "てきすとふぃーるど",
    aliases: ["入力欄", "テキストボックス"],
    description:
      "1行の文字を入力する欄。名前やメールアドレスなどに使う。",
    exampleInstruction: "氏名はテキストフィールドで入力させて。",
    reversePrompt: "名前を1行だけ入力できる欄がほしい。",
    demoType: "textfield",
    category: "form",
  },
  {
    id: "textarea",
    kind: "term",
    nameJa: "テキストエリア",
    nameEn: "Textarea",
    reading: "てきすとえりあ",
    aliases: ["複数行入力欄"],
    description:
      "複数行の文字を入力する欄。改行できる点がテキストフィールドと違う。",
    exampleInstruction: "問い合わせ内容はテキストエリアで複数行書けるようにして。",
    reversePrompt: "問い合わせ内容を、改行しながら複数行書けるようにしたい。",
    demoType: "textarea",
    category: "form",
  },
  {
    id: "searchfield",
    kind: "term",
    nameJa: "検索フィールド",
    nameEn: "Search field",
    reading: "けんさくふぃーるど",
    aliases: ["検索ボックス", "サーチバー"],
    description:
      "虫眼鏡アイコンを伴い、文字を入れて一覧を絞り込む入力欄。",
    exampleInstruction: "ヘッダーに検索フィールドを置いて、その場で絞り込めるようにして。",
    reversePrompt: "虫眼鏡のアイコン付きで、入力すると一覧が絞り込まれる欄がほしい。",
    demoType: "searchfield",
    category: "form",
  },
  {
    id: "datepicker",
    kind: "term",
    nameJa: "日付ピッカー",
    nameEn: "Date picker",
    reading: "ひづけぴっかー",
    aliases: ["カレンダー入力", "デートピッカー"],
    description:
      "カレンダーから日付を選ぶ入力。手入力の表記ゆれを防げる。",
    exampleInstruction: "予約日は日付ピッカーでカレンダーから選ばせて。",
    reversePrompt: "予約日を、カレンダーから選んで入力させたい。",
    demoType: "datepicker",
    category: "form",
  },
  {
    id: "rating",
    kind: "term",
    nameJa: "レーティング",
    nameEn: "Rating",
    reading: "れーてぃんぐ",
    aliases: ["星評価", "5段階評価"],
    description:
      "星などを並べ、5段階などで評価を選ぶ入力。",
    exampleInstruction: "商品の満足度はレーティングで5段階に選ばせて。",
    reversePrompt: "満足度を星5つの中から選ばせたい。",
    demoType: "rating",
    category: "form",
  },
  {
    id: "dropzone",
    kind: "term",
    nameJa: "ドロップゾーン",
    nameEn: "Dropzone",
    reading: "どろっぷぞーん",
    aliases: ["ファイルアップロード", "ドラッグ&ドロップ領域"],
    description:
      "ファイルをドラッグ&ドロップ、またはタップして選ぶ領域。",
    exampleInstruction: "資料の追加はドロップゾーンにして、ドラッグでも選べるようにして。",
    reversePrompt: "ファイルをドラッグして置ける領域がほしい。",
    demoType: "dropzone",
    category: "form",
  },
  {
    id: "table",
    kind: "term",
    nameJa: "テーブル",
    nameEn: "Table",
    reading: "てーぶる",
    aliases: ["データテーブル", "一覧表"],
    description:
      "行と列でデータを並べ、見出しで項目を示す表。比較や一覧に向く。",
    exampleInstruction: "請求書の一覧はテーブルにして、金額の列を右揃えにして。",
    reversePrompt: "項目ごとに列を分けて、複数のデータを比べられる表にしたい。",
    demoType: "table",
    category: "data",
  },
  {
    id: "card",
    kind: "term",
    nameJa: "カード",
    nameEn: "Card",
    reading: "かーど",
    aliases: ["カードUI"],
    description:
      "画像や見出し、説明をひとまとまりにして囲んだ要素。一覧で並べて使う。",
    exampleInstruction: "記事一覧はカードで並べて、サムネイルと見出しをセットにして。",
    reversePrompt: "画像と見出しをひとまとまりにして、一覧に並べたい。",
    demoType: "card",
    category: "content",
  },
  {
    id: "navbar",
    kind: "term",
    nameJa: "ナビゲーションバー",
    nameEn: "Navigation bar",
    reading: "なびげーしょんばー",
    aliases: ["ヘッダー", "グローバルナビ"],
    description:
      "画面上部に固定され、ロゴや主要なリンクを並べる横帯。",
    exampleInstruction: "画面上部のナビゲーションバーに、ロゴと主要メニューを並べて。",
    reversePrompt: "画面上部にロゴと主要なリンクを横に並べて固定したい。",
    demoType: "navbar",
    category: "layout",
  },
  {
    id: "sidebar",
    kind: "term",
    nameJa: "サイドバー",
    nameEn: "Sidebar",
    reading: "さいどばー",
    aliases: ["サイドナビ", "左メニュー"],
    description:
      "画面の横に固定され、階層メニューや補助情報を置く縦帯。",
    exampleInstruction: "管理画面は左のサイドバーに階層メニューを置いて。",
    reversePrompt: "画面の横に、階層メニューを縦に並べて固定したい。",
    demoType: "sidebar",
    category: "layout",
  },
  {
    id: "banner",
    kind: "term",
    nameJa: "バナー",
    nameEn: "Banner",
    reading: "ばなー",
    aliases: ["告知バー", "お知らせバー"],
    description:
      "画面幅いっぱいに置く告知。閉じるまで残ることが多く、内容の宣伝に使う。",
    exampleInstruction: "無料トライアルの案内は、画面上部のバナーで出して。",
    reversePrompt: "画面幅いっぱいに告知を出して、閉じるまで残るようにしたい。",
    demoType: "banner",
    category: "feedback",
  },
  {
    id: "alert",
    kind: "term",
    nameJa: "アラート",
    nameEn: "Alert",
    reading: "あらーと",
    aliases: ["警告表示", "通知メッセージ"],
    description:
      "操作の結果や注意を、その場に表示するメッセージ。色と記号で重要度を示す。",
    exampleInstruction: "送信に失敗したら、フォームの上にアラートで理由を出して。",
    reversePrompt: "送信に失敗した理由を、フォームの上にその場で表示したい。",
    demoType: "alert",
    category: "feedback",
  },
  {
    id: "emptystate",
    kind: "term",
    nameJa: "空状態",
    nameEn: "Empty state",
    reading: "からじょうたい",
    aliases: ["エンプティステート", "0件表示"],
    description:
      "データが1件もないときに、その旨と次の操作を案内する表示。",
    exampleInstruction: "保存した記事が0件のときは、空状態で「記事を書く」ボタンを出して。",
    reversePrompt: "データが1件もないときに、次の操作を案内したい。",
    demoType: "emptystate",
    category: "feedback",
  },
  {
    id: "spinner",
    kind: "term",
    nameJa: "スピナー",
    nameEn: "Spinner",
    reading: "すぴなー",
    aliases: ["ローディング", "読み込み中表示"],
    description:
      "回転する印で、処理中であることだけを示す表示。進捗の割合は示さない。",
    exampleInstruction: "ボタンを押したら、処理が終わるまでスピナーを出して。",
    reversePrompt: "処理中であることだけを、回転する印で示したい。",
    demoType: "spinner",
    category: "feedback",
  },
  {
    id: "togglebutton",
    kind: "term",
    nameJa: "トグルボタン",
    nameEn: "Toggle button",
    reading: "とぐるぼたん",
    aliases: ["押し込みボタン"],
    description:
      "押すたびにオン・オフが切り替わり、押された状態が見た目に残るボタン。",
    exampleInstruction: "太字の書式はトグルボタンにして、押されている間だけ効くようにして。",
    reversePrompt: "押すたびにオンとオフが切り替わり、押した状態が残るボタンがほしい。",
    demoType: "togglebutton",
    category: "form",
  },
  {
    id: "progressring",
    kind: "term",
    nameJa: "プログレスリング",
    nameEn: "Progress ring",
    reading: "ぷろぐれすりんぐ",
    aliases: ["円形プログレス", "サーキュラープログレス"],
    description:
      "円弧の長さで進み具合を示す表示。狭い場所やボタンの中に収めやすい。",
    exampleInstruction: "アップロード中はボタンの中にプログレスリングを出して。",
    reversePrompt: "狭い場所で進み具合を示したいので、円弧の長さで表したい。",
    demoType: "progressring",
    category: "feedback",
  },
  {
    id: "contextmenu",
    kind: "term",
    nameJa: "コンテキストメニュー",
    nameEn: "Context menu",
    reading: "こんてきすとめにゅー",
    aliases: ["右クリックメニュー"],
    description:
      "右クリックや長押しした位置に開くメニュー。その対象に対する操作を並べる。",
    exampleInstruction: "ファイルを右クリックしたら、コンテキストメニューで操作を出して。",
    reversePrompt: "対象を右クリックした位置に、その対象への操作を並べたい。",
    demoType: "contextmenu",
    category: "overlay",
  },
  {
    id: "splitbutton",
    kind: "term",
    nameJa: "スプリットボタン",
    nameEn: "Split button",
    reading: "すぷりっとぼたん",
    aliases: ["分割ボタン"],
    description:
      "主操作と、その派生メニューを1つにまとめたボタン。右端の矢印で選択肢を開く。",
    exampleInstruction: "保存ボタンはスプリットボタンにして、右の矢印で「名前を付けて保存」も選べるようにして。",
    reversePrompt: "主操作と、その派生の選択肢を1つのボタンにまとめたい。",
    demoType: "splitbutton",
    category: "navigation",
  },
  {
    id: "fab",
    kind: "term",
    nameJa: "フローティングボタン",
    nameEn: "Floating action button",
    reading: "ふろーてぃんぐぼたん",
    aliases: ["FAB", "浮遊ボタン"],
    description:
      "画面の隅に浮かせて置く丸いボタン。その画面の中心となる操作に使う。",
    exampleInstruction: "メモ一覧の右下に、フローティングボタンで新規作成を置いて。",
    reversePrompt: "一覧画面の右下に、新規作成の丸いボタンを浮かせて置きたい。",
    demoType: "fab",
    category: "navigation",
  },
  {
    id: "richtext",
    kind: "term",
    nameJa: "リッチテキストエディタ",
    nameEn: "Rich text editor",
    reading: "りっちてきすとえでぃた",
    aliases: ["WYSIWYGエディタ", "書式付きエディタ"],
    description:
      "太字や見出しなどの書式を、見たままの形で付けられる入力領域。",
    exampleInstruction: "記事本文はリッチテキストエディタにして、太字と見出しを使えるようにして。",
    reversePrompt: "本文に太字や見出しを、見たままの形で付けられるようにしたい。",
    demoType: "richtext",
    category: "form",
  },
  {
    id: "colorpicker",
    kind: "term",
    nameJa: "カラーピッカー",
    nameEn: "Color picker",
    reading: "からーぴっかー",
    aliases: ["色選択"],
    description:
      "色見本やスウォッチから色を選ぶ入力。テーマ設定などに使う。",
    exampleInstruction: "テーマ色はカラーピッカーで選べるようにして。",
    reversePrompt: "テーマの色を、色見本から選べるようにしたい。",
    demoType: "colorpicker",
    category: "form",
  },
  {
    id: "timeline",
    kind: "term",
    nameJa: "タイムライン",
    nameEn: "Timeline",
    reading: "たいむらいん",
    aliases: ["履歴表示", "時系列リスト"],
    description:
      "出来事を時系列に沿って縦に並べ、点と線でつなぐ表示。",
    exampleInstruction: "注文の経過はタイムラインで時系列に並べて。",
    reversePrompt: "出来事を時系列に沿って、点と線でつないで並べたい。",
    demoType: "timeline",
    category: "content",
  },
  {
    id: "tabbar",
    kind: "term",
    nameJa: "タブバー",
    nameEn: "Tab bar",
    reading: "たぶばー",
    aliases: ["ボトムナビ", "ボトムタブ"],
    description:
      "画面下に固定し、アプリの主要画面を切り替える横並びのアイコン群。",
    exampleInstruction: "スマホでは画面下のタブバーで「ホーム・検索・設定」を切り替えて。",
    reversePrompt: "スマホで、アプリの主要画面を画面下から切り替えたい。",
    demoType: "tabbar",
    category: "navigation",
  },
  {
    id: "inlineedit",
    kind: "term",
    nameJa: "インライン編集",
    nameEn: "Inline edit",
    reading: "いんらいんへんしゅう",
    aliases: ["その場編集", "クリックで編集"],
    description:
      "表示中の文字をその場で編集可能にし、別画面へ移らずに更新する操作。",
    exampleInstruction: "タスク名はインライン編集にして、ダブルクリックで直せるようにして。",
    reversePrompt: "一覧の文字を、別画面に移らずその場で直せるようにしたい。",
    demoType: "inlineedit",
    category: "form",
  },
];

/**
 * キーボード操作の用語。通常の4択には混ぜず、専用モードだけで出題する。
 * nameJa はキーの表記、reversePrompt は「何をしたいか」の説明。
 */
export const KEYBOARD_QUESTIONS: Question[] = [
  {
    id: "key-escape",
    kind: "keyboard",
    nameJa: "Esc",
    nameEn: "Escape",
    reading: "えすけーぷ",
    aliases: ["エスケープキー", "Escapeキー"],
    description:
      "開いているモーダルやメニューを閉じる。入力途中の取り消しにも使う。",
    exampleInstruction: "モーダルはEscで閉じられるようにして。",
    reversePrompt: "開いているモーダルを閉じたい。",
    demoType: "key-escape",
    category: "form",
  },
  {
    id: "key-tab",
    kind: "keyboard",
    nameJa: "Tab",
    nameEn: "Tab",
    reading: "たぶ",
    aliases: ["タブキー"],
    description:
      "フォーカスを次の操作要素へ移す。フォームを順に埋めるときに使う。",
    exampleInstruction: "入力欄はTabで順に移動できるようにして。",
    reversePrompt: "入力欄から次の入力欄へ、フォーカスを移したい。",
    demoType: "key-tab",
    category: "form",
  },
  {
    id: "key-shift-tab",
    kind: "keyboard",
    nameJa: "Shift + Tab",
    nameEn: "Shift + Tab",
    reading: "しふとたぶ",
    aliases: ["シフトタブ"],
    description: "Tabと逆方向に、フォーカスを前の操作要素へ戻す。",
    exampleInstruction: "Shift + Tabで前の入力欄に戻れるようにして。",
    reversePrompt: "次の入力欄ではなく、1つ前の入力欄へ戻りたい。",
    demoType: "key-shift-tab",
    category: "form",
  },
  {
    id: "key-enter",
    kind: "keyboard",
    nameJa: "Enter",
    nameEn: "Enter",
    reading: "えんたー",
    aliases: ["リターンキー", "Return"],
    description:
      "フォーカス中のボタンを押す、フォームを送信する、確定する。",
    exampleInstruction: "検索欄でEnterを押したら検索を実行するようにして。",
    reversePrompt: "検索欄に入力したあと、そのまま検索を実行したい。",
    demoType: "key-enter",
    category: "form",
  },
  {
    id: "key-space",
    kind: "keyboard",
    nameJa: "Space",
    nameEn: "Space",
    reading: "すぺーす",
    aliases: ["スペースキー"],
    description:
      "フォーカス中のチェックボックスやボタンを切り替える。",
    exampleInstruction: "チェックボックスはSpaceでも切り替えられるようにして。",
    reversePrompt: "フォーカス中のチェックボックスを、キーだけで切り替えたい。",
    demoType: "key-space",
    category: "form",
  },
  {
    id: "key-arrow-ud",
    kind: "keyboard",
    nameJa: "↑ / ↓",
    nameEn: "Arrow up / down",
    reading: "うえしたきー",
    aliases: ["上下キー", "矢印キー（上下）"],
    description:
      "セレクトやリストの中で、選択項目を上下に移動する。",
    exampleInstruction: "セレクトは上下キーで項目を選べるようにして。",
    reversePrompt: "開いた選択肢の中を、項目1つずつ上下に移動したい。",
    demoType: "key-arrow-ud",
    category: "form",
  },
  {
    id: "key-arrow-lr",
    kind: "keyboard",
    nameJa: "← / →",
    nameEn: "Arrow left / right",
    reading: "さゆうきー",
    aliases: ["左右キー", "矢印キー（左右）"],
    description:
      "タブやセグメントの選択を、左右に切り替える。",
    exampleInstruction: "タブは左右キーで切り替えられるようにして。",
    reversePrompt: "並んだタブの選択を、横方向に1つずつ移したい。",
    demoType: "key-arrow-lr",
    category: "navigation",
  },
  {
    id: "key-home",
    kind: "keyboard",
    nameJa: "Home",
    nameEn: "Home",
    reading: "ほーむ",
    aliases: ["ホームキー"],
    description: "リストや入力欄の先頭へ移動する。",
    exampleInstruction: "長いリストはHomeで先頭へ戻れるようにして。",
    reversePrompt: "長いリストのいちばん上へ一気に戻りたい。",
    demoType: "key-home",
    category: "navigation",
  },
  {
    id: "key-end",
    kind: "keyboard",
    nameJa: "End",
    nameEn: "End",
    reading: "えんど",
    aliases: ["エンドキー"],
    description: "リストや入力欄の末尾へ移動する。",
    exampleInstruction: "長いリストはEndで末尾へ移動できるようにして。",
    reversePrompt: "長いリストのいちばん下へ一気に移動したい。",
    demoType: "key-end",
    category: "navigation",
  },
  {
    id: "key-command-k",
    kind: "keyboard",
    nameJa: "Ctrl / ⌘ + K",
    nameEn: "Ctrl or Command + K",
    reading: "こんとろーるけー",
    aliases: ["コマンドパレット", "クイック検索", "Ctrl + K", "⌘ + K"],
    description:
      "アプリ全体のコマンド検索を開く。macOSでは⌘、WindowsではCtrlを使う。",
    exampleInstruction: "どこからでもCtrl + Kでコマンド検索を開けるようにして。",
    reversePrompt: "どの画面からでも、目的の機能を検索して開けるようにしたい。",
    demoType: "key-command-k",
    category: "navigation",
  },
];

export const TERMS = QUESTIONS;
export const ALL_QUESTIONS: Question[] = [...QUESTIONS, ...KEYBOARD_QUESTIONS];

export const QUESTIONS_BY_ID: ReadonlyMap<string, Question> = new Map(
  ALL_QUESTIONS.map((question) => [question.id, question]),
);

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  overlay: "重なり表示",
  feedback: "フィードバック",
  navigation: "ナビゲーション",
  form: "フォーム",
  disclosure: "開閉",
  content: "コンテンツ",
  data: "データ表示",
  layout: "レイアウト",
};

/** 同カテゴリの候補が足りないときの代替カテゴリ（近い系統から補充する）。 */
export const CATEGORY_FALLBACK: Record<QuestionCategory, QuestionCategory[]> = {
  disclosure: ["navigation", "overlay"],
  overlay: ["disclosure", "feedback"],
  feedback: ["overlay", "content"],
  navigation: ["disclosure", "layout"],
  form: ["feedback", "navigation"],
  content: ["data", "layout"],
  data: ["content", "layout"],
  layout: ["navigation", "content"],
};

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS_BY_ID.get(id);
}

export function getTerm(id: string): Question | undefined {
  const question = QUESTIONS_BY_ID.get(id);
  return question?.kind === "term" ? question : undefined;
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

/** 名前・英語名・読み・別名のいずれかに一致する用語を返す。 */
export function searchQuestions(query: string): Question[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return QUESTIONS;
  }
  return QUESTIONS.filter((question) =>
    [question.nameJa, question.nameEn, question.reading, ...question.aliases]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
