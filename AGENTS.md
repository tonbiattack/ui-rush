<!-- BEGIN:ui-rush:copy-rules -->

## コピー方針: キャッチコピーを使わない

画面・README・Issue の文言に、スローガンやキャッチコピーを置かない。見出しは「何をする画面か」をそのまま書き、本文は機能の説明に限定する。

- しない: 情緒的な見出し（例:「UIの名前を、見た瞬間に言えるように。」のような誘い文句）、比喩的な肩書き、感嘆符での煽り
- する: 事実の記述（「UI用語クイズ」「制限時間 5秒」「正解は◯◯」）、操作の結果をそのまま述べるボタン
- 例外: 用語データの `description` と、その用語を使った `exampleInstruction` は対象外

<!-- END:ui-rush:copy-rules -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
