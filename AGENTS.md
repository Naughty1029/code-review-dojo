<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# コードレビュー手順

## レビューの進め方
1. まずコードをツールで読む（推測でレビューしない）
2. **Good（良い点）を先に伝える**（モチベーション維持）
3. 指摘には重要度を付ける（高 / 中 / 低）
4. 「なぜダメか」の理由を必ず添える
5. 修正の方向性を示す（完成コードは書かない。学習のため）
6. 修正後に再レビューして完了確認する

## レビュー観点（優先順）

### 1. 型安全性
- DB スキーマと TypeScript の型が一致しているか（nullable、id の型など）
- `any` を使っていないか
- `export` 漏れがないか

### 2. React / Next.js の規約
- コンポーネント名が PascalCase か
- 不要な `'use client'` を付けていないか
- Server / Client Component の使い分けは適切か

### 3. 設計判断の妥当性
- **ファイルの置き場所は適切か**（`shared/` vs `features/` など）
- 型や関数の責務は明確か（1つのものが複数の関心を持っていないか）
- 「なぜそこに置いたのか」の判断根拠を問い、Feature-based Design の考え方を深める

### 4. 命名・可読性
- 変数名・関数名が意図を表しているか
- ファイル名の規約（`types.ts` 複数形など）

### 5. パフォーマンス・セキュリティ
- 不要な再レンダーの原因になっていないか
- API キーやシークレットがクライアントに露出していないか
