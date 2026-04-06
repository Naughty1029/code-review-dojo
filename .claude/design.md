# CodeReview Dojo - 設計書

## 1. プロジェクト概要

### アプリ名
**CodeReview Dojo（コードレビュー道場）**

### コンセプト
「本物のPRに近い文脈付きの問題」を解くことで、コードレビュースキルを体系的に鍛える練習アプリ。
Google Code Review Guidelinesに基づいたAI採点と、他ユーザーのレビュー案の参照で学びを深める。

### ターゲットユーザー
- Phase 1：自分（ノーティさん）のみ
- Phase 2：他のエンジニアもアカウント作成・利用可能
- Phase 3：ユーザー間でレビュー案を参照し合う

---

## 2. 課題の設計思想

### 「プロジェクト背景がないとレビューできない問題」への解決策

コードだけ見せても実際のレビューにならない。
**各問題には必ず「コンテキストカード」を付与する。**

```
コンテキストカードの構成：
① プロジェクト概要（どんなサービスか、技術スタック）
② PRの説明文（何のための変更か）
③ コードの差分（before/after または変更箇所のみ）
④ 難易度・カテゴリ
```

これにより「本物のPRレビュー」に近い体験を再現する。
（実際のGitHubのPRも、description + diff の構成）

### 問題のカテゴリ（初期ラインナップ）

| カテゴリ | 例 |
|---|---|
| React Patterns | 不要な再レンダー、useEffectの誤用 |
| TypeScript | any型の乱用、型ガード漏れ |
| パフォーマンス | N+1問題、メモ化の過不足 |
| セキュリティ | XSS、認証漏れ、APIキー露出 |
| 可読性・命名 | 命名のミス、複雑すぎる関数 |
| テスト | テストが不十分、境界値テスト漏れ |

### 難易度
- **Easy**：明らかなバグ・アンチパターン（1〜2個の問題）
- **Medium**：複合的な問題（3〜4個の問題）
- **Hard**：設計レベルの判断が必要（5個以上、トレードオフあり）

---

## 3. 採点基準

Google Code Review Guidelinesをベースに5観点で採点。

| 観点 | 配点 | 説明 |
|---|---|---|
| 設計・アーキテクチャ | 20点 | コンポーネント設計、責務分離の指摘 |
| 機能・正確性 | 20点 | バグ・ロジックエラーの発見 |
| 可読性・命名 | 20点 | 命名、コメント、複雑度の指摘 |
| セキュリティ・パフォーマンス | 20点 | セキュリティリスク、最適化の指摘 |
| テスト・エッジケース | 20点 | テスト不足、境界値の指摘 |

**合計100点満点**

AIが「期待されるレビューポイント」と照合して採点し、
見落とした点・良かった点のフィードバックを返す。

---

## 4. APIキー方針

### 結論：MVP はサーバーサイドAPIキー、v2でユーザー提供キー

**理由：**
- ユーザーがAPIキーを入力するUXは摩擦が高い
- キーのブラウザ経由送信はセキュリティリスクがある
- まず自分だけが使うPhase 1ではサーバーキーで十分

**実装方針：**
```
Phase 1（MVP）：
→ .env に ANTHROPIC_API_KEY を設定
→ Route Handler のサーバーサイドのみで使用
→ クライアントには一切キーが露出しない

Phase 2（マルチユーザー対応時）：
→ ユーザーが自分のAPIキーをプロフィールに登録
→ Supabaseに暗号化して保存（AES-256）
→ スコアリング時にユーザーのキーを優先使用
→ キーがない場合はサーバーキー（使用量制限付き）
```

---

## 5. 技術スタック

```
フレームワーク：  Next.js 15 App Router（TypeScript strict）
スタイリング：    Tailwind CSS v4 + shadcn/ui
認証：           Supabase Auth（GitHub OAuth + メール）
DB：             Supabase（PostgreSQL）
AI：             Anthropic Claude API（claude-sonnet-4-5）
データフェッチ：  TanStack Query（Client Component側）
状態管理：       Zustand（レビューフォーム入力状態）
デプロイ：       Vercel
```

---

## 6. 画面構成

```
/                       → ランディング・ログイン誘導
/login                  → ログイン画面（GitHub / メール）
/problems               → 問題一覧（難易度・カテゴリでフィルタ）
/problems/[id]          → 問題詳細（コンテキスト + diff + レビュー入力）
/problems/[id]/results  → 採点結果 + AIフィードバック + 他ユーザーのレビュー
/profile                → 自分の解答履歴 + 観点別スコア推移
```

---

## 7. DBスキーマ

