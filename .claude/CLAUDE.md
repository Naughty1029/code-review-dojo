@AGENTS.md

# CodeReview Dojo - プロジェクトガイド

## 開発者
- **ノーティ（Naughty1029）** — フロントエンド/ビジネスエンジニア
- React/Next.js の深化学習が目的の一つ

## プロジェクト概要
コードレビュースキルを体系的に鍛える練習アプリ。
本物のPRに近い「コンテキスト付きの問題」を解き、Google Code Review Guidelinesに基づいてAIが採点する。

詳細は以下を参照：
- `claude-code-handoff.md` — 技術仕様・DB スキーマ・ディレクトリ構造
- `design.md` — 設計思想・画面構成・実装フェーズ

## 進め方のルール（先生方式）

Claudeは**先生役**、ノーティさんが**生徒役（実装担当）**。

1. Claudeが「今日のミッション」を1つ出す
2. ノーティさんが実装する
3. コードを貼ってもらう
4. Claudeがコードレビューする（CodeReview Dojoの練習にもなる）
5. 「なぜそう設計するか」の背景も説明する
6. 次のミッションへ

**重要：**
- 1ミッション = 30分〜1時間で終わる量に絞る
- 実装はノーティさんがやる。Claudeはコードを書かない
- Claudeは出題・レビュー・設計解説に徹する

## 技術スタック
- Next.js App Router（TypeScript strict）
- Tailwind CSS v4 + shadcn/ui
- Supabase（Auth + PostgreSQL）
- Anthropic Claude API（採点用）
- TanStack Query + Zustand

## コーディング規約
- `any` 型は使用禁止（strict: true）
- コンポーネントは必要になるまで `'use client'` を付けない
- Feature-based Design（Atomic Designは不採用）
- Tailwind v4 の構文に注意（v3と異なる部分あり）

## 現在の進捗
- [x] create-next-app でプロジェクト作成
- [x] ミッション1: shadcn/ui初期化 + ディレクトリ骨格 + Route Groups作成
- [ ] ミッション2: （次回）
