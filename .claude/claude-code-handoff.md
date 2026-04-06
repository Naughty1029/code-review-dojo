# Claude Code 引き継ぎ書
# CodeReview Dojo プロジェクト

---

## このドキュメントについて

このドキュメントは Claude（claude.ai）でのやり取りを元に、
Claude Code での実装を引き継ぐための情報をまとめたものです。

---

## 1. 開発者プロフィール

- **名前（ニックネーム）**：ノーティ（Naughty1029）
- **職種**：フロントエンド/ビジネスエンジニア
- **現職**：iYell株式会社（住宅ローン効率化プラットフォーム）
- **技術スタック**：Next.js, TypeScript, React, AWS, PHP/Laravel
- **GitHub**：https://github.com/Naughty1029

### 学習背景
- Reactの公式ドキュメントを全読了（理解度高い）
- Next.js App Routerの概念は理解している
- このプロジェクトはReact/Next.jsの深化学習を目的としている
- 転職活動中（freee、WealthNavi等が志望先）
- PdM/PM候補として「技術を事業に繋げて語れる」エンジニアを目指している

---

## 2. プロジェクト概要

### リポジトリ
https://github.com/Naughty1029/code-review-dojo

### アプリ概要
コードレビュースキルを体系的に鍛える練習アプリ。
本物のPRに近い「コンテキスト付きの問題」を解き、
Google Code Review Guidelinesに基づいてAIが採点する。

### 現在の状態
- `create-next-app` でプロジェクト作成済み
- Next.js 16.2.2、React 19.2.4、TypeScript 5、Tailwind v4
- `tsconfig.json` に `"strict": true` 設定済み
- `app/` ディレクトリ直下にデフォルトのファイルのみ
- Supabase・shadcn/ui等のライブラリは未インストール

---

## 3. 技術スタック（決定済み）

```
フレームワーク：  Next.js 15 App Router（TypeScript strict）
スタイリング：    Tailwind CSS v4 + shadcn/ui
認証：           Supabase Auth（GitHub OAuth + メール）
DB：             Supabase（PostgreSQL）
AI採点：         Anthropic Claude API（claude-sonnet-4-5）
データフェッチ：  TanStack Query（Client Component側のみ）
状態管理：       Zustand（レビューフォーム入力状態）
デプロイ：       Vercel
```

---

## 4. 設計の重要な意思決定

### 4-1. ディレクトリ設計思想
Pete Hunt（React作者の一人）の「技術の分離より関心の分離」思想に基づき、
Atomic Designではなく**Feature-based Design**を採用。

```
features/problems/   → 問題に関する全て（UI/hooks/types）
features/review/     → レビューに関する全て
features/profile/    → プロフィール・履歴に関する全て
shared/ui/           → ビジネスロジックを持たない純粋なUIのみ
```

### 4-2. Server/Client Component の使い分け
- 問題一覧・詳細表示 → **Server Component**（DBアクセス、SSR）
- レビュー入力フォーム → **Client Component**（インタラクション必須）
- 採点結果表示 → **Client Component**（アニメーション、TanStack Query）

### 4-3. APIキーの方針
- **Phase 1（MVP）**：サーバーサイドの環境変数（`.env`）でAPIキー管理
- **Phase 2**：ユーザーが自分のAPIキーを登録可能（Supabaseに暗号化保存）
- Claude APIはRoute Handlerのサーバーサイドのみで呼び出し（クライアント露出なし）

### 4-4. 問題の設計
コードだけでなく「コンテキストカード」を必ず付与：
- プロジェクト概要・技術スタック
- PRの説明文
- コードの差分（before/after）

これにより「実際のPRレビュー」に近い体験を実現。

---

## 5. DBスキーマ

```sql
-- 問題マスタ
CREATE TABLE problems (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text NOT NULL,
  context         jsonb NOT NULL,
  -- context の構造:
  -- {
  --   "project_overview": "ECサイトのカート機能...",
  --   "tech_stack": "Next.js, TypeScript, Supabase",
  --   "pr_description": "カート追加のバグを修正..."
  -- }
  code_before     text,
  code_after      text NOT NULL,
  code_diff       text,
  difficulty      text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category        text NOT NULL,
  expected_issues jsonb NOT NULL,  -- 採点用（ユーザーには非公開）
  is_published    boolean DEFAULT false,
  created_at      timestamp DEFAULT now()
);

-- ユーザーレビュー
CREATE TABLE reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users,
  problem_id      uuid REFERENCES problems,
  comment         text NOT NULL,
  score           integer CHECK (score >= 0 AND score <= 100),
  score_breakdown jsonb,
  -- score_breakdown の構造:
  -- {
  --   "design": 15,
  --   "functionality": 20,
  --   "readability": 18,
  --   "security_performance": 12,
  --   "testing": 10
  -- }
  ai_feedback     text,
  is_public       boolean DEFAULT true,
  created_at      timestamp DEFAULT now()
);

-- ユーザープロフィール
CREATE TABLE user_profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users,
  display_name    text,
  anthropic_api_key text,  -- Phase 2で暗号化実装
  created_at      timestamp DEFAULT now()
);
```

