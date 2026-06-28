# Relationship Advisor

特定の1人との人間関係相談だけに使う、個人用の専用相談Webアプリです。

このアプリは、LINEログや手動メモから関係の要約を更新し、その要約・主要事項・最近の関係をもとに、直近の関係性について相談できるようにすることを目的としています。

## Features

- 1人専用の相談アプリ
- 関係の全体要約を保存
- 主要イベントを保存
- 最近の関係要約を保存
- 相談履歴を保存
- Gemini API を使った要約更新
- Gemini API を使った相談回答
- Cloudflare ベースでの低コスト運用を前提
- 将来的に DeepSeek / OpenAI などへ差し替え可能な構成を想定

## Goal

このアプリでは、毎回LINEログ全文をAIに送るのではなく、次の情報だけを相談時の入力として使います。

- 全体要約
- 主要事項
- 最近の関係
- 今回の相談内容

長期ログを毎回そのまま送るより、要約済みの状態情報を使うほうが、コストと安定性の面で扱いやすい設計です。

## Tech Stack

現時点の想定構成:

- Frontend: Cloudflare Pages
- Backend API: Cloudflare Workers
- Database: Cloudflare D1
- File storage: Cloudflare R2
- AI: Gemini API
- Language: TypeScript
- Repo: GitHub

## Architecture

### Frontend
ダッシュボード、相談画面、ログ更新画面を提供します。

### Backend
Workers が以下を担当します。

- Gemini API 呼び出し
- D1 の読み書き
- R2 へのファイル保存
- フロントへの API 提供

### Storage
- D1: 要約、主要事項、相談履歴、ログメタデータ
- R2: 元のLINE txtや長文ログ原本

## Screens

初期実装では次の3画面を想定しています。

### 1. Dashboard
- 現在の関係ステータス
- 最近の温度感
- 全体要約
- 最近の関係要約
- 主要イベント一覧
- 最終更新日時

### 2. Consultation
- 相談文の入力
- AIの回答表示
- 過去の相談履歴表示

### 3. Log Update
- 手動テキスト入力
- 将来的には LINE txt アップロード対応
- 要約更新の実行
- 主要イベント抽出
- 最近の関係更新

## Data Model

最小構成では、次のテーブルを想定しています。

### relationship_state
現在の関係状態を保存するテーブル。

| カラム | 型 | 説明 |
|---|---|---|
| id | INTEGER | PK |
| overall_summary | TEXT | 全体要約 |
| recent_summary | TEXT | 最近の関係要約 |
| current_status | TEXT | 現在のステータス |
| mood_score | INTEGER | 温度感スコア |
| updated_at | DATETIME | 最終更新日時 |

### key_events
重要イベントを保存するテーブル。

| カラム | 型 | 説明 |
|---|---|---|
| id | INTEGER | PK |
| event_date | TEXT | 発生日 |
| title | TEXT | タイトル |
| description | TEXT | 詳細 |
| importance | INTEGER | 重要度 |
| created_at | DATETIME | 作成日時 |

### consultations
相談履歴を保存するテーブル。

| カラム | 型 | 説明 |
|---|---|---|
| id | INTEGER | PK |
| question | TEXT | 相談内容 |
| answer | TEXT | AI回答 |
| created_at | DATETIME | 作成日時 |

### raw_imports
取り込んだログのメタ情報を保存するテーブル。

| カラム | 型 | 説明 |
|---|---|---|
| id | INTEGER | PK |
| source_type | TEXT | ソース種別 |
| file_name | TEXT | ファイル名 |
| r2_key | TEXT | R2のキー |
| created_at | DATETIME | 作成日時 |

## API Design

初期案:

- `GET /api/state` - 現在の関係状態を取得
- `GET /api/events` - 主要イベント一覧を取得
- `GET /api/consultations` - 相談履歴を取得
- `POST /api/consult` - 相談文を受け取り、AI回答を返して保存
- `POST /api/update-log` - 新しいログまたはメモを受け取り、要約・主要事項・最近の関係を更新
- `POST /api/import` - 将来的な txt / file import 用

## Cost Strategy

このプロジェクトでは API コスト抑制を重視します。

方針:
- 毎回の相談で生ログ全文を送らない
- 要約更新はログ追加時だけ行う
- 相談時は要約済み情報のみ送る
- Gemini API 無料枠での試作を前提にする
- 将来的にはモデル切り替え可能な構造にする

## Project Structure

予定している構成例:

```
.
├─ frontend/
│  ├─ src/
│  └─ public/
├─ worker/
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ db/
│  │  └─ lib/
│  └─ wrangler.toml
├─ migrations/
├─ shared/
├─ README.md
└─ .env.example
```

## Environment Variables

想定している環境変数:

```env
GEMINI_API_KEY=
GEMINI_MODEL=
ADMIN_TOKEN=
```

将来的に追加候補:

```env
R2_BUCKET=
D1_DATABASE_ID=
```

APIキーはフロントエンドに露出させず、Workers 側で利用します。

## Setup Plan

今後のセットアップ手順の想定:

1. GitHub リポジトリを作成
2. Cloudflare Pages / Workers プロジェクトを作成
3. D1 データベースを作成
4. 必要に応じて R2 バケットを作成
5. Gemini API キーを設定
6. マイグレーションを実行
7. フロントと Worker を接続

## Cloudflare Deploy (GitHub Push前提)

このリポジトリは、GitHub push をトリガーに Cloudflare Pages が自動デプロイする前提です。

1. Cloudflare Pages でこのGitHubリポジトリを接続
2. Build output directory を `frontend/public` に設定
3. Pages Functions で `worker/wrangler.toml` のバインディングを使用
	- D1 binding: `DB`
	- R2 binding: `RAW_LOGS`
4. 環境変数/シークレットを設定
	- `GEMINI_MODEL` (var)
	- `GEMINI_API_KEY` (secret)
	- `ADMIN_TOKEN` (secret)

### デプロイ後に最初にやること

最初のデプロイ後に、D1マイグレーションを実行してください。

```bash
cd worker
wrangler d1 migrations apply relationship-advisor-db
```

## Development Status

現在は設計と最小構成の整理段階です。

優先実装順:
1. README 整備
2. ディレクトリ構成決定
3. D1 スキーマ作成
4. Worker API 作成
5. フロントUI作成
6. Gemini API 接続
7. R2 対応

## Design Principles

- 1人専用、1テーマ専用にする
- 長いログ全文依存にしない
- できるだけ低コスト
- 構成はシンプル
- API差し替え可能
- UIは実用優先
- 相手の気持ちを断定しすぎない回答設計にする

## Future Work

- LINE txt アップロード対応
- R2 への原本保存
- 相談回答の評価機能
- タグ機能
- 時系列タイムライン表示
- AIモデル切り替え機能
- DeepSeek / OpenAI adapter 追加

## Notes

このアプリは個人用の相談補助ツールであり、相手の本音や意図を断定するものではありません。  
AI の出力は、事実・推測・不確実な点を分けて扱う前提で利用します。

## License

TBD