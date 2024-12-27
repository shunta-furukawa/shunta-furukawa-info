# README.md

## 概要
このリポジトリは [Hugo](https://gohugo.io/) を使用して静的サイトを生成し、GitHub Pages を使って公開するためのものです。`public` フォルダは GitHub Pages 用のリポジトリとしてサブモジュール化されています。

---

## リポジトリ構成

```
.
├── archetypes
│   └── default.md
├── hugo.toml
├── public                # サブモジュールとして管理されるディレクトリ
├── themes                # 使用するHugoテーマ
└── その他のコンテンツや設定
```

- **archetypes**: 新規コンテンツ作成時のテンプレートが格納されています。
- **hugo.toml**: Hugo サイトの設定ファイル。
- **public**: ビルドされた静的ファイルを格納するディレクトリ（GitHub Pages 用リポジトリとしてサブモジュール管理）。
- **themes**: 使用するテーマのファイル。

---

## 環境構築

### 必要なツール
- [Hugo](https://gohugo.io/getting-started/installing/) （拡張版推奨）
- Git

---

## 初期セットアップ

1. **リポジトリのクローン**

   ```bash
   git clone --recurse-submodules <このリポジトリのURL>
   cd <このリポジトリ名>
   ```

   > サブモジュールを含めてクローンするために `--recurse-submodules` オプションを使用します。

2. **サブモジュールを更新**

   ```bash
   git submodule update --init --recursive
   ```

3. **依存ツールのインストール**
   Hugo がインストールされていることを確認してください。

---

## ローカル環境での開発

1. **ローカルサーバーを起動**

   ```bash
   hugo server
   ```

   サーバーが起動し、[http://localhost:1313](http://localhost:1313) でサイトをプレビューできます。

2. **コンテンツの追加**

   新しい記事を作成するには以下のコマンドを実行します：

   ```bash
   hugo new posts/<記事名>.md
   ```

---

## デプロイ手順

1. **サイトをビルド**

   ```bash
   hugo
   ```

   これにより、`public` ディレクトリに静的ファイルが生成されます。

2. **`public` をサブモジュールとしてコミット**

   ```bash
   cd public
   git add .
   git commit -m "Deploy updates"
   git push origin master
   cd ..
   ```

   > サブモジュールとして `public` を更新し、GitHub Pages にデプロイします。

3. **本リポジトリをコミット**

   ```bash
   git add .
   git commit -m "Update site content"
   git push origin main
   ```

---

## 注意点
- `public` ディレクトリは GitHub Pages 用のサブモジュールとして管理されているため、変更を忘れずにコミットしてください。
- ローカルで `hugo server` を使って確認し、問題がないことを確認してからデプロイしてください。

---

## 仕様ライブラリ
[AOS](https://github.com/michalsnik/aos)

---

## 参考リンク
- [Hugo Documentation](https://gohugo.io/documentation/)
- [GitHub Pages](https://pages.github.com/)
