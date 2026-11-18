/**
 * 実践ケース。現場で迷いやすいUI選択を、判断の根拠が読み取れる短い要件文にする。
 *
 * 設計方針:
 * - 正解は1つ。要件文に「候補数・選択数・中断の可否・情報量」など判断の手がかりを必ず入れる。
 * - 文脈が足りず正解を1つに絞れないケースは載せない（曖昧な実務判断を正解にしない）。
 * - 誤答の理由は「その要件では条件が合わない」という形で書き、優劣は書かない。
 */
export interface PracticalCase {
  id: string;
  /** 正解の用語ID。 */
  answerId: string;
  /** 誤答の用語ID。3つ。 */
  distractorIds: [string, string, string];
  /** 要件文。名称・英語名・別名を含めない。 */
  prompt: string;
  /** 正解の理由。 */
  reason: string;
  /** 誤答それぞれが合わない理由。distractorIds と同じ順。 */
  distractorReasons: [string, string, string];
}

export const PRACTICAL_CASES: PracticalCase[] = [
  {
    id: "case-select-one",
    answerId: "select",
    distractorIds: ["multiselect", "combobox", "checkboxgroup"],
    prompt:
      "都道府県を1つだけ選ぶ欄がいる。候補は47件で固定。打ち込みで絞る必要はなく、選んだ値はフォームに残したい。",
    reason:
      "候補が固定で1つだけ選び、値をフォームに残すならセレクト。打ち込みで絞る必要がないので、入力欄を持つ必要もない。",
    distractorReasons: [
      "複数選べてしまうと、1つだけという条件を満たせない。",
      "打ち込みで絞る必要がないので、入力欄を持たせる意味がない。",
      "複数選べるうえ、選択肢を常に全部見せるので、47件では場所を取りすぎる。",
    ],
  },
  {
    id: "case-combobox-many",
    answerId: "combobox",
    distractorIds: ["select", "radio", "dropdown"],
    prompt:
      "取引先を1つ選ぶ欄がいる。候補は数百件あり、名前の一部を打ち込んで絞り込みたい。",
    reason:
      "候補が数百件あり、打ち込んで絞る必要があるならコンボボックス。入力欄と候補一覧を兼ねられる。",
    distractorReasons: [
      "数百件を一覧でスクロールさせることになり、目的の項目に届きにくい。",
      "数百件を常に並べる表示なので、そもそも置き場所が足りない。",
      "押すと操作の一覧が開くもので、値を絞り込む入力欄を持たない。",
    ],
  },
  {
    id: "case-multiselect-tags",
    answerId: "multiselect",
    distractorIds: ["select", "radio", "tabs"],
    prompt:
      "記事に付けるタグを、既存の一覧から複数選ばせたい。3つでも5つでも選べる。",
    reason:
      "既存の一覧から複数選ぶならマルチセレクト。選んだ値を複数保持できる。",
    distractorReasons: [
      "1つしか選べないので、複数付けるという条件を満たせない。",
      "1つを選ぶと他が外れるので、複数保持できない。",
      "表示内容を切り替えるもので、値を選んで保持する用途ではない。",
    ],
  },
  {
    id: "case-modal-confirm",
    answerId: "modal",
    distractorIds: ["popconfirm", "toast", "tooltip"],
    prompt:
      "アカウント削除の前に、必ず一度止めて確認させたい。取り消せない操作なので、背景は操作できないようにする。",
    reason:
      "取り消せない操作の前に、背景を操作不能にして確実に止めるならモーダル。",
    distractorReasons: [
      "要素のそばに小さく出るだけで、背景を覆わないため止める力が弱い。",
      "数秒で消える通知なので、確認を取る前に流れてしまう。",
      "読むだけの補足で、確認も操作も取れない。",
    ],
  },
  {
    id: "case-popconfirm-inline",
    answerId: "popconfirm",
    distractorIds: ["modal", "alert", "banner"],
    prompt:
      "一覧の各行にある削除ボタンで、その場で「削除」「やめる」を選ばせたい。行の作業は止めたくない。",
    reason:
      "押した要素のそばで小さく確認し、画面全体を覆わないならポップ確認。",
    distractorReasons: [
      "背景を覆ってしまうので、行の作業が止まる。",
      "結果や注意を出すだけで、その場で二択を選ばせる形にならない。",
      "画面幅の帯で告知するもので、行ごとの確認には向かない。",
    ],
  },
  {
    id: "case-toast-silent",
    answerId: "toast",
    distractorIds: ["snackbar", "modal", "banner"],
    prompt:
      "自動保存できたことを、操作を妨げずに数秒だけ知らせたい。取り消す操作は要らない。",
    reason:
      "操作を妨げず、数秒だけ知らせるならトースト。ボタンを添える必要がない。",
    distractorReasons: [
      "「元に戻す」などのボタンを添える前提のもので、今回は取り消しが要らない。",
      "背景を覆って操作を止めてしまうので、妨げないという条件に反する。",
      "閉じるまで残る帯なので、数秒だけという条件に合わない。",
    ],
  },
  {
    id: "case-snackbar-undo",
    answerId: "snackbar",
    distractorIds: ["toast", "alert", "tooltip"],
    prompt:
      "メールをアーカイブしたあと、画面下に短く出して「元に戻す」を押せるようにしたい。",
    reason:
      "短く出しつつ操作ボタンを添えられるのはスナックバー。取り消しの導線を同居させられる。",
    distractorReasons: [
      "操作ボタンを持たない前提なので、取り消しを添えられない。",
      "その場に注意を出すもので、取り消しの操作を添える形にならない。",
      "読むだけの補足で、押せる操作を置けない。",
    ],
  },
  {
    id: "case-tooltip-hover",
    answerId: "tooltip",
    distractorIds: ["popover", "modal", "coachmark"],
    prompt:
      "アイコンだけのボタンに、カーソルを合わせたときだけ短い説明を出したい。押せる要素は要らない。",
    reason:
      "カーソルを合わせると出る読むだけの補足ならツールチップ。",
    distractorReasons: [
      "クリックで開き、中に操作できる要素を置く前提のもの。",
      "背景を覆う確認用で、ホバーの補足には重すぎる。",
      "初回だけ対象を指して案内するもので、毎回の補足には向かない。",
    ],
  },
  {
    id: "case-popover-interactive",
    answerId: "popover",
    distractorIds: ["tooltip", "modal", "dropdown"],
    prompt:
      "共有ボタンを押したら、そのすぐ下に小さなパネルを開きたい。中にリンクとコピー用の入力欄を置く。",
    reason:
      "要素のそばに開き、中に操作できる要素を置けるのはポップオーバー。",
    distractorReasons: [
      "読むだけの補足なので、入力欄やリンクを置けない。",
      "背景を覆うほどではない小さなパネルなので、重すぎる。",
      "操作の一覧を開くもので、入力欄を中に置く用途ではない。",
    ],
  },
  {
    id: "case-drawer-nav",
    answerId: "drawer",
    distractorIds: ["sidebar", "bottomsheet", "sheet"],
    prompt:
      "スマホで、普段は隠しておいた主要メニューを、ボタンで左から出したい。画面を広く使いたい。",
    reason:
      "普段は隠れていて、端から出る主要メニューならドロワー。",
    distractorReasons: [
      "常に表示して場所を取るので、画面を広く使うという条件に反する。",
      "下から出るもので、左から出す指定と合わない。",
      "一覧を残したまま詳細を出す補助パネルで、主要メニューの置き場所ではない。",
    ],
  },
  {
    id: "case-bottomsheet-mobile",
    answerId: "bottomsheet",
    distractorIds: ["drawer", "modal", "sheet"],
    prompt:
      "スマホで、画面の下から縦にせり上がる操作メニューを出したい。上には今の内容を少し見せておきたい。",
    reason:
      "画面の下から縦にせり上がり、上を少し残せるのはボトムシート。",
    distractorReasons: [
      "左右の端から横に出るもので、下から縦という指定と合わない。",
      "中央に重なって背景を覆うので、上を少し見せる形にならない。",
      "横から出る補助パネルで、下からせり上がる形ではない。",
    ],
  },
  {
    id: "case-tabs-same-screen",
    answerId: "tabs",
    distractorIds: ["tabbar", "segmentedcontrol", "anchorlinks"],
    prompt:
      "同じ画面の中で、概要・詳細・履歴という別々の中身を切り替えたい。それぞれ内容は独立している。",
    reason:
      "同じ画面の中で、独立した内容を切り替えるならタブ。",
    distractorReasons: [
      "アプリの主要画面そのものを切り替えるもので、画面内の切り替えではない。",
      "同じ内容の見せ方を切り替えるもので、別々の中身の切り替えではない。",
      "同じページ内の見出しへ飛ぶもので、内容を差し替えるものではない。",
    ],
  },
  {
    id: "case-segmented-view",
    answerId: "segmentedcontrol",
    distractorIds: ["tabs", "radio", "dropdown"],
    prompt:
      "同じ一覧を「日・週・月」の粒度で見せ替えたい。内容は同じで、見せ方だけが変わる。",
    reason:
      "同じ内容の見せ方を切り替えるならセグメントコントロール。選択肢が少なく、常に見えている方が速い。",
    distractorReasons: [
      "独立した内容を切り替えるもので、見せ方の切り替えには重い。",
      "1つを選ぶ入力で、表示の切り替えには向かない。",
      "押して一覧を開くので、3択を見せるのに1手増える。",
    ],
  },
  {
    id: "case-tabbar-app",
    answerId: "tabbar",
    distractorIds: ["tabs", "menubar", "breadcrumb"],
    prompt:
      "スマホアプリで、ホーム・検索・設定という主要画面を画面下から切り替えたい。どの画面からでも押せるようにする。",
    reason:
      "アプリの主要画面を画面下から切り替えるならタブバー。",
    distractorReasons: [
      "画面内の内容を切り替えるもので、主要画面の切り替えではない。",
      "画面上部に横並びで置くもので、画面下という指定と合わない。",
      "階層の現在地を示すもので、切り替えの操作ではない。",
    ],
  },
  {
    id: "case-breadcrumb-depth",
    answerId: "breadcrumb",
    distractorIds: ["pagination", "anchorlinks", "tabs"],
    prompt:
      "階層の深い管理画面で、いまどこにいるかを示し、上位の階層へすぐ戻れるようにしたい。",
    reason:
      "階層の現在地を示し、上位へ戻る導線になるのはパンくずリスト。",
    distractorReasons: [
      "何ページ目かを移動するもので、階層の位置は示せない。",
      "同じページ内の見出しへ飛ぶもので、階層を遡れない。",
      "内容を切り替えるもので、現在地も示せない。",
    ],
  },
  {
    id: "case-pagination-known",
    answerId: "pagination",
    distractorIds: ["loadmore", "pulltorefresh", "progressbar"],
    prompt:
      "検索結果が全1200件ある。何ページ目を見ているかを示し、任意のページへ飛べるようにしたい。",
    reason:
      "総件数が分かっていて、任意のページへ飛ばせるのはページネーション。",
    distractorReasons: [
      "末尾から順に足していく方式なので、任意のページへは飛べない。",
      "引っ張って最新を取り直す操作で、ページ移動はできない。",
      "進み具合を見せるだけで、移動の操作はできない。",
    ],
  },
  {
    id: "case-loadmore-feed",
    answerId: "loadmore",
    distractorIds: ["pagination", "pulltorefresh", "carousel"],
    prompt:
      "タイムラインで、最初の20件だけ出し、続きは押したときだけ読み込みたい。読んでいた位置を保ちたい。",
    reason:
      "押したときだけ続きを足し、読んでいた位置を保てるのは「もっと見る」。",
    distractorReasons: [
      "ページを切り替えると、読んでいた位置が失われる。",
      "最新を取り直す操作で、続きを足すものではない。",
      "自動で足し続けると、読んでいた位置がずれていく。",
    ],
  },
  {
    id: "case-skeleton-shape",
    answerId: "skeleton",
    distractorIds: ["spinner", "progressbar", "emptystate"],
    prompt:
      "一覧の読み込み中に、これから入る行の形を先に置いて、表示が飛び跳ねないようにしたい。",
    reason:
      "これから入る内容の形を先に置くならスケルトン。読み込み後の位置ずれを抑えられる。",
    distractorReasons: [
      "回るだけで形を出さないので、位置ずれを抑えられない。",
      "進み具合を示す棒で、内容の形は示せない。",
      "中身が無いことを伝える表示で、読み込み中には使わない。",
    ],
  },
  {
    id: "case-spinner-unknown",
    answerId: "spinner",
    distractorIds: ["progressbar", "skeleton", "loadingbar"],
    prompt:
      "処理にどれくらいかかるか分からない。ボタンの中に、待っていることだけを示したい。",
    reason:
      "所要時間が分からず、狭い場所で待っていることだけを示すならスピナー。",
    distractorReasons: [
      "何割終わったかを示すものだが、今回は総量が分からない。",
      "内容の形を先に置くもので、ボタンの中に収める用途ではない。",
      "画面上部の帯なので、ボタンの中には置けない。",
    ],
  },
  {
    id: "case-progressbar-known",
    answerId: "progressbar",
    distractorIds: ["spinner", "loadingbar", "gauge"],
    prompt:
      "ファイルの転送で、全体の何割が終わったかを横棒で見せたい。総量は分かっている。",
    reason:
      "総量が分かっていて、何割終わったかを横棒で示すならプログレスバー。",
    distractorReasons: [
      "待っていることしか示せず、何割かを伝えられない。",
      "画面上部の細い帯で、転送の進み具合を本文中で示す用途ではない。",
      "1つの値が上限のどこかを示すもので、進捗の推移には向かない。",
    ],
  },
  {
    id: "case-alert-result",
    answerId: "alert",
    distractorIds: ["banner", "toast", "inlinealert"],
    prompt:
      "フォームの送信に失敗した。入力内容の上に、何が起きたかをその場に残して見せたい。",
    reason:
      "操作の結果をその場に残して見せるならアラート。",
    distractorReasons: [
      "画面幅の帯で告知するもので、送信結果の表示には向かない。",
      "数秒で消えるので、失敗の理由を読み切れないことがある。",
      "特定の入力欄のそばに出すもので、送信全体の失敗を示す場所ではない。",
    ],
  },
  {
    id: "case-inlinealert-field",
    answerId: "inlinealert",
    distractorIds: ["alert", "banner", "errormessage"],
    prompt:
      "特定の入力欄だけに関係する注意を、その欄のすぐ下に出したい。画面全体に出すほどではない。",
    reason:
      "関係する入力欄のすぐそばに出すならインラインアラート。",
    distractorReasons: [
      "画面や節の単位でまとめて出すので、欄ごとの注意には広すぎる。",
      "画面幅の帯で告知するもので、欄のそばには置けない。",
      "処理に失敗した結果を伝えるもので、入力前の注意には向かない。",
    ],
  },
  {
    id: "case-banner-announce",
    answerId: "banner",
    distractorIds: ["alert", "toast", "callout"],
    prompt:
      "サービス全体のお知らせを、画面上部に閉じるまで残る形で出したい。",
    reason:
      "画面幅いっぱいに置き、閉じるまで残る告知ならバナー。",
    distractorReasons: [
      "操作の結果や注意をその場に出すもので、全体告知の置き場所ではない。",
      "数秒で消えるので、閉じるまで残すという条件に合わない。",
      "本文の中に置く補足で、画面上部の帯にはならない。",
    ],
  },
  {
    id: "case-callout-note",
    answerId: "callout",
    distractorIds: ["banner", "alert", "inlinealert"],
    prompt:
      "説明文の途中で、課金に影響する前提を枠で囲んで目立たせたい。読み進める流れは止めたくない。",
    reason:
      "本文の中に枠付きで補足を置き、流れを止めないならコールアウト。",
    distractorReasons: [
      "画面上部の帯なので、本文の途中には置けない。",
      "操作の結果を出すもので、読み物の補足には向かない。",
      "入力欄のそばに出すもので、説明文の中には置けない。",
    ],
  },
  {
    id: "case-emptystate-first",
    answerId: "emptystate",
    distractorIds: ["skeleton", "spinner", "errormessage"],
    prompt:
      "まだ1件も登録がない一覧で、何も無いことを伝え、最初の1件を追加する導線を出したい。",
    reason:
      "中身が無いことを伝え、次の行動を促すなら空状態。",
    distractorReasons: [
      "読み込み中の形を置くもので、読み込みは終わっている。",
      "待っていることを示すもので、待つ必要がない状態には合わない。",
      "失敗を伝えるもので、まだ何もしていない状態には合わない。",
    ],
  },
  {
    id: "case-errormessage-recover",
    answerId: "errormessage",
    distractorIds: ["emptystate", "alert", "helpertext"],
    prompt:
      "通信に失敗して一覧を取れなかった。理由と、もう一度試す導線をその場に出したい。",
    reason:
      "失敗の理由と次にできることを伝えるならエラーメッセージ。",
    distractorReasons: [
      "中身が無いことを伝えるもので、失敗の理由は伝えられない。",
      "注意を出すもので、再試行の導線を伴う失敗表示としては不足する。",
      "入力前に形式を伝える補足で、通信の失敗は扱わない。",
    ],
  },
  {
    id: "case-helpertext-format",
    answerId: "helpertext",
    distractorIds: ["inlinevalidation", "errormessage", "textfield"],
    prompt:
      "パスワード欄に入れる前に、8文字以上で記号を含むという条件を短く伝えておきたい。",
    reason:
      "入力前に形式を伝えるならヘルパーテキスト。",
    distractorReasons: [
      "入力後に不備を知らせるもので、入力前の案内にはならない。",
        "1行の入力欄で、入力前に決まりを伝える仕組みを持たない。",
      "欄の中に薄く出す例示で、条件を読み取らせるには足りない。",
    ],
  },
  {
    id: "case-inlinevalidation-early",
    answerId: "inlinevalidation",
    distractorIds: ["helpertext", "errormessage", "alert"],
    prompt:
      "メール欄に打ち終えた直後、形式が違えば送信を待たずにその場で知らせたい。",
    reason:
      "入力した直後にその欄の不備を知らせるなら、その場検証。",
    distractorReasons: [
      "入力前に形式を伝えるもので、入力後の判定はしない。",
      "送信など処理の失敗を伝えるもので、入力の不備は扱わない。",
      "画面単位で出すもので、欄ごとの即時判定には広すぎる。",
    ],
  },
  {
    id: "case-datagrid-ops",
    answerId: "datagrid",
    distractorIds: ["table", "card", "timeline"],
    prompt:
      "管理画面の一覧で、列の見出しを押して並べ替え、行を選んで一括操作したい。",
    reason:
      "並べ替えや行の選択など操作を伴う表ならデータグリッド。",
    distractorReasons: [
      "値を並べて見せるもので、並べ替えや選択の操作は持たない。",
      "1件ずつを箱で見せるもので、列での並べ替えには向かない。",
      "時系列に出来事を並べるもので、表の操作はできない。",
    ],
  },
  {
    id: "case-treeview-hierarchy",
    answerId: "treeview",
    distractorIds: ["accordion", "table", "breadcrumb"],
    prompt:
      "フォルダの中にフォルダが入る構造を、開閉しながら目的のファイルまで辿りたい。",
    reason:
      "入れ子の階層を開閉しながら辿るならツリービュー。",
    distractorReasons: [
      "見出しの開閉はできるが、階層の入れ子は表せない。",
      "行と列に並べるもので、入れ子の構造は表せない。",
      "現在地を示すもので、中を辿る操作はできない。",
    ],
  },
  {
    id: "case-commandpalette-shortcut",
    answerId: "commandpalette",
    distractorIds: ["searchfield", "megamenu", "toolbar"],
    prompt:
      "どの画面からでも、機能名を打ち込んでその操作をすぐ実行したい。メニューを辿りたくない。",
    reason:
      "機能名を打ち込んで操作そのものを実行するならコマンドパレット。",
    distractorReasons: [
      "打った語で内容を探すもので、操作の実行はできない。",
      "カーソルを合わせて一覧を開くもので、打ち込みでは届かない。",
      "アイコンを並べるもので、機能名で探すことはできない。",
    ],
  },
  {
    id: "case-megamenu-categories",
    answerId: "megamenu",
    distractorIds: ["dropdown", "menubar", "sidebar"],
    prompt:
      "商品カテゴリが3階層あり、カーソルを合わせたときに複数列でまとめて見せたい。",
    reason:
      "階層の深い項目を複数列で一度に見せるならメガメニュー。",
    distractorReasons: [
      "短い操作の一覧を開くもので、複数列の大きな一覧にはならない。",
      "見出しを並べるだけで、複数列の展開はしない。",
      "常に表示して場所を取るもので、ホバーで開く形ではない。",
    ],
  },
  {
    id: "case-lightbox-image",
    answerId: "lightbox",
    distractorIds: ["modal", "popover", "carousel"],
    prompt:
      "ギャラリーの画像を押したら、背景を暗く落として大きく見せたい。閉じるまで元の画面は操作させない。",
    reason:
      "背景を暗く落として画像を大きく見せるならライトボックス。",
    distractorReasons: [
      "確認や入力のためのダイアログで、画像を見せる用途ではない。",
      "要素のそばに開く小さなパネルで、大きく見せるには狭い。",
      "複数の画像を横に切り替えるもので、1枚を大きく見せる表示ではない。",
    ],
  },
  {
    id: "case-coachmark-first",
    answerId: "coachmark",
    distractorIds: ["tooltip", "modal", "banner"],
    prompt:
      "初めて来た人に、新しく追加されたボタンの使い方だけを、その要素を指して案内したい。",
    reason:
      "初回だけ対象を指して操作を案内するならコーチマーク。",
    distractorReasons: [
      "カーソルを合わせるたびに出るもので、初回だけの案内にはならない。",
      "背景を覆うので、他の要素を見せながら案内できない。",
      "画面幅の帯で告知するもので、特定の要素を指せない。",
    ],
  },
  {
    id: "case-notification-history",
    answerId: "notification",
    distractorIds: ["toast", "snackbar", "badge"],
    prompt:
      "届いた通知をあとから見返したい。未読かどうかも一覧で分かるようにしたい。",
    reason:
      "通知を溜めて見返せるようにするなら通知センター。",
    distractorReasons: [
      "数秒で消えるので、あとから見返せない。",
      "短く出て操作を添えるもので、履歴は残らない。",
      "件数を示す小さな印で、通知の中身は見返せない。",
    ],
  },
  {
    id: "case-countdown-deadline",
    answerId: "countdown",
    distractorIds: ["progressbar", "gauge", "spinner"],
    prompt:
      "セール終了までの残り時間を、減っていく数字で見せたい。期限は決まっている。",
    reason:
      "期限までの残り時間を減らしながら見せるならカウントダウン。",
    distractorReasons: [
      "何割終わったかを示すもので、残り時間そのものは読めない。",
      "1つの値が上限のどこかを示すもので、時間の減少には向かない。",
      "待っていることを示すもので、期限は伝えられない。",
    ],
  },
  {
    id: "case-stickyheader-columns",
    answerId: "stickyheader",
    distractorIds: ["appbar", "table", "divider"],
    prompt:
      "長い一覧を下までスクロールしても、列の見出しを画面に残して意味を見失わないようにしたい。",
    reason:
      "スクロールしても見出しを残すなら追従ヘッダー。",
    distractorReasons: [
      "画面名と操作を置く上部の帯で、列の見出しを残すものではない。",
      "値を並べるもので、スクロール時に見出しを残す仕組みは持たない。",
      "区切りを示す線で、見出しを残す働きはない。",
    ],
  },
  {
    id: "case-kbd-shortcut",
    answerId: "kbd",
    distractorIds: ["codeblock", "tooltip", "chip"],
    prompt:
      "検索のショートカットを、押すキーそのものの形で案内したい。",
    reason:
      "押すべきキーを物理キーの形で示すならキー表示。",
    distractorReasons: [
      "コードを整形して見せるもので、キーの案内には向かない。",
      "カーソルを合わせたときの補足で、常時の案内にはならない。",
      "選んだ条件を表す札で、キーの表示ではない。",
    ],
  },
  {
    id: "case-tagsinput-enter",
    answerId: "tagsinput",
    distractorIds: ["chip", "multiselect", "textarea"],
    prompt:
      "記事のキーワードを、打ち込んで確定するたびに札として増やしていきたい。候補一覧は使わない。",
    reason:
      "打ち込んで確定するたびに札を足すならタグ入力。",
    distractorReasons: [
      "すでに選ばれた条件を表す表示で、新しく打ち込む欄ではない。",
      "既存の一覧から選ぶもので、自由に打ち込む形ではない。",
      "長文を入れる欄で、札として増やす仕組みは持たない。",
    ],
  },
  {
    id: "case-otp-code",
    answerId: "otpinput",
    distractorIds: ["textfield", "passwordfield", "numberinput"],
    prompt:
      "二段階認証で届いた6桁の数字を、1桁ずつ区切ったマスに入れさせたい。",
    reason:
      "桁ごとに区切ったマスへ入れるならワンタイムコード入力。",
    distractorReasons: [
      "1行の入力欄で、桁ごとの区切りがない。",
      "伏せ字にするもので、区切ったマスにはならない。",
      "増減ボタンで変えるもので、6桁を打ち込む用途ではない。",
    ],
  },
  {
    id: "case-rangepicker-period",
    answerId: "rangepicker",
    distractorIds: ["datepicker", "timeselect", "filterbar"],
    prompt:
      "売上の絞り込みで、開始日と終了日の2つを選んで期間を決めたい。片方だけでは確定しない。",
    reason:
      "始まりと終わりの2点を選んで範囲を決めるなら期間選択。",
    distractorReasons: [
      "1つの日付しか選べないので、範囲にならない。",
      "何時何分かを選ぶもので、日付の範囲は決められない。",
      "条件を並べる領域で、期間そのものを選ぶ部品ではない。",
    ],
  },
  {
    id: "case-fileupload-pdf",
    answerId: "fileupload",
    distractorIds: ["dropzone", "textfield", "lightbox"],
    prompt:
      "請求書のPDFを端末から選んで送りたい。選んだファイル名と進み具合も見せたい。",
    reason:
      "端末のファイルを選んで送り、進み具合も見せるならファイルアップロード。",
    distractorReasons: [
      "ドラッグで落とす操作が主で、押して選ぶ導線は別に要る。",
      "文字を入れる欄で、ファイルは送れない。",
      "画像を大きく見せる表示で、送信はできない。",
    ],
  },
  {
    id: "case-fieldset-group",
    answerId: "fieldset",
    distractorIds: ["divider", "card", "helpertext"],
    prompt:
      "住所の入力欄を、見出し付きのひとまとまりとして囲みたい。関係する項目だと分かるようにしたい。",
    reason:
      "関係する入力項目を見出し付きで囲うならフィールドセット。",
    distractorReasons: [
      "区切りの線だけで、まとまりの意味は伝わらない。",
      "内容を箱で見せるもので、入力のまとまりを示す用途ではない。",
      "欄の下の補足文で、まとまりを作るものではない。",
    ],
  },
  {
    id: "case-skiplink-keyboard",
    answerId: "skiplink",
    distractorIds: ["anchorlinks", "backtotop", "breadcrumb"],
    prompt:
      "キーボードだけで操作する人が、毎回のメニューを飛ばして本文へ移れるようにしたい。",
    reason:
      "キーボード操作の最初に現れ、繰り返しのナビゲーションを飛ばすならスキップリンク。",
    distractorReasons: [
      "同じページ内の見出しへ飛ぶもので、最初に現れて読み上げを飛ばす仕組みではない。",
      "下から上へ戻るボタンで、前方へ飛ばすものではない。",
      "階層の現在地を示すもので、読み上げを飛ばせない。",
    ],
  },
  {
    id: "case-backtotop-long",
    answerId: "backtotop",
    distractorIds: ["anchorlinks", "skiplink", "pagination"],
    prompt:
      "とても長い記事の下の方から、一気に先頭へ戻りたい。スクロールが深いときだけ出したい。",
    reason:
      "長いページの途中から先頭へ戻るなら「先頭へ戻る」。",
    distractorReasons: [
      "特定の見出しへ飛ぶもので、先頭へ戻る用途ではない。",
      "キーボード操作の最初に出すもので、途中から押す導線ではない。",
      "ページを移動するもので、同じページの先頭へは戻れない。",
    ],
  },
  {
    id: "case-progressnav-reading",
    answerId: "progressnav",
    distractorIds: ["progressbar", "countdown", "loadingbar"],
    prompt:
      "長い記事で、どこまで読んだかを上部の細いバーで示したい。",
    reason:
      "記事の読了位置を上部の細いバーで示すなら読了バー。",
    distractorReasons: [
      "処理の進み具合を示すもので、読んだ位置は表せない。",
      "残り時間を減らすもので、読了位置は示せない。",
      "読み込み中を示すもので、読む進み具合は表せない。",
    ],
  },
  {
    id: "case-pulltorefresh-mobile",
    answerId: "pulltorefresh",
    distractorIds: ["loadmore", "backtotop", "pagination"],
    prompt:
      "スマホの一覧で、下へ引っ張ったら最新を取り直したい。",
    reason:
      "一覧を下へ引っ張って最新を取り直すなら「引っ張って更新」。",
    distractorReasons: [
      "末尾から続きを足すもので、最新を取り直す操作ではない。",
      "先頭へ戻るボタンで、更新はしない。",
      "ページを移動するもので、引っ張る操作ではない。",
    ],
  },
  {
    id: "case-divider-sections",
    answerId: "divider",
    distractorIds: ["fieldset", "card", "stickyheader"],
    prompt:
      "設定項目のまとまりの境目を、余白だけでは伝わらないので細い線で示したい。",
    reason:
      "まとまりの境目を細い線で示すならディバイダー。",
    distractorReasons: [
      "入力項目を囲うもので、単なる区切りには重い。",
      "内容を箱で見せるもので、線だけの区切りにはならない。",
      "スクロール時に見出しを残すもので、区切りは示せない。",
    ],
  },
  {
    id: "case-hero-first-view",
    answerId: "hero",
    distractorIds: ["banner", "card", "appbar"],
    prompt:
      "トップページを開いた瞬間に、何のサービスかと主要な操作を大きく見せたい。",
    reason:
      "ページ冒頭で何のページかを大きく伝えるならヒーロー。",
    distractorReasons: [
      "告知を帯で知らせるもので、ページの主題を伝える場所ではない。",
      "1件を箱で見せるもので、冒頭の大きな領域にはならない。",
      "画面上部の操作の帯で、主題を大きく見せるものではない。",
    ],
  },
  {
    id: "case-footer-links",
    answerId: "footer",
    distractorIds: ["sidebar", "bottomsheet", "appbar"],
    prompt:
      "ページの末尾に、利用規約とプライバシーポリシーのリンクをまとめて置きたい。",
    reason:
      "本文より優先度の低い補助リンクを末尾にまとめるならフッター。",
    distractorReasons: [
      "横に常設する領域で、ページ末尾のまとめにはならない。",
      "下から出る操作パネルで、常設のリンク置き場ではない。",
      "画面上部の帯で、末尾には置けない。",
    ],
  },
  {
    id: "case-toolbar-quick",
    answerId: "toolbar",
    distractorIds: ["menubar", "commandpalette", "megamenu"],
    prompt:
      "エディタで、太字や保存などよく使う操作を、メニューを開かず1回で押せるようにしたい。",
    reason:
      "よく使う操作をアイコンで並べ、1回で実行するならツールバー。",
    distractorReasons: [
      "見出しを押して一覧を開くもので、1回では実行できない。",
      "機能名を打ち込むもので、常に見えている操作の並びではない。",
      "ホバーで大きな一覧を開くもので、即時の実行には向かない。",
    ],
  },
  {
    id: "case-menubar-app",
    answerId: "menubar",
    distractorIds: ["toolbar", "tabbar", "sidebar"],
    prompt:
      "デスクトップアプリの上部に「ファイル」「編集」「表示」を横並びで置き、押すと各一覧を開きたい。",
    reason:
      "横並びの見出しを押して一覧を開くならメニューバー。",
    distractorReasons: [
      "アイコンで即実行するもので、見出しから一覧を開く形ではない。",
      "主要画面を切り替えるもので、機能の一覧を開くものではない。",
      "横に常設する領域で、上部の横並びメニューにはならない。",
    ],
  },
  {
    id: "case-sheet-detail",
    answerId: "sheet",
    distractorIds: ["drawer", "modal", "bottomsheet"],
    prompt:
      "一覧を隠さずに、選んだ行の詳細を横から狭い幅で出したい。",
    reason:
      "一覧を残したまま、詳細を横から狭く出すならシート。",
    distractorReasons: [
      "主要メニューを出すもので、詳細の確認には向かない。",
      "背景を覆うので、一覧が見えなくなる。",
      "下から出るもので、横から出す指定と合わない。",
    ],
  },
  {
    id: "case-avatar-identity",
    answerId: "avatar",
    distractorIds: ["badge", "chip", "card"],
    prompt:
      "コメント欄で、投稿した人の顔写真を小さく丸く添えたい。",
    reason:
      "人を表す小さな画像を添えるならアバター。",
    distractorReasons: [
      "件数や状態を示す印で、人を表す画像ではない。",
      "選んだ条件を表す札で、人物の表示ではない。",
      "1件を箱で見せるもので、小さな顔写真にはならない。",
    ],
  },
  {
    id: "case-badge-count",
    answerId: "badge",
    distractorIds: ["chip", "avatar", "notification"],
    prompt:
      "メールのアイコンの隅に、未読の件数を小さな数字で示したい。押せる要素にはしたくない。",
    reason:
      "件数を示す小さな印で、それ自体は押さないならバッジ。",
    distractorReasons: [
      "押して外せる札なので、押さない印にはならない。",
      "人を表す画像で、件数の表示ではない。",
      "通知を溜める場所で、アイコンの隅の印ではない。",
    ],
  },
  {
    id: "case-chip-removable",
    answerId: "chip",
    distractorIds: ["badge", "tagsinput", "togglebutton"],
    prompt:
      "絞り込みで選んだ条件を、押すと外せる札として並べたい。",
    reason:
      "選んだ条件を表し、押して外せるならチップ。",
    distractorReasons: [
      "押さない印なので、外す操作を持てない。",
      "新しく打ち込んで足す欄で、選んだ条件の表示ではない。",
      "押して状態を切り替えるボタンで、条件の一覧表示ではない。",
    ],
  },
  {
    id: "case-togglebutton-state",
    answerId: "togglebutton",
    distractorIds: ["toggleswitch", "checkbox", "chip"],
    prompt:
      "太字のオンオフを、押すたびに状態が切り替わるボタンとして置きたい。押されている状態を見た目で示したい。",
    reason:
      "押すたびに状態が切り替わり、押下中を見た目で示すならトグルボタン。",
    distractorReasons: [
      "つまみを動かす形で、ボタンとしての見た目ではない。",
      "複数選べる前提のもので、単独のオンオフには向かない。",
      "条件を表す札で、状態の切り替えが主目的ではない。",
    ],
  },
  {
    id: "case-toggleswitch-setting",
    answerId: "toggleswitch",
    distractorIds: ["togglebutton", "checkbox", "radio"],
    prompt:
      "設定画面で、自動保存のオンオフを、切り替わったことが一目で分かる形で置きたい。",
    reason:
      "設定のオンオフを、切り替わったことが分かる形で置くならトグルスイッチ。",
    distractorReasons: [
      "押下中を示すボタンで、オンオフの状態は分かりにくい。",
      "複数選べる前提のもので、単独の設定には向かない。",
      "複数の中から1つ選ぶもので、オンオフの切り替えではない。",
    ],
  },
  {
    id: "case-slider-range",
    answerId: "slider",
    distractorIds: ["progressbar", "numberinput", "gauge"],
    prompt:
      "音量を、つまみを動かして直感的に決めたい。値の範囲は0から100。",
    reason:
      "つまみを動かして値を決めるならスライダー。",
    distractorReasons: [
      "進み具合を見せるだけで、操作はできない。",
      "数を打ち込む欄で、つまみを動かす操作ではない。",
      "値を示すだけで、操作はできない。",
    ],
  },
  {
    id: "case-numberinput-step",
    answerId: "numberinput",
    distractorIds: ["slider", "textfield", "stepper"],
    prompt:
      "数量を、1つずつ増減ボタンで変えられるようにしたい。直接打ち込むことも許したい。",
    reason:
      "増減ボタンと直接入力を兼ねるなら数値入力。",
    distractorReasons: [
      "つまみを動かすもので、1つずつ確実に変える用途には向かない。",
      "文字も入ってしまうので、数値だけに絞れない。",
      "手順の進み具合を示すもので、数量の入力欄ではない。",
    ],
  },
  {
    id: "case-stepper-flow",
    answerId: "stepper",
    distractorIds: ["pagination", "progressbar", "tabs"],
    prompt:
      "申し込みの手順が4段階ある。いま何段階目かを示し、前後に移動できるようにしたい。",
    reason:
      "手順の現在地を示し、前後に移動させるならステッパー。",
    distractorReasons: [
      "ページを移動するもので、手順の段階は示せない。",
      "進み具合を示すだけで、段階の移動はできない。",
      "内容を切り替えるもので、手順の現在地は示せない。",
    ],
  },
  {
    id: "case-timeline-history",
    answerId: "timeline",
    distractorIds: ["table", "stepper", "card"],
    prompt:
      "注文の履歴を、いつ何があったかを時系列に沿って縦に並べたい。",
    reason:
      "出来事を時系列に沿って並べるならタイムライン。",
    distractorReasons: [
      "行と列に並べるもので、時系列の流れは表しにくい。",
      "手順の現在地を示すもので、過去の履歴の列挙には向かない。",
      "1件を箱で見せるもので、時系列の並びにはならない。",
    ],
  },
  {
    id: "case-carousel-slides",
    answerId: "carousel",
    distractorIds: ["tabs", "lightbox", "timeline"],
    prompt:
      "トップページで、複数の告知画像を横に切り替えて見せたい。何枚目かも示したい。",
    reason:
      "複数の画像を横に切り替えて見せるならカルーセル。",
    distractorReasons: [
      "内容を切り替えるもので、画像を横に流す見せ方ではない。",
      "1枚を大きく見せるもので、複数を切り替える表示ではない。",
      "時系列に並べるもので、横に切り替える表示ではない。",
    ],
  },
  {
    id: "case-dotindicator-position",
    answerId: "dotindicator",
    distractorIds: ["pagination", "progressbar", "stepper"],
    prompt:
      "横に並んだ5枚のうち、いま何枚目を見ているかを点で示したい。移動は矢印で行う。",
    reason:
      "横に並んだ点で現在位置を示すならドットインジケーター。",
    distractorReasons: [
      "ページ番号を選んで移動するもので、点で示すだけの表示ではない。",
      "進み具合を示す棒で、何枚目かは示せない。",
      "手順の段階を示すもので、画像の位置表示には向かない。",
    ],
  },
  {
    id: "case-filterbar-conditions",
    answerId: "filterbar",
    distractorIds: ["searchfield", "toolbar", "commandpalette"],
    prompt:
      "一覧の上で、状態と期間の条件を指定して表示する行を減らしたい。適用中の条件も見せたい。",
    reason:
      "一覧の上で条件を指定して絞り込むならフィルターバー。",
    distractorReasons: [
      "打った語で探すもので、複数の条件を組み合わせる形ではない。",
      "操作を並べるもので、絞り込みの条件指定ではない。",
      "機能を打ち込んで実行するもので、一覧の絞り込みではない。",
    ],
  },
  {
    id: "case-searchfield-query",
    answerId: "searchfield",
    distractorIds: ["combobox", "commandpalette", "filterbar"],
    prompt:
      "記事を、タイトルに含まれる語で探したい。打つたびに結果が絞られるとよい。",
    reason:
      "打った語で内容を探すなら検索フィールド。",
    distractorReasons: [
      "値を1つ選ぶための欄で、内容を探す用途ではない。",
      "機能を実行するもので、記事の検索ではない。",
      "条件を組み合わせる領域で、語での検索が主目的ではない。",
    ],
  },
  {
    id: "case-inlineedit-rename",
    answerId: "inlineedit",
    distractorIds: ["textfield", "modal", "richtext"],
    prompt:
      "一覧のタスク名を、別画面に移らずその場で直したい。ダブルクリックで編集を始めたい。",
    reason:
      "表示中の文字をその場で編集するならインライン編集。",
    distractorReasons: [
      "常に入力できる欄で、表示と編集を切り替える形ではない。",
      "別画面を重ねるので、その場で直すという条件に反する。",
      "長文を整形して書くもので、名前の修正には重い。",
    ],
  },
  {
    id: "case-richtext-format",
    answerId: "richtext",
    distractorIds: ["textarea", "codeblock", "textfield"],
    prompt:
      "記事本文を、太字や見出しを使って書けるようにしたい。装飾は見たまま確認したい。",
    reason:
      "太字や見出しを使って見たまま書くならリッチテキストエディタ。",
    distractorReasons: [
      "文字だけを入れる欄で、装飾は付けられない。",
      "コードを整形して見せるもので、本文の執筆には向かない。",
      "1行の入力で、見出しや太字は扱えない。",
    ],
  },
  {
    id: "case-codeblock-copy",
    answerId: "codeblock",
    distractorIds: ["richtext", "textarea", "kbd"],
    prompt:
      "設定ファイルの例を、字下げを保ったまま見せたい。コピーもできるようにしたい。",
    reason:
      "字下げを保ってコードを見せ、コピーを添えるならコードブロック。",
    distractorReasons: [
      "装飾して書くもので、字下げを保った表示には向かない。",
      "入力する欄で、読ませるための表示ではない。",
      "キーの形を示すもので、コードの表示ではない。",
    ],
  },
  {
    id: "case-colorpicker-value",
    answerId: "colorpicker",
    distractorIds: ["slider", "textfield", "select"],
    prompt:
      "テーマ色を、色見本から選んで決めたい。選んだ色の値も確認したい。",
    reason:
      "色見本から選んで値を決めるならカラーピッカー。",
    distractorReasons: [
      "つまみで数値を決めるもので、色を選ぶ形ではない。",
      "文字を入れる欄で、色見本は出せない。",
      "一覧から選ぶもので、色そのものを選ぶ表示ではない。",
    ],
  },
  {
    id: "case-dropzone-drag",
    answerId: "dropzone",
    distractorIds: ["fileupload", "textfield", "card"],
    prompt:
      "画像を、画面の決まった領域へドラッグして落として受け取りたい。",
    reason:
      "決まった領域へドラッグして落とすならドロップゾーン。",
    distractorReasons: [
      "押して選ぶ導線が主で、落とす領域は持たない。",
      "文字を入れる欄で、ファイルは受け取れない。",
      "内容を箱で見せるもので、受け取りの領域ではない。",
    ],
  },
  {
    id: "case-rating-stars",
    answerId: "rating",
    distractorIds: ["slider", "progressbar", "badge"],
    prompt:
      "商品の満足度を、5段階の星で選ばせたい。",
    reason:
      "5段階を星で選ばせるならレーティング。",
    distractorReasons: [
      "連続した値を動かすもので、段階の選択には向かない。",
      "進み具合を見せるもので、評価は入力できない。",
      "件数や状態を示す印で、評価の入力はできない。",
    ],
  },
  {
    id: "case-passwordfield-mask",
    answerId: "passwordfield",
    distractorIds: ["textfield", "otpinput", "searchfield"],
    prompt:
      "ログインのパスワードを伏せ字で入れたい。入力した内容を確認できる切替も欲しい。",
    reason:
      "伏せ字で入れ、表示を切り替えられるならパスワード欄。",
    distractorReasons: [
      "入力がそのまま見えてしまうので、伏せ字にできない。",
      "桁ごとに区切るもので、任意の長さの文字列には向かない。",
      "打った語で探すもので、秘密の入力には使わない。",
    ],
  },
  {
    id: "case-timeselect-hour",
    answerId: "timeselect",
    distractorIds: ["datepicker", "rangepicker", "slider"],
    prompt:
      "予約の開始を、15分刻みで何時何分かを選ばせたい。日付は別の欄で選ぶ。",
    reason:
      "何時何分かを選ぶなら時刻選択。",
    distractorReasons: [
      "日付を選ぶもので、時刻は決められない。",
      "期間を選ぶもので、1つの時刻の指定には向かない。",
      "連続した値を動かすもので、15分刻みの選択には向かない。",
    ],
  },
  {
    id: "case-checkboxgroup-multi",
    answerId: "checkboxgroup",
    distractorIds: ["radio", "select", "multiselect"],
    prompt:
      "通知の種類について、当てはまるものをいくつでも選ばせたい。選択肢は4つで常に見せたい。",
    reason:
      "1つの問いに複数選ばせ、選択肢を常に見せるならチェックボックスグループ。",
    distractorReasons: [
      "1つしか選べないので、複数という条件を満たせない。",
      "押して一覧を開くので、常に見せるという条件に反する。",
      "一覧から選ぶ形で、4つを常に並べて見せる用途ではない。",
    ],
  },
  {
    id: "case-radio-exclusive",
    answerId: "radio",
    distractorIds: ["checkbox", "checkboxgroup", "toggleswitch"],
    prompt:
      "配送方法を3つから1つだけ選ばせたい。選び直すと前の選択は外れる。",
    reason:
      "3つから1つだけ選び、選び直すと他が外れるならラジオボタン。",
    distractorReasons: [
      "複数選べてしまうので、1つだけという条件を満たせない。",
      "複数選べるまとまりなので、排他の選択には向かない。",
      "オンオフの切り替えで、3択から1つ選ぶ形ではない。",
    ],
  },
  {
    id: "case-textarea-long",
    answerId: "textarea",
    distractorIds: ["textfield", "richtext", "codeblock"],
    prompt:
      "問い合わせの本文を、複数行にわたって書かせたい。装飾は要らない。",
    reason:
      "複数行の長文を、装飾なしで書かせるならテキストエリア。",
    distractorReasons: [
      "1行の入力なので、長文を書くには狭い。",
      "装飾を付ける前提のもので、今回は不要。",
      "コードを見せるもので、自由な文章の入力には向かない。",
    ],
  },
  {
    id: "case-accordion-long-settings",
    answerId: "accordion",
    distractorIds: ["tabs", "fieldset", "modal"],
    prompt:
      "設定項目が縦に長い。見出しだけ並べて、押した項目の中身だけ開くようにしたい。",
    reason:
      "見出しだけ並べ、押した項目の中身だけ開くならアコーディオン。",
    distractorReasons: [
      "内容を切り替えるもので、複数の見出しを同時に並べる形ではない。",
      "入力項目を囲うもので、開閉はできない。",
      "背景を覆うので、他の項目を同時に見せられない。",
    ],
  },
  {
    id: "case-pagination-vs-loadmore",
    answerId: "pagination",
    distractorIds: ["loadmore", "carousel", "tabs"],
    prompt:
      "社内文書の一覧で、目的のページ番号を指定して直接開きたい。総件数も示したい。",
    reason:
      "ページ番号を指定して直接開き、総件数も示すならページネーション。",
    distractorReasons: [
      "末尾から順に足す方式なので、番号を指定して開けない。",
      "画像を横に切り替えるもので、一覧のページ移動ではない。",
      "内容を切り替えるもので、ページの移動はできない。",
    ],
  },
  {
    id: "case-bottomsheet-vs-drawer",
    answerId: "bottomsheet",
    distractorIds: ["drawer", "sheet", "popover"],
    prompt:
      "スマホで、地図を上に少し残したまま、下から店舗の詳細をせり上げて見せたい。",
    reason:
      "下からせり上がり、上を少し残せるならボトムシート。",
    distractorReasons: [
      "左右の端から横に出るもので、下からせり上がる形ではない。",
      "横から出る補助パネルで、下から出す指定と合わない。",
      "要素のそばに開く小さなパネルで、画面下からは出ない。",
    ],
  },
  {
    id: "case-megamenu-vs-dropdown",
    answerId: "megamenu",
    distractorIds: ["dropdown", "toolbar", "tabbar"],
    prompt:
      "ヘッダーの1項目にカーソルを合わせたら、20件近い分類を複数列でまとめて見せたい。",
    reason:
      "20件近い分類を複数列で一度に見せるならメガメニュー。",
    distractorReasons: [
      "短い操作の一覧を開くもので、20件を複数列で見せる形ではない。",
      "アイコンを並べるもので、分類の一覧表示ではない。",
      "主要画面を切り替えるもので、分類の一覧ではない。",
    ],
  },
  {
    id: "case-notification-vs-toast",
    answerId: "notification",
    distractorIds: ["toast", "banner", "alert"],
    prompt:
      "アプリを閉じている間に届いた通知を、あとで一覧から確認したい。",
    reason:
      "あとから一覧で確認できる形で通知を残すなら通知センター。",
    distractorReasons: [
      "数秒で消えるので、あとから確認できない。",
      "画面幅の帯で告知するもので、通知の履歴は残らない。",
      "その場の注意を出すもので、履歴の確認はできない。",
    ],
  },
  {
    id: "case-skeleton-vs-spinner",
    answerId: "skeleton",
    distractorIds: ["spinner", "emptystate", "progressbar"],
    prompt:
      "カードが並ぶ一覧の読み込み中に、カードの形を先に置いて、読み込み後の飛び跳ねを抑えたい。",
    reason:
      "これから入る内容の形を先に置くならスケルトン。",
    distractorReasons: [
      "回るだけで形を出さないので、飛び跳ねを抑えられない。",
      "中身が無いことを伝えるもので、読み込み中には使わない。",
      "進み具合を示す棒で、内容の形は示せない。",
    ],
  },
  {
    id: "case-loadingbar-vs-spinner",
    answerId: "loadingbar",
    distractorIds: ["spinner", "progressbar", "skeleton"],
    prompt:
      "画面を切り替えている間、画面を覆わずに上部の細い帯だけで読み込み中を示したい。",
    reason:
      "画面を覆わず、上部の細い帯で示すならローディングバー。",
    distractorReasons: [
      "その場で回るもので、画面上部の帯にはならない。",
      "本文中の進み具合を示すもので、画面遷移の合図には向かない。",
      "内容の形を先に置くもので、画面全体の遷移には使わない。",
    ],
  },
  {
    id: "case-inlinealert-vs-alert",
    answerId: "inlinealert",
    distractorIds: ["alert", "banner", "callout"],
    prompt:
      "電話番号の欄だけに関係する注意を、その欄のすぐ下に小さく出したい。",
    reason:
      "特定の欄のすぐそばに出すならインラインアラート。",
    distractorReasons: [
      "画面や節の単位でまとめて出すので、欄ごとには広すぎる。",
      "画面上部の帯なので、欄のそばには置けない。",
      "本文中の補足で、入力欄の注意には向かない。",
    ],
  },
  {
    id: "case-callout-vs-banner",
    answerId: "callout",
    distractorIds: ["banner", "alert", "inlinealert"],
    prompt:
      "手順書の途中で、この操作は取り消せないという前提を、本文の流れの中で枠で囲んで目立たせたい。",
    reason:
      "本文の流れの中で枠付きの補足を置くならコールアウト。",
    distractorReasons: [
      "画面上部の帯なので、本文の途中には置けない。",
      "操作の結果を出すもので、手順書の補足には向かない。",
      "入力欄のそばに出すもので、本文中には置けない。",
    ],
  },
  {
    id: "case-emptystate-vs-errormessage",
    answerId: "emptystate",
    distractorIds: ["errormessage", "skeleton", "spinner"],
    prompt:
      "新規ユーザーで、まだ1件も作っていないプロジェクト一覧に、最初の作成を促す表示を出したい。",
    reason:
      "まだ何も無い状態で、次の行動を促すなら空状態。",
    distractorReasons: [
      "失敗を伝えるもので、まだ何もしていない状態には合わない。",
      "読み込み中の形を置くもので、読み込みは終わっている。",
      "待っていることを示すもので、待つ必要がない。",
    ],
  },
  {
    id: "case-errormessage-vs-emptystate",
    answerId: "errormessage",
    distractorIds: ["emptystate", "inlinealert", "helpertext"],
    prompt:
      "一覧の取得がタイムアウトした。理由と、もう一度読み込む導線を出したい。",
    reason:
      "失敗の理由と次にできることを伝えるならエラーメッセージ。",
    distractorReasons: [
      "中身が無いことを伝えるもので、失敗の理由は伝えられない。",
      "入力欄の注意を出すもので、通信の失敗は扱わない。",
      "入力前に形式を伝える補足で、失敗の表示ではない。",
    ],
  },
  {
    id: "case-helpertext-vs-inlinevalidation",
    answerId: "helpertext",
    distractorIds: ["inlinevalidation", "errormessage", "textfield"],
    prompt:
      "電話番号の欄に、ハイフンなしの11桁で入れるという決まりを、入力前に伝えておきたい。",
    reason:
      "入力前に形式を伝えるならヘルパーテキスト。",
    distractorReasons: [
      "入力後に不備を知らせるもので、事前の案内にはならない。",
        "1行の入力欄で、入力前に決まりを伝える仕組みを持たない。",
      "欄の中の薄い例示で、決まりを読み取らせるには足りない。",
    ],
  },
  {
    id: "case-inlinevalidation-vs-helpertext",
    answerId: "inlinevalidation",
    distractorIds: ["helpertext", "errormessage", "alert"],
    prompt:
      "クレジットカード番号の欄で、桁数が足りないまま次へ移ろうとしたら、その場で知らせたい。",
    reason:
      "入力した直後にその欄の不備を知らせるなら、その場検証。",
    distractorReasons: [
      "入力前に形式を伝えるもので、入力後の判定はしない。",
      "処理の失敗を伝えるもので、入力の不備は扱わない。",
      "画面単位で出すもので、欄ごとの即時判定には広すぎる。",
    ],
  },
  {
    id: "case-datagrid-vs-table",
    answerId: "datagrid",
    distractorIds: ["table", "timeline", "card"],
    prompt:
      "在庫一覧で、列を押して並べ替え、複数行を選んで一括更新したい。",
    reason:
      "並べ替えや複数行の選択など操作を伴うならデータグリッド。",
    distractorReasons: [
      "値を並べて見せるもので、並べ替えや選択の操作は持たない。",
      "時系列に並べるもので、表の操作はできない。",
      "1件ずつを箱で見せるもので、一括操作には向かない。",
    ],
  },
  {
    id: "case-treeview-vs-accordion",
    answerId: "treeview",
    distractorIds: ["accordion", "breadcrumb", "table"],
    prompt:
      "組織図のように、部の下に課があり、課の下に担当がある入れ子を、開閉しながら辿りたい。",
    reason:
      "入れ子の階層を開閉しながら辿るならツリービュー。",
    distractorReasons: [
      "見出しの開閉はできるが、入れ子の階層は表せない。",
      "現在地を示すもので、中を辿る操作はできない。",
      "行と列に並べるもので、入れ子は表せない。",
    ],
  },
  {
    id: "case-commandpalette-vs-searchfield",
    answerId: "commandpalette",
    distractorIds: ["searchfield", "filterbar", "megamenu"],
    prompt:
      "作業中に、ショートカットで開いて「エクスポート」と打ち、その機能をすぐ実行したい。",
    reason:
      "機能名を打ち込んで操作を実行するならコマンドパレット。",
    distractorReasons: [
      "打った語で内容を探すもので、操作の実行はできない。",
      "一覧の絞り込み条件を指定するもので、機能の実行ではない。",
      "ホバーで一覧を開くもので、打ち込みでは届かない。",
    ],
  },
  {
    id: "case-lightbox-vs-modal",
    answerId: "lightbox",
    distractorIds: ["modal", "carousel", "popover"],
    prompt:
      "商品画像を押したら、背景を暗く落として画面いっぱいに大きく見せたい。",
    reason:
      "背景を暗く落として画像を大きく見せるならライトボックス。",
    distractorReasons: [
      "確認や入力のためのダイアログで、画像を見せる用途ではない。",
      "複数を横に切り替えるもので、1枚を大きく見せる表示ではない。",
      "要素のそばに開く小さなパネルで、画面いっぱいにはならない。",
    ],
  },
  {
    id: "case-coachmark-vs-tooltip",
    answerId: "coachmark",
    distractorIds: ["tooltip", "modal", "callout"],
    prompt:
      "初回ログイン時に、新機能のボタンを指して、ここから始められることを一度だけ伝えたい。",
    reason:
      "初回だけ対象を指して案内するならコーチマーク。",
    distractorReasons: [
      "カーソルを合わせるたびに出るもので、初回だけの案内にはならない。",
      "背景を覆うので、他の要素を見せながら案内できない。",
      "本文中の補足で、特定の要素を指せない。",
    ],
  },
  {
    id: "case-countdown-vs-progressbar",
    answerId: "countdown",
    distractorIds: ["progressbar", "gauge", "loadingbar"],
    prompt:
      "入札の締切までの残りを、減っていく数字で見せたい。締切は決まっている。",
    reason:
      "期限までの残り時間を減らしながら見せるならカウントダウン。",
    distractorReasons: [
      "何割終わったかを示すもので、残り時間は読めない。",
      "1つの値が上限のどこかを示すもので、時間の減少には向かない。",
      "読み込み中を示すもので、期限は伝えられない。",
    ],
  },
  {
    id: "case-stickyheader-vs-appbar",
    answerId: "stickyheader",
    distractorIds: ["appbar", "table", "divider"],
    prompt:
      "長い請求書一覧で、下までスクロールしても列の見出しを残したい。",
    reason:
      "スクロールしても列の見出しを残すなら追従ヘッダー。",
    distractorReasons: [
      "画面名と操作を置く帯で、列の見出しを残すものではない。",
      "値を並べるもので、見出しを残す仕組みは持たない。",
      "区切りを示す線で、見出しを残す働きはない。",
    ],
  },
  {
    id: "case-kbd-vs-codeblock",
    answerId: "kbd",
    distractorIds: ["codeblock", "tooltip", "chip"],
    prompt:
      "保存のショートカットを、押すキーそのものの形で画面に添えたい。",
    reason:
      "押すべきキーを物理キーの形で示すならキー表示。",
    distractorReasons: [
      "コードを整形して見せるもので、キーの案内には向かない。",
      "カーソルを合わせたときの補足で、常時の案内にはならない。",
      "選んだ条件を表す札で、キーの表示ではない。",
    ],
  },
  {
    id: "case-tagsinput-vs-multiselect",
    answerId: "tagsinput",
    distractorIds: ["multiselect", "chip", "textarea"],
    prompt:
      "自由なキーワードを、打ち込んで確定するたびに札として増やしたい。候補一覧は無い。",
    reason:
      "打ち込んで確定するたびに札を足すならタグ入力。",
    distractorReasons: [
      "既存の一覧から選ぶもので、自由に打ち込む形ではない。",
      "すでに選ばれた条件を表す表示で、打ち込む欄ではない。",
      "長文を入れる欄で、札として増やす仕組みは持たない。",
    ],
  },
  {
    id: "case-otpinput-vs-textfield",
    answerId: "otpinput",
    distractorIds: ["textfield", "passwordfield", "numberinput"],
    prompt:
      "SMSで届いた6桁のコードを、1桁ずつ区切ったマスに入れさせたい。",
    reason:
      "桁ごとに区切ったマスへ入れるならワンタイムコード入力。",
    distractorReasons: [
      "1行の入力欄で、桁ごとの区切りがない。",
      "伏せ字にするもので、区切ったマスにはならない。",
      "増減ボタンで変えるもので、6桁を打ち込む用途ではない。",
    ],
  },
  {
    id: "case-rangepicker-vs-datepicker",
    answerId: "rangepicker",
    distractorIds: ["datepicker", "timeselect", "filterbar"],
    prompt:
      "レポートの対象を、開始日と終了日の2つで指定したい。片方だけでは確定しない。",
    reason:
      "始まりと終わりの2点を選んで範囲を決めるなら期間選択。",
    distractorReasons: [
      "1つの日付しか選べないので、範囲にならない。",
      "何時何分かを選ぶもので、日付の範囲は決められない。",
      "条件を並べる領域で、期間そのものを選ぶ部品ではない。",
    ],
  },
  {
    id: "case-fileupload-vs-dropzone",
    answerId: "fileupload",
    distractorIds: ["dropzone", "textfield", "lightbox"],
    prompt:
      "スマホで、端末のファイルを押して選び、送りたい。ドラッグは使えない。",
    reason:
      "押して選ぶ導線が要るならファイルアップロード。",
    distractorReasons: [
      "ドラッグで落とす操作が主で、スマホでは使いにくい。",
      "文字を入れる欄で、ファイルは送れない。",
      "画像を大きく見せる表示で、送信はできない。",
    ],
  },
  {
    id: "case-fieldset-vs-divider",
    answerId: "fieldset",
    distractorIds: ["divider", "card", "helpertext"],
    prompt:
      "支払い情報の入力欄を、見出し付きのひとまとまりとして囲みたい。",
    reason:
      "関係する入力項目を見出し付きで囲うならフィールドセット。",
    distractorReasons: [
      "区切りの線だけで、まとまりの意味は伝わらない。",
      "内容を箱で見せるもので、入力のまとまりを示す用途ではない。",
      "欄の下の補足文で、まとまりを作るものではない。",
    ],
  },
  {
    id: "case-skiplink-vs-anchorlinks",
    answerId: "skiplink",
    distractorIds: ["anchorlinks", "backtotop", "breadcrumb"],
    prompt:
      "スクリーンリーダーで、毎回30個のメニュー項目を読み上げずに本文へ移れるようにしたい。",
    reason:
      "キーボード操作の最初に現れ、繰り返しのナビゲーションを飛ばすならスキップリンク。",
    distractorReasons: [
      "同じページ内の見出しへ飛ぶもので、最初に現れて読み上げを飛ばす仕組みではない。",
      "下から上へ戻るボタンで、前方へ飛ばすものではない。",
      "階層の現在地を示すもので、読み上げを飛ばせない。",
    ],
  },
  {
    id: "case-backtotop-vs-anchorlinks",
    answerId: "backtotop",
    distractorIds: ["anchorlinks", "skiplink", "pagination"],
    prompt:
      "長い記事の末尾から、一気に先頭へ戻りたい。スクロールが深いときだけ出したい。",
    reason:
      "長いページの途中から先頭へ戻るなら「先頭へ戻る」。",
    distractorReasons: [
      "特定の見出しへ飛ぶもので、先頭へ戻る用途ではない。",
      "キーボード操作の最初に出すもので、末尾から押す導線ではない。",
      "ページを移動するもので、同じページの先頭へは戻れない。",
    ],
  },
  {
    id: "case-progressnav-vs-progressbar",
    answerId: "progressnav",
    distractorIds: ["progressbar", "countdown", "loadingbar"],
    prompt:
      "長い読み物で、どこまで読んだかを上部の細いバーで示したい。",
    reason:
      "記事の読了位置を上部の細いバーで示すなら読了バー。",
    distractorReasons: [
      "処理の進み具合を示すもので、読んだ位置は表せない。",
      "残り時間を減らすもので、読了位置は示せない。",
      "読み込み中を示すもので、読む進み具合は表せない。",
    ],
  },
  {
    id: "case-pulltorefresh-vs-loadmore",
    answerId: "pulltorefresh",
    distractorIds: ["loadmore", "backtotop", "pagination"],
    prompt:
      "スマホの受信箱で、下へ引っ張ったら最新のメールを取り直したい。",
    reason:
      "一覧を下へ引っ張って最新を取り直すなら「引っ張って更新」。",
    distractorReasons: [
      "末尾から続きを足すもので、最新を取り直す操作ではない。",
      "先頭へ戻るボタンで、更新はしない。",
      "ページを移動するもので、引っ張る操作ではない。",
    ],
  },
  {
    id: "case-hero-vs-banner",
    answerId: "hero",
    distractorIds: ["banner", "card", "appbar"],
    prompt:
      "サービス紹介ページを開いた瞬間に、何のサービスかと開始ボタンを大きく見せたい。",
    reason:
      "ページ冒頭で何のページかを大きく伝えるならヒーロー。",
    distractorReasons: [
      "告知を帯で知らせるもので、ページの主題を伝える場所ではない。",
      "1件を箱で見せるもので、冒頭の大きな領域にはならない。",
      "画面上部の操作の帯で、主題を大きく見せるものではない。",
    ],
  },
  {
    id: "case-footer-vs-sidebar",
    answerId: "footer",
    distractorIds: ["sidebar", "bottomsheet", "appbar"],
    prompt:
      "ページの末尾に、会社情報と利用規約のリンクをまとめて置きたい。",
    reason:
      "本文より優先度の低い補助リンクを末尾にまとめるならフッター。",
    distractorReasons: [
      "横に常設する領域で、ページ末尾のまとめにはならない。",
      "下から出る操作パネルで、常設のリンク置き場ではない。",
      "画面上部の帯で、末尾には置けない。",
    ],
  },
  {
    id: "case-toolbar-vs-menubar",
    answerId: "toolbar",
    distractorIds: ["menubar", "commandpalette", "megamenu"],
    prompt:
      "画像編集で、切り抜きや回転を、メニューを開かず1回で押せるようにしたい。",
    reason:
      "よく使う操作をアイコンで並べ、1回で実行するならツールバー。",
    distractorReasons: [
      "見出しを押して一覧を開くもので、1回では実行できない。",
      "機能名を打ち込むもので、常に見えている操作の並びではない。",
      "ホバーで大きな一覧を開くもので、即時の実行には向かない。",
    ],
  },
  {
    id: "case-menubar-vs-toolbar",
    answerId: "menubar",
    distractorIds: ["toolbar", "tabbar", "sidebar"],
    prompt:
      "デスクトップアプリの上部に「ファイル」「編集」を横並びで置き、押すと各一覧を開きたい。",
    reason:
      "横並びの見出しを押して一覧を開くならメニューバー。",
    distractorReasons: [
      "アイコンで即実行するもので、見出しから一覧を開く形ではない。",
      "主要画面を切り替えるもので、機能の一覧を開くものではない。",
      "横に常設する領域で、上部の横並びメニューにはならない。",
    ],
  },
  {
    id: "case-badge-vs-chip",
    answerId: "badge",
    distractorIds: ["chip", "avatar", "notification"],
    prompt:
      "受信箱のアイコンの隅に、未読の件数を小さな数字で示したい。押せる要素にはしたくない。",
    reason:
      "件数を示す小さな印で、それ自体は押さないならバッジ。",
    distractorReasons: [
      "押して外せる札なので、押さない印にはならない。",
      "人を表す画像で、件数の表示ではない。",
      "通知を溜める場所で、アイコンの隅の印ではない。",
    ],
  },
  {
    id: "case-chip-vs-badge",
    answerId: "chip",
    distractorIds: ["badge", "tagsinput", "togglebutton"],
    prompt:
      "検索の絞り込みで選んだ条件を、押すと外せる札として並べたい。",
    reason:
      "選んだ条件を表し、押して外せるならチップ。",
    distractorReasons: [
      "押さない印なので、外す操作を持てない。",
      "新しく打ち込んで足す欄で、選んだ条件の表示ではない。",
      "押して状態を切り替えるボタンで、条件の一覧表示ではない。",
    ],
  },
];
