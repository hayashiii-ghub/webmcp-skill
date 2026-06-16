# webmcp-skill

**日本語** | [English](./README.en.md)

Web アプリに **WebMCP** を追加するための Claude Code プラグインです。サイトのフォームや操作を、ブラウザ内の AI エージェントが `navigator.modelContext` 経由で呼べる「構造化ツール」として公開します（画面から推測させるのではなく、確実に操作させる）。

宣言型（フォーム注釈）と命令型（`registerTool`）の両方をカバーし、安全な既定値を内蔵しています：progressive enhancement（非対応ブラウザでは no-op）、実行時の入力検証、上限値の単一ソース化、破壊的/外向き操作の確認。

## インストール

```sh
claude plugin marketplace add hayashiii-ghub/webmcp-skill
claude plugin install webmcp@webmcp-skill
```

公開前にローカルで試す場合：

```sh
claude plugin marketplace add ./webmcp-skill
```

## 使い方

サイトのコードベースを Claude Code で開いて、例えばこう頼みます：

> コンタクトページに WebMCP を追加して。

スキルが実装を案内します：どの API を使うか・フォーム注釈／ツール登録の仕方・機微な操作の安全な扱い・WebMCP 非対応の訪問者でも壊れないようにする方法。

## 中身

```
webmcp/
  .claude-plugin/plugin.json
  skills/webmcp/
    SKILL.md                       # エージェントが読むガイダンス
    examples/
      imperative-tools.js          # registerTool 雛形（読み取り専用 / 変更系 / 確認付き）
      declarative-form.html        # 注釈フォーム雛形
```

## メモ

- WebMCP は**実験的**な仕様です（Chrome origin trial / W3C draft）。仕様が流動的なため、スキルは最新リファレンスを参照させ、正確なフィールド名・メソッド名は都度確認するよう促します。
- 本パターンは本番の命令型 WebMCP 実装から蒸留したものです。関連: W3C draft (https://webmachinelearning.github.io/webmcp)、Chrome ドキュメント (https://developer.chrome.com/docs/ai/webmcp)、`getmasset/webmcp-skill` プラグイン。

## ライセンス

MIT