### problems（問題マスタ）
```sql
id              uuid PRIMARY KEY
title           text NOT NULL
description     text NOT NULL         -- 問題の説明
context         jsonb NOT NULL        -- { project_overview, tech_stack, pr_description }
code_before     text                  -- 変更前コード（nullable）
code_after      text NOT NULL         -- 変更後コード（レビュー対象）
code_diff       text                  -- diff形式（生成済み）
difficulty      text NOT NULL         -- 'easy' | 'medium' | 'hard'
category        text NOT NULL         -- カテゴリ名
expected_issues jsonb NOT NULL        -- AIが採点に使う期待レビューポイント（非公開）
is_published    boolean DEFAULT false
created_at      timestamp DEFAULT now()
```

### reviews（ユーザーのレビュー投稿）
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES auth.users
problem_id      uuid REFERENCES problems
comment         text NOT NULL         -- ユーザーが書いたレビュー
score           integer               -- 0-100点
score_breakdown jsonb                 -- 5観点の内訳
ai_feedback     text                  -- AIからのフィードバック文
is_public       boolean DEFAULT true  -- 他ユーザーに公開するか
created_at      timestamp DEFAULT now()
```

### user_profiles（ユーザー設定）
```sql
id              uuid PRIMARY KEY REFERENCES auth.users
display_name    text
anthropic_api_key text               -- 暗号化（Phase 2）
created_at      timestamp DEFAULT now()
```

---

## 8. ディレクトリ構造

```
code-review-dojo/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (app)/                        ← 認証必須ルートグループ
│   │   ├── layout.tsx                ← 認証チェック
│   │   ├── problems/
│   │   │   ├── page.tsx              ← Server Component（問題一覧）
│   │   │   └── [id]/
│   │   │       ├── page.tsx          ← 問題詳細
│   │   │       └── results/
│   │   │           └── page.tsx      ← 採点結果
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   └── score/
│   │       └── route.ts              ← Claude API呼び出し
│   ├── layout.tsx
│   ├── page.tsx                      ← ランディング
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
│   │
│   ├── review/
│   │   ├── components/
│   │   │   ├── ReviewEditor.tsx       ← レビュー入力（Client Component）
│   │   │   ├── ScoreDisplay.tsx
│   │   │   ├── ScoreBreakdown.tsx
│   │   │   └── OtherUsersReviews.tsx
│   │   ├── hooks/
│   │   │   └── useReview.ts
│   │   ├── actions/
│   │   │   └── submitReview.ts        ← Server Action
│   │   └── types.ts
│   │
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
    │   │   ├── client.ts             ← ブラウザ用
    │   │   └── server.ts             ← サーバー用
    │   └── anthropic.ts
    └── types/
        └── index.ts
```

---

## 9. Server Component / Client Component の使い分け

| 画面・コンポーネント | 種別 | 理由 |
|---|---|---|
| 問題一覧ページ | Server Component | DBから問題を取得、SEOも考慮 |
| CodeDiffViewer | Server Component | 表示のみ、インタラクションなし |
| ReviewEditor | Client Component | テキスト入力、Zustandで状態管理 |
| ScoreDisplay | Client Component | 採点後のアニメーション表示 |
| OtherUsersReviews | Client Component | TanStack Queryでキャッシュ管理 |
| ProgressChart | Client Component | rechartsはClient必須 |

---

## 10. 実装フェーズ

### Phase 1（MVP・自分だけ）
- [ ] Supabase セットアップ（Auth + DB）
- [ ] 問題一覧ページ（Server Component）
- [ ] 問題詳細ページ（コンテキスト + diff表示）
- [ ] レビュー投稿フォーム（Client Component + Server Action）
- [ ] Claude APIで採点（Route Handler）
- [ ] 採点結果表示
- [ ] Vercelデプロイ

### Phase 2（マルチユーザー）
- [ ] ユーザー登録・ログイン（Supabase Auth）
- [ ] 他ユーザーのレビュー参照機能
- [ ] ユーザー別APIキー設定
- [ ] 問題の使用量制限

### Phase 3（コミュニティ）
- [ ] レビューへのリアクション（いいね）
- [ ] 問題のリクエスト機能
- [ ] ランキング

---

## 11. 問題データのサンプル（初期5問）

AIで事前生成してDBに投入する。

| # | タイトル | カテゴリ | 難易度 |
|---|---|---|---|
| 1 | useEffectの依存配列が空になっているReactコンポーネント | React Patterns | Easy |
| 2 | any型を多用したAPI呼び出し処理 | TypeScript | Easy |
| 3 | 認証チェックが不完全なAPIルート | セキュリティ | Medium |
| 4 | 不要な再レンダーを引き起こすコンポーネント設計 | React Patterns / パフォーマンス | Medium |
| 5 | N+1クエリが発生しているデータ取得処理 | パフォーマンス | Hard |
