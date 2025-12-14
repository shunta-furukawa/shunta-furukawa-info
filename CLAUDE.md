# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

個人ポートフォリオサイト（shunta-furukawa.info）のHugoプロジェクト。GitHub Pagesでホスティング。

## 開発コマンド

```bash
# ローカルサーバー起動（http://localhost:1313）
hugo server

# サイトビルド（publicディレクトリに出力）
hugo

# 新規記事作成
hugo new posts/<記事名>.md
```

## デプロイ手順

`public`ディレクトリはGitHub Pages用の別リポジトリとしてサブモジュール管理されている。

```bash
# 1. ビルド
hugo

# 2. publicをコミット・プッシュ
cd public && git add . && git commit -m "Deploy updates" && git push origin master && cd ..

# 3. 本リポジトリをコミット
git add . && git commit -m "Update site content" && git push origin master
```

## アーキテクチャ

### テーマ構造
- **テーマ**: `themes/shunta-furukawa-info/` （カスタムテーマ）
- **ベースレイアウト**: `layouts/_default/baseof.html` → head, header, main, footer
- **トップページ**: `layouts/index.html` → ヒーローセクション、スキルセクション
- **ストーリーページ**: `layouts/story/single.html` → キャリア・経歴表示

### データ駆動コンテンツ
`data/`ディレクトリのYAMLファイルでコンテンツを管理:

- **`data/skills/`**: スキルセット情報（category, color, items配列）
  - ファイル名のプレフィックス（`_1_`, `_2_`など）で表示順を制御
- **`data/stories/`**: キャリア・経歴情報（title, period, descriptions, skills）
  - ファイル名は年月（`_YYYYMM.yaml`）

### CSS構成
`themes/shunta-furukawa-info/assets/css/`:
- `main.css` - 共通スタイル
- `hero.css` - ヒーローセクション
- `skill.css` - スキル表示
- `story.css` - ストーリーページ
- `siteheader.css` - ヘッダー

### 外部ライブラリ
- [AOS](https://github.com/michalsnik/aos) - スクロールアニメーション