---

## 6. 採点基準（Google Code Review Guidelines準拠）

| 観点 | 配点 | 説明 |
|---|---|---|
| 設計・アーキテクチャ | 20点 | コンポーネント設計、責務分離 |
| 機能・正確性 | 20点 | バグ・ロジックエラーの発見 |
| 可読性・命名 | 20点 | 命名、コメント、複雑度 |
| セキュリティ・パフォーマンス | 20点 | セキュリティリスク、最適化 |
| テスト・エッジケース | 20点 | テスト不足、境界値 |

---

## 7. 画面構成

```
/                       → ランディング・ログイン誘導
/login                  → ログイン（GitHub OAuth / メール）
/problems               → 問題一覧（難易度・カテゴリでフィルタ）
/problems/[id]          → 問題詳細（コンテキスト + diff + レビュー入力）
/problems/[id]/results  → 採点結果 + AIフィードバック + 他ユーザーのレビュー
/profile                → 解答履歴 + 観点別スコア推移
```

---

## 8. ディレクトリ構造（目標形）

```
code-review-dojo/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← 認証チェック
│   │   ├── problems/
│   │   │   ├── page.tsx            ← Server Component
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── results/page.tsx
│   │   └── profile/page.tsx
│   ├── api/
│   │   └── score/route.ts          ← Claude API Route Handler
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── features/
│   ├── problems/
│   │   ├── components/
│   │   │   ├── ProblemCard.tsx
│   │   │   ├── ProblemList.tsx
│   │   │   ├── ProblemFilter.tsx
│   │   │   └── CodeDiffViewer.tsx
│   │   ├── hooks/
│   │   │   └── useProblems.ts
│   │   └── types.ts
│   ├── review/
│   │   ├── components/
│   │   │   ├── ReviewEditor.tsx    ← 'use client'
│   │   │   ├── ScoreDisplay.tsx    ← 'use client'
│   │   │   ├── ScoreBreakdown.tsx  ← 'use client'
│   │   │   └── OtherUsersReviews.tsx ← 'use client'
│   │   ├── hooks/
│   │   │   └── useReview.ts
│   │   ├── actions/
│   │   │   └── submitReview.ts     ← Server Action
│   │   └── types.ts
│   └── profile/
│       ├── components/
│       │   ├── ProgressChart.tsx
│       │   └── ReviewHistory.tsx
│       └── types.ts
│
└── shared/
    ├── ui/
    │   ├── Button.tsx
    │   ├── Badge.tsx
    │   └── Card.tsx
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   └── server.ts
    │   └── anthropic.ts
    └── types/
        └── index.ts
```

---

## 9. 実装の優先順位（Phase 1 MVP）

以下の順で実装することを推奨：

1. **shadcn/ui + Supabase のセットアップ**
2. **DBスキーマの作成（Supabase Dashboard）**
3. **問題データ5問をシードデータとして投入**
4. **問題一覧ページ（Server Component + Supabase）**
5. **問題詳細ページ（コンテキスト + diff表示）**
6. **レビュー入力フォーム（Client Component + Zustand）**
7. **Server Action でレビュー保存**
8. **Route Handler で Claude API 採点**
9. **採点結果ページ**
10. **Vercel デプロイ**

認証（Supabase Auth）は Phase 2 で追加。
MVP段階では認証なし・単一ユーザー想定でも可。

---

## 10. 環境変数

`.env.local` に以下が必要：

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## 11. 開発者への注意事項

- TypeScript は `strict: true` が設定済み。`any` 型は使用しないこと
- コンポーネントは必要になるまで `'use client'` を付けない（Server Componentがデフォルト）
- Tailwind v4 を使用（v3とは構文が異なる部分あり）
- shadcn/ui の初期化は `npx shadcn@latest init` で行う

---

## 12. 参考リソース

- Next.js App Router: https://nextjs.org/docs/app
- Supabase + Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- shadcn/ui: https://ui.shadcn.com/docs/installation/next
- TanStack Query: https://tanstack.com/query/latest
- Anthropic API: https://docs.anthropic.com/en/api/getting-started
- Google Code Review Guidelines: https://google.github.io/eng-practices/review/
