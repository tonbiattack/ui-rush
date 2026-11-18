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
  {
    a: "combobox",
    b: "dropdown",
    distinction:
      "コンボボックスは入力欄に打ち込んで候補を絞り、値を決める。ドロップダウンは押すと操作の一覧が開き、選ぶとその場で実行される。",
  },
  {
    a: "modal",
    b: "popover",
    distinction:
      "モーダルは背景を覆って操作を遮り、閉じるまで他へ移れない。ポップオーバーは要素のそばに開き、外を押せば閉じられる。",
  },
  {
    a: "tabs",
    b: "segmentedcontrol",
    distinction:
      "タブは表示内容を切り替え、内容が別々に存在する。セグメントコントロールは同じ内容の見せ方や条件を切り替える。",
  },
  {
    a: "drawer",
    b: "sheet",
    distinction:
      "ドロワーは主要なメニューを端から出す。シートは一覧を残したまま詳細を横から出す補助パネルで、幅は狭い。",
  },
  {
    a: "toast",
    b: "notification",
    distinction:
      "トーストは数秒で消え、見返せない。通知センターは通知を溜めて、あとから一覧で確認できる。",
  },
  {
    a: "alert",
    b: "inlinealert",
    distinction:
      "アラートは画面や節の単位でまとめて出す。インラインアラートは関係する入力欄のすぐそばに出す。",
  },
  {
    a: "banner",
    b: "callout",
    distinction:
      "バナーは画面幅いっぱいの帯で、閉じるまで残る告知。コールアウトは本文の中に置く枠付きの補足。",
  },
  {
    a: "tooltip",
    b: "coachmark",
    distinction:
      "ツールチップはカーソルを合わせるたびに出る短い説明。コーチマークは初回だけ対象を指して操作を案内する。",
  },
  {
    a: "popconfirm",
    b: "modal",
    distinction:
      "ポップ確認は押した要素のそばに小さく出て、画面を覆わない。モーダルは背景を覆い、閉じるまで操作を止める。",
  },
  {
    a: "select",
    b: "multiselect",
    distinction:
      "セレクトは値を1つだけ選ぶ。マルチセレクトは複数の値を同時に選べる。",
  },
  {
    a: "checkbox",
    b: "radio",
    distinction:
      "チェックボックスは複数選べ、押すと外せる。ラジオボタンは1つだけ選び、選び直すと他が外れる。",
  },
  {
    a: "textfield",
    b: "textarea",
    distinction:
      "テキストフィールドは1行の入力。テキストエリアは複数行にわたり、長文を入れる。",
  },
  {
    a: "datepicker",
    b: "rangepicker",
    distinction:
      "日付ピッカーは1つの日付を選ぶ。期間選択は始まりと終わりの2点を選んで範囲を決める。",
  },
  {
    a: "spinner",
    b: "loadingbar",
    distinction:
      "スピナーはその場で回り、待っていることを示す。ローディングバーは画面上部の細い帯で、画面を覆わない。",
  },
  {
    a: "skeleton",
    b: "spinner",
    distinction:
      "スケルトンはこれから入る内容の形を先に置く。スピナーは形を出さず、待っていることだけを示す。",
  },
  {
    a: "pagination",
    b: "loadmore",
    distinction:
      "ページネーションは何ページ目かを選んで移動する。もっと見るは末尾から続きを足していく。",
  },
  {
    a: "breadcrumb",
    b: "anchorlinks",
    distinction:
      "パンくずリストは階層のどこにいるかを示し、上位へ戻る。目次リンクは同じページ内の見出しへ飛ぶ。",
  },
  {
    a: "navbar",
    b: "appbar",
    distinction:
      "ナビゲーションバーは主要な行き先を並べる。アプリバーは画面名と戻る・操作を置く上部の帯。",
  },
  {
    a: "sidebar",
    b: "drawer",
    distinction:
      "サイドバーは常に表示され、画面の一部として場所を取る。ドロワーは普段隠れていて、開いたときだけ出る。",
  },
  {
    a: "table",
    b: "datagrid",
    distinction:
      "テーブルは値を並べて見せる。データグリッドは並べ替え・選択・編集など操作を伴う。",
  },
  {
    a: "barchart",
    b: "linechart",
    distinction:
      "棒グラフは項目どうしの量を比べる。折れ線グラフは時間に沿った変化を読む。",
  },
  {
    a: "donut",
    b: "gauge",
    distinction:
      "ドーナツチャートは全体に対する内訳の割合を示す。ゲージは1つの値が上限のどこまで達したかを示す。",
  },
  {
    a: "heatmap",
    b: "barchart",
    distinction:
      "ヒートマップは2つの軸の組み合わせを色の濃淡で示す。棒グラフは1つの軸の量を長さで示す。",
  },
  {
    a: "sparkline",
    b: "linechart",
    distinction:
      "スパークラインは軸も目盛りも省いた小さな推移。折れ線グラフは軸と目盛りを持ち、値を読み取れる。",
  },
  {
    a: "chip",
    b: "tagsinput",
    distinction:
      "チップは選んだ条件を表す表示で、押して外す。タグ入力は文字を打って新しい札を足す入力欄。",
  },
  {
    a: "helpertext",
    b: "inlinevalidation",
    distinction:
      "ヘルパーテキストは入力前に形式を伝える補足。その場検証は入力後に不備を知らせる。",
  },
  {
    a: "errormessage",
    b: "inlinevalidation",
    distinction:
      "エラーメッセージは処理に失敗した結果を伝える。その場検証は入力の不備をその場で知らせる。",
  },
  {
    a: "commandpalette",
    b: "searchfield",
    distinction:
      "コマンドパレットは機能名を打って操作を実行する。検索フィールドは打った語で内容を探す。",
  },
  {
    a: "megamenu",
    b: "dropdown",
    distinction:
      "メガメニューは複数列の大きな一覧を一度に見せる。ドロップダウンは短い操作の一覧を開く。",
  },
  {
    a: "toolbar",
    b: "menubar",
    distinction:
      "ツールバーはアイコンで操作を1回で実行する。メニューバーは見出しを押して一覧を開く。",
  },
  {
    a: "lightbox",
    b: "modal",
    distinction:
      "ライトボックスは画像を大きく見せるための表示。モーダルは確認や入力のためのダイアログ。",
  },
  {
    a: "countdown",
    b: "progressbar",
    distinction:
      "カウントダウンは残り時間を数字で減らす。プログレスバーは進み具合を棒の長さで示す。",
  },
  {
    a: "hero",
    b: "banner",
    distinction:
      "ヒーローはページ冒頭の大きな領域で、何のページかを伝える。バナーは告知を帯で知らせる。",
  },
  {
    a: "stickyheader",
    b: "appbar",
    distinction:
      "追従ヘッダーは一覧の見出しを残すためのもの。アプリバーは画面名と操作を置く上部の帯。",
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
    aliases: ["ドラッグ&ドロップ領域", "ドロップエリア"],
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
    aliases: ["その場編集", "ダブルクリック編集"],
    description:
      "表示中の文字をその場で編集可能にし、別画面へ移らずに更新する操作。",
    exampleInstruction: "タスク名はインライン編集にして、ダブルクリックで直せるようにして。",
    reversePrompt: "一覧の文字を、別画面に移らずその場で直せるようにしたい。",
    demoType: "inlineedit",
    category: "form",
  },
  {
    id: "treeview",
    kind: "term",
    nameJa: "ツリービュー",
    nameEn: "Tree view",
    reading: "つりーびゅー",
    aliases: ["ツリー", "階層リスト"],
    description:
      "親子の階層を展開・折りたたみしながら辿る一覧。フォルダ構成や組織図のように入れ子の関係を見せる。",
    exampleInstruction: "ファイル一覧はツリービューにして、フォルダを開閉できるようにして。",
    reversePrompt: "フォルダの中にフォルダが入る構造を、開閉しながら辿れるようにしたい。",
    demoType: "treeview",
    category: "data",
  },
  {
    id: "datagrid",
    kind: "term",
    nameJa: "データグリッド",
    nameEn: "Data grid",
    reading: "でーたぐりっど",
    aliases: ["グリッドテーブル", "編集可能な表"],
    description:
      "行と列を並べ、並べ替え・選択・編集までできる表。単なる表示用の表より操作が多い。",
    exampleInstruction: "管理画面の一覧はデータグリッドにして、列で並べ替えできるようにして。",
    reversePrompt: "一覧を表で見せたい。列の見出しを押して並べ替え、行も選べるようにしたい。",
    demoType: "datagrid",
    category: "data",
  },
  {
    id: "barchart",
    kind: "term",
    nameJa: "棒グラフ",
    nameEn: "Bar chart",
    reading: "ぼうぐらふ",
    aliases: ["バーチャート"],
    description:
      "項目ごとの量を棒の長さで比べるグラフ。大小の比較に向き、時系列の連続性は表しにくい。",
    exampleInstruction: "月別の売上は棒グラフにして、多い月が一目で分かるようにして。",
    reversePrompt: "項目どうしの量の大小を、長さで見比べられるようにしたい。",
    demoType: "barchart",
    category: "data",
  },
  {
    id: "linechart",
    kind: "term",
    nameJa: "折れ線グラフ",
    nameEn: "Line chart",
    reading: "おれせんぐらふ",
    aliases: ["ラインチャート"],
    description:
      "時間に沿った値の変化を線でつなぐグラフ。増減や傾向を読むのに向く。",
    exampleInstruction: "日ごとのアクセス数は折れ線グラフにして、増減の傾向を見せて。",
    reversePrompt: "時間とともに値がどう変わったかを、線の傾きで読めるようにしたい。",
    demoType: "linechart",
    category: "data",
  },
  {
    id: "donut",
    kind: "term",
    nameJa: "ドーナツチャート",
    nameEn: "Donut chart",
    reading: "どーなつちゃーと",
    aliases: ["ドーナツグラフ", "円グラフ"],
    description:
      "円を輪切りにして構成比を見せるグラフ。中央が空くぶん、合計値を中央に置ける。",
    exampleInstruction: "流入元の内訳はドーナツチャートにして、中央に合計を出して。",
    reversePrompt: "全体に対する内訳の割合を、円を分けて見せたい。",
    demoType: "donut",
    category: "data",
  },
  {
    id: "gauge",
    kind: "term",
    nameJa: "ゲージ",
    nameEn: "Gauge",
    reading: "げーじ",
    aliases: ["メーター", "ゲージチャート"],
    description:
      "現在値が上限に対してどのあたりかを、弧や針で示す表示。達成度や負荷の目安に使う。",
    exampleInstruction: "ストレージ使用量はゲージで、上限に近づいたら色を変えて。",
    reversePrompt: "いまの値が上限までどのくらいかを、弧の伸びで示したい。",
    demoType: "gauge",
    category: "data",
  },
  {
    id: "heatmap",
    kind: "term",
    nameJa: "ヒートマップ",
    nameEn: "Heatmap",
    reading: "ひーとまっぷ",
    aliases: ["ヒートマップチャート"],
    description:
      "格子を色の濃淡で塗り、値の大小を面で見せる表示。密なデータの偏りを探すのに向く。",
    exampleInstruction: "曜日と時間帯ごとの利用数をヒートマップにして、混む時間を分かるようにして。",
    reversePrompt: "縦横の組み合わせごとの値の大小を、色の濃さで見比べたい。",
    demoType: "heatmap",
    category: "data",
  },
  {
    id: "sparkline",
    kind: "term",
    nameJa: "スパークライン",
    nameEn: "Sparkline",
    reading: "すぱーくらいん",
    aliases: ["ミニチャート"],
    description:
      "軸や目盛りを省いた小さな折れ線。表の行内など狭い場所に傾向だけを添える。",
    exampleInstruction: "一覧の各行にスパークラインを添えて、直近の推移が分かるようにして。",
    reversePrompt: "表の行の中に、目盛りなしの小さな推移だけを添えたい。",
    demoType: "sparkline",
    category: "data",
  },
  {
    id: "legend",
    kind: "term",
    nameJa: "凡例",
    nameEn: "Legend",
    reading: "はんれい",
    aliases: ["レジェンド", "凡例表示"],
    description:
      "グラフの色や線が何を表すかを示す対応表。押して表示を切り替えられることも多い。",
    exampleInstruction: "グラフの下に凡例を置いて、色と項目名の対応が分かるようにして。",
    reversePrompt: "グラフの色が何の項目なのかを、対応表で示したい。",
    demoType: "legend",
    category: "data",
  },
  {
    id: "filterbar",
    kind: "term",
    nameJa: "フィルターバー",
    nameEn: "Filter bar",
    reading: "ふぃるたーばー",
    aliases: ["絞り込みバー", "フィルタ"],
    description:
      "一覧の上に置き、条件を指定して表示を絞り込む入力の並び。適用中の条件も見せる。",
    exampleInstruction: "一覧の上にフィルターバーを置いて、状態と期間で絞り込めるようにして。",
    reversePrompt: "一覧の上で条件を指定して、表示する行を減らしたい。",
    demoType: "filterbar",
    category: "data",
  },
  {
    id: "appbar",
    kind: "term",
    nameJa: "アプリバー",
    nameEn: "App bar",
    reading: "あぷりばー",
    aliases: ["トップバー", "ヘッダーバー"],
    description:
      "画面上部に固定し、画面名と主要な操作を置く横長の領域。スクロールしても残る。",
    exampleInstruction: "画面上部のアプリバーに、戻るボタンと画面名を置いて。",
    reversePrompt: "画面上部に、画面名と戻る操作を常に残しておきたい。",
    demoType: "appbar",
    category: "layout",
  },
  {
    id: "footer",
    kind: "term",
    nameJa: "フッター",
    nameEn: "Footer",
    reading: "ふったー",
    aliases: ["ページ下部", "フッタ"],
    description:
      "画面やページの末尾に置く領域。著作権表示や補助リンクなど、本文より優先度の低い情報をまとめる。",
    exampleInstruction: "ページのフッターに、利用規約とプライバシーポリシーのリンクを置いて。",
    reversePrompt: "本文のあとに、補助的なリンクをまとめて置きたい。",
    demoType: "footer",
    category: "layout",
  },
  {
    id: "hero",
    kind: "term",
    nameJa: "ヒーロー",
    nameEn: "Hero",
    reading: "ひーろー",
    aliases: ["ヒーローセクション", "メインビジュアル"],
    description:
      "ページの冒頭に置く大きな領域。何のページかを一目で伝える見出しと主要な操作をまとめる。",
    exampleInstruction: "トップページのヒーローに、サービス名と開始ボタンを大きく置いて。",
    reversePrompt: "ページを開いた瞬間に、何のページかと主要な操作を大きく見せたい。",
    demoType: "hero",
    category: "layout",
  },
  {
    id: "divider",
    kind: "term",
    nameJa: "ディバイダー",
    nameEn: "Divider",
    reading: "でぃばいだー",
    aliases: ["区切り線", "セパレーター"],
    description:
      "内容のまとまりを分ける細い線。余白だけでは伝わりにくい区切りを明示する。",
    exampleInstruction: "設定項目のまとまりの間にディバイダーを入れて、区切りを分かりやすくして。",
    reversePrompt: "項目のまとまりの境目を、細い線で示したい。",
    demoType: "divider",
    category: "layout",
  },
  {
    id: "stickyheader",
    kind: "term",
    nameJa: "追従ヘッダー",
    nameEn: "Sticky header",
    reading: "ついじゅうへっだー",
    aliases: ["固定ヘッダー", "スティッキーヘッダー"],
    description:
      "スクロールしても画面上部に留まる見出し。長い一覧でも列の意味を見失わない。",
    exampleInstruction: "長い一覧の見出しは追従ヘッダーにして、スクロールしても残るようにして。",
    reversePrompt: "長い一覧を下までスクロールしても、見出しを画面に残しておきたい。",
    demoType: "stickyheader",
    category: "layout",
  },
  {
    id: "codeblock",
    kind: "term",
    nameJa: "コードブロック",
    nameEn: "Code block",
    reading: "こーどぶろっく",
    aliases: ["コード表示", "コードスニペット"],
    description:
      "等幅フォントでコードを整形して見せる領域。コピーや折り返しの制御を添えることが多い。",
    exampleInstruction: "設定例はコードブロックで見せて、コピーボタンを付けて。",
    reversePrompt: "プログラムの例を、字下げを保ったまま読める形で見せたい。",
    demoType: "codeblock",
    category: "content",
  },
  {
    id: "kbd",
    kind: "term",
    nameJa: "キー表示",
    nameEn: "Kbd",
    reading: "きーひょうじ",
    aliases: ["キーボードキー表示", "キーキャップ"],
    description:
      "キーボードのキーを、押すべき物理キーの形で示す小さな表示。ショートカットの案内に使う。",
    exampleInstruction: "検索のショートカットはキー表示で「Ctrl + K」と添えて。",
    reversePrompt: "ショートカットのキーを、実際のキーの形で示したい。",
    demoType: "kbd",
    category: "content",
  },
  {
    id: "multiselect",
    kind: "term",
    nameJa: "マルチセレクト",
    nameEn: "Multi-select",
    reading: "まるちせれくと",
    aliases: ["複数選択", "複数選択セレクト"],
    description:
      "一覧から複数の値を選べる選択欄。選んだ値は札やカンマ区切りで見せる。",
    exampleInstruction: "タグの絞り込みはマルチセレクトにして、複数の条件を選べるようにして。",
    reversePrompt: "一覧から1つではなく、いくつでも選べるようにしたい。",
    demoType: "multiselect",
    category: "form",
  },
  {
    id: "tagsinput",
    kind: "term",
    nameJa: "タグ入力",
    nameEn: "Tags input",
    reading: "たぐにゅうりょく",
    aliases: ["タグフィールド", "チップ入力"],
    description:
      "文字を打って確定すると、その語が札になって並ぶ入力欄。複数の語を溜められる。",
    exampleInstruction: "記事のキーワードはタグ入力にして、Enterで札を足せるようにして。",
    reversePrompt: "打ち込んだ語を、確定するたびに札として並べていきたい。",
    demoType: "tagsinput",
    category: "form",
  },
  {
    id: "otpinput",
    kind: "term",
    nameJa: "ワンタイムコード入力",
    nameEn: "OTP input",
    reading: "わんたいむこーどにゅうりょく",
    aliases: ["確認コード入力", "分割コード入力"],
    description:
      "桁ごとに区切った入力欄へ、届いた確認コードを入れる欄。1桁入るごとに次へ移る。",
    exampleInstruction: "二段階認証のコードはワンタイムコード入力にして、6桁を1マスずつ入れて。",
    reversePrompt: "6桁の数字を、1桁ずつ区切ったマスに入れさせたい。",
    demoType: "otpinput",
    category: "form",
  },
  {
    id: "passwordfield",
    kind: "term",
    nameJa: "パスワード欄",
    nameEn: "Password field",
    reading: "ぱすわーどらん",
    aliases: ["パスワード入力", "伏せ字入力"],
    description:
      "入力した文字を伏せ字で隠す入力欄。表示を切り替えて確認できるようにする場合が多い。",
    exampleInstruction: "パスワード欄には、伏せ字の切り替えボタンを付けて。",
    reversePrompt: "入力した文字を隠したいが、必要なら確認できるようにもしたい。",
    demoType: "passwordfield",
    category: "form",
  },
  {
    id: "numberinput",
    kind: "term",
    nameJa: "数値入力",
    nameEn: "Number input",
    reading: "すうちにゅうりょく",
    aliases: ["ステッパー入力", "数値フィールド"],
    description:
      "数値だけを受け付け、増減ボタンで1つずつ変えられる入力欄。範囲の制限も添える。",
    exampleInstruction: "数量は数値入力にして、増減ボタンと上限を付けて。",
    reversePrompt: "数を入れたい。ボタンで1つずつ増やしたり減らしたりもしたい。",
    demoType: "numberinput",
    category: "form",
  },
  {
    id: "timeselect",
    kind: "term",
    nameJa: "時刻選択",
    nameEn: "Time select",
    reading: "じこくせんたく",
    aliases: ["タイムピッカー", "時刻ピッカー"],
    description:
      "時と分を選んで時刻を決める入力。日付の選択とは別に用意することが多い。",
    exampleInstruction: "予約の開始時刻は時刻選択にして、15分刻みで選べるようにして。",
    reversePrompt: "日付ではなく、何時何分かを選ばせたい。",
    demoType: "timeselect",
    category: "form",
  },
  {
    id: "rangepicker",
    kind: "term",
    nameJa: "期間選択",
    nameEn: "Range picker",
    reading: "きかんせんたく",
    aliases: ["レンジピッカー", "日付範囲選択"],
    description:
      "始まりと終わりの2点を選んで期間を決める入力。片方だけでは確定しない。",
    exampleInstruction: "売上の絞り込みは期間選択にして、開始日と終了日を選べるようにして。",
    reversePrompt: "1日ではなく、始まりと終わりの2つを選んで範囲を決めたい。",
    demoType: "rangepicker",
    category: "form",
  },
  {
    id: "fileupload",
    kind: "term",
    nameJa: "ファイルアップロード",
    nameEn: "File upload",
    reading: "ふぁいるあっぷろーど",
    aliases: ["ファイル選択", "アップロード欄"],
    description:
      "端末のファイルを選んで送る入力。選んだファイル名と進み具合を見せる。",
    exampleInstruction: "請求書はファイルアップロードにして、PDFだけ受け付けて。",
    reversePrompt: "端末に入っているファイルを選んで送りたい。",
    demoType: "fileupload",
    category: "form",
  },
  {
    id: "fieldset",
    kind: "term",
    nameJa: "フィールドセット",
    nameEn: "Fieldset",
    reading: "ふぃーるどせっと",
    aliases: ["入力グループ", "項目グループ"],
    description:
      "関係する入力項目をひとまとまりにし、見出しを付けて囲う領域。まとまりの意味を伝える。",
    exampleInstruction: "住所の入力はフィールドセットで囲って、見出しを付けて。",
    reversePrompt: "関係する入力欄を、見出し付きのひとまとまりにしたい。",
    demoType: "fieldset",
    category: "form",
  },
  {
    id: "helpertext",
    kind: "term",
    nameJa: "ヘルパーテキスト",
    nameEn: "Helper text",
    reading: "へるぱーてきすと",
    aliases: ["補足文", "入力ヒント"],
    description:
      "入力欄の下に添える短い補足。何を入れるか、どんな形式かを入力前に伝える。",
    exampleInstruction: "パスワード欄の下にヘルパーテキストで条件を書いて。",
    reversePrompt: "入力する前に、どんな形式で入れればよいかを短く伝えたい。",
    demoType: "helpertext",
    category: "form",
  },
  {
    id: "inlinevalidation",
    kind: "term",
    nameJa: "その場検証",
    nameEn: "Inline validation",
    reading: "そのばけんしょう",
    aliases: ["インライン検証", "入力時エラー"],
    description:
      "送信を待たず、入力した直後にその欄の不備を知らせる仕組み。直す場所がすぐ分かる。",
    exampleInstruction: "メール欄はその場検証にして、形式が違えばすぐ赤く出して。",
    reversePrompt: "送信ボタンを押す前でも、入力の間違いに気づけるようにしたい。",
    demoType: "inlinevalidation",
    category: "form",
  },
  {
    id: "checkboxgroup",
    kind: "term",
    nameJa: "チェックボックスグループ",
    nameEn: "Checkbox group",
    reading: "ちぇっくぼっくすぐるーぷ",
    aliases: ["複数チェック", "チェック群"],
    description:
      "同じ問いに対する複数のチェックボックスをまとめたもの。いくつでも選べる。",
    exampleInstruction: "通知の種類はチェックボックスグループにして、複数選べるようにして。",
    reversePrompt: "1つの問いに対して、当てはまるものをいくつでも選ばせたい。",
    demoType: "checkboxgroup",
    category: "form",
  },
  {
    id: "popconfirm",
    kind: "term",
    nameJa: "ポップ確認",
    nameEn: "Popconfirm",
    reading: "ぽっぷかくにん",
    aliases: ["インライン確認", "確認ポップアップ"],
    description:
      "操作した要素のすぐそばに小さく出る確認。画面全体を覆わないので、流れを止めにくい。",
    exampleInstruction: "削除ボタンはポップ確認にして、その場で「削除」「やめる」を選ばせて。",
    reversePrompt: "取り消せない操作の前に確認したいが、画面全体は覆いたくない。",
    demoType: "popconfirm",
    category: "overlay",
  },
  {
    id: "lightbox",
    kind: "term",
    nameJa: "ライトボックス",
    nameEn: "Lightbox",
    reading: "らいとぼっくす",
    aliases: ["画像拡大表示", "画像ビューア"],
    description:
      "背景を暗く落として画像を大きく見せる表示。閉じるまで元の画面は操作できない。",
    exampleInstruction: "ギャラリーの画像はライトボックスで、押したら大きく見せて。",
    reversePrompt: "一覧の画像を押したら、背景を暗くして大きく見せたい。",
    demoType: "lightbox",
    category: "overlay",
  },
  {
    id: "coachmark",
    kind: "term",
    nameJa: "コーチマーク",
    nameEn: "Coach mark",
    reading: "こーちまーく",
    aliases: ["操作案内", "オンボーディングヒント"],
    description:
      "特定の要素を指して、初回だけ操作を案内する吹き出し。画面全体の説明とは違い、対象を絞る。",
    exampleInstruction: "初回だけ、新しいボタンにコーチマークで案内を出して。",
    reversePrompt: "初めて来た人に、この部分の使い方だけを指して教えたい。",
    demoType: "coachmark",
    category: "overlay",
  },
  {
    id: "notification",
    kind: "term",
    nameJa: "通知センター",
    nameEn: "Notification center",
    reading: "つうちせんたー",
    aliases: ["通知一覧", "通知パネル"],
    description:
      "届いた通知を一覧に溜めて見返せる場所。一時的に消えるトーストと違い、履歴が残る。",
    exampleInstruction: "通知は通知センターに溜めて、未読が分かるようにして。",
    reversePrompt: "一時的に消えるのではなく、あとから見返せる形で通知を残したい。",
    demoType: "notification",
    category: "feedback",
  },
  {
    id: "sheet",
    kind: "term",
    nameJa: "シート",
    nameEn: "Sheet",
    reading: "しーと",
    aliases: ["補助パネル", "サイドシート"],
    description:
      "画面の端から出る補助的なパネル。ドロワーより狭く、詳細の確認や短い編集に使う。",
    exampleInstruction: "行を押したらシートで詳細を出して、一覧は見えたままにして。",
    reversePrompt: "一覧を隠さずに、選んだ項目の詳細を横から出したい。",
    demoType: "sheet",
    category: "overlay",
  },
  {
    id: "commandpalette",
    kind: "term",
    nameJa: "コマンドパレット",
    nameEn: "Command palette",
    reading: "こまんどぱれっと",
    aliases: ["コマンド検索", "クイックコマンド"],
    description:
      "ショートカットで開き、機能名を打ち込んで実行する検索窓。メニューを辿らず目的の操作に届く。",
    exampleInstruction: "どの画面からでもコマンドパレットを開いて、機能を検索できるようにして。",
    reversePrompt: "メニューを辿らず、機能名を打ち込んでその操作を実行したい。",
    demoType: "commandpalette",
    category: "navigation",
  },
  {
    id: "megamenu",
    kind: "term",
    nameJa: "メガメニュー",
    nameEn: "Mega menu",
    reading: "めがめにゅー",
    aliases: ["大型メニュー", "多列メニュー"],
    description:
      "項目にカーソルを合わせると、複数列の大きな一覧が開くメニュー。階層の深い項目を一度に見せる。",
    exampleInstruction: "商品カテゴリはメガメニューにして、分類をまとめて見せて。",
    reversePrompt: "項目が多いので、カーソルを合わせたときに複数列でまとめて見せたい。",
    demoType: "megamenu",
    category: "navigation",
  },
  {
    id: "menubar",
    kind: "term",
    nameJa: "メニューバー",
    nameEn: "Menu bar",
    reading: "めにゅーばー",
    aliases: ["メニュー行", "横並びメニュー"],
    description:
      "横一列に並んだメニューの見出し。押すと各項目の一覧が開く。",
    exampleInstruction: "アプリ上部にメニューバーを置いて、「ファイル」「編集」を並べて。",
    reversePrompt: "画面上部に、横並びのメニュー見出しを置きたい。",
    demoType: "menubar",
    category: "navigation",
  },
  {
    id: "toolbar",
    kind: "term",
    nameJa: "ツールバー",
    nameEn: "Toolbar",
    reading: "つーるばー",
    aliases: ["操作バー", "アイコンバー"],
    description:
      "よく使う操作をアイコンで横に並べた帯。メニューを開かず1回で実行できる。",
    exampleInstruction: "エディタの上にツールバーを置いて、太字や保存を並べて。",
    reversePrompt: "よく使う操作を、メニューを開かず1回で押せるようにしたい。",
    demoType: "toolbar",
    category: "navigation",
  },
  {
    id: "backtotop",
    kind: "term",
    nameJa: "先頭へ戻る",
    nameEn: "Back to top",
    reading: "せんとうへもどる",
    aliases: ["トップへ戻る", "ページ先頭ボタン"],
    description:
      "長いページの途中から、先頭へ一気に戻るボタン。スクロールが深いときだけ現れることが多い。",
    exampleInstruction: "長い記事では、右下に先頭へ戻るボタンを出して。",
    reversePrompt: "長いページの下の方から、一気に上へ戻りたい。",
    demoType: "backtotop",
    category: "navigation",
  },
  {
    id: "skiplink",
    kind: "term",
    nameJa: "スキップリンク",
    nameEn: "Skip link",
    reading: "すきっぷりんく",
    aliases: ["本文へスキップ", "スキップナビ"],
    description:
      "キーボード操作の最初に現れ、繰り返しのナビゲーションを飛ばして本文へ移るリンク。",
    exampleInstruction: "キーボード操作向けに、最初にスキップリンクを置いて。",
    reversePrompt: "キーボードだけで操作する人が、毎回のメニューを飛ばして本文へ行けるようにしたい。",
    demoType: "skiplink",
    category: "navigation",
  },
  {
    id: "loadmore",
    kind: "term",
    nameJa: "もっと見る",
    nameEn: "Load more",
    reading: "もっとみる",
    aliases: ["追加読み込み", "さらに読み込む"],
    description:
      "一覧の末尾に置き、押すと続きを読み込むボタン。自動で読み込む方式より位置が分かりやすい。",
    exampleInstruction: "一覧は最初の20件だけ出して、下に「もっと見る」を置いて。",
    reversePrompt: "一覧の続きを、自動ではなく押したときだけ読み込みたい。",
    demoType: "loadmore",
    category: "navigation",
  },
  {
    id: "dotindicator",
    kind: "term",
    nameJa: "ドットインジケーター",
    nameEn: "Dot indicator",
    reading: "どっといんじけーたー",
    aliases: ["ページドット", "インジケーター"],
    description:
      "横に並んだ点で、いま何枚目かを示す表示。カルーセルで現在位置を伝える。",
    exampleInstruction: "カルーセルの下にドットインジケーターを置いて、何枚目かを示して。",
    reversePrompt: "横に並んだ何枚ものうち、いまどれを見ているかを点で示したい。",
    demoType: "dotindicator",
    category: "navigation",
  },
  {
    id: "anchorlinks",
    kind: "term",
    nameJa: "目次リンク",
    nameEn: "Anchor links",
    reading: "もくじりんく",
    aliases: ["ページ内リンク", "アンカーリンク"],
    description:
      "同じページ内の見出しへ飛ぶリンクの一覧。長い文書の全体像と現在地を示す。",
    exampleInstruction: "長い仕様書の冒頭に目次リンクを置いて、各節へ飛べるようにして。",
    reversePrompt: "長い文書の中で、各節へすぐ飛べる一覧を冒頭に置きたい。",
    demoType: "anchorlinks",
    category: "navigation",
  },
  {
    id: "progressnav",
    kind: "term",
    nameJa: "読了バー",
    nameEn: "Reading progress",
    reading: "どくりょうばー",
    aliases: ["読了位置バー", "スクロール進捗"],
    description:
      "記事をどこまで読んだかを、上部の細いバーで示す表示。残りの量が分かる。",
    exampleInstruction: "長い記事の上部に読了バーを出して、どこまで読んだか分かるようにして。",
    reversePrompt: "記事のどこまで読んだかを、細いバーで示したい。",
    demoType: "progressnav",
    category: "navigation",
  },
  {
    id: "pulltorefresh",
    kind: "term",
    nameJa: "引っ張って更新",
    nameEn: "Pull to refresh",
    reading: "ひっぱってこうしん",
    aliases: ["プルリフレッシュ", "引っぱり更新"],
    description:
      "一覧を下へ引っ張ると最新を取り直す操作。スマホで慣れた更新の仕方。",
    exampleInstruction: "スマホの一覧は引っ張って更新できるようにして。",
    reversePrompt: "スマホで一覧を下へ引っ張ったら、最新を取り直したい。",
    demoType: "pulltorefresh",
    category: "navigation",
  },
  {
    id: "errormessage",
    kind: "term",
    nameJa: "エラーメッセージ",
    nameEn: "Error message",
    reading: "えらーめっせーじ",
    aliases: ["エラー文", "失敗表示"],
    description:
      "処理に失敗した理由と、次にできることを伝える文。謝るより、どう直すかを書く。",
    exampleInstruction: "保存に失敗したら、エラーメッセージで理由と再試行を出して。",
    reversePrompt: "失敗したときに、何が起きたかと次に何をすればよいかを伝えたい。",
    demoType: "errormessage",
    category: "feedback",
  },
  {
    id: "callout",
    kind: "term",
    nameJa: "コールアウト",
    nameEn: "Callout",
    reading: "こーるあうと",
    aliases: ["注意ブロック", "補足ボックス"],
    description:
      "本文から目立たせたい補足を、枠と色で囲んで示すブロック。注意や前提の共有に使う。",
    exampleInstruction: "この設定は課金に影響するので、コールアウトで目立たせて。",
    reversePrompt: "本文の中で、特に読んでほしい注意を枠で目立たせたい。",
    demoType: "callout",
    category: "feedback",
  },
  {
    id: "countdown",
    kind: "term",
    nameJa: "カウントダウン",
    nameEn: "Countdown",
    reading: "かうんとだうん",
    aliases: ["残り時間表示", "タイマー表示"],
    description:
      "期限までの残り時間を減らしながら見せる表示。締切のある操作の判断を助ける。",
    exampleInstruction: "セール終了まではカウントダウンで残り時間を出して。",
    reversePrompt: "期限までの残りを、減っていく数字で見せたい。",
    demoType: "countdown",
    category: "feedback",
  },
  {
    id: "loadingbar",
    kind: "term",
    nameJa: "ローディングバー",
    nameEn: "Loading bar",
    reading: "ろーでぃんぐばー",
    aliases: ["読み込みバー", "プログレスライン"],
    description:
      "画面上部などに細く出る読み込み中の帯。画面全体を覆わず、待っていることを伝える。",
    exampleInstruction: "画面遷移中は上部にローディングバーを出して。",
    reversePrompt: "画面を覆わずに、いま読み込み中だと伝えたい。",
    demoType: "loadingbar",
    category: "feedback",
  },
  {
    id: "inlinealert",
    kind: "term",
    nameJa: "インラインアラート",
    nameEn: "Inline alert",
    reading: "いんらいんあらーと",
    aliases: ["その場の注意", "インライン通知"],
    description:
      "画面全体ではなく、関係する場所のすぐそばに出す注意表示。文脈から切り離さずに伝える。",
    exampleInstruction: "この項目だけの注意は、インラインアラートで欄の近くに出して。",
    reversePrompt: "画面全体に出すほどではない注意を、関係する場所のそばに出したい。",
    demoType: "inlinealert",
    category: "feedback",
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

/**
 * 用語図鑑に並べる分類の順序。
 * ここに無いカテゴリの用語は図鑑に出ないので、全カテゴリを必ず含める（テストで検証）。
 */
export const CATEGORY_ORDER: QuestionCategory[] = [
  "overlay",
  "feedback",
  "navigation",
  "form",
  "disclosure",
  "content",
  "data",
  "layout",
];

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
