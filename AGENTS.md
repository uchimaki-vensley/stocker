# Stocker 開発ガイド（Codex向け）

**毎回タスク開始時に最初にこのファイルを読むこと。**

このリポジトリでは **クリーンアーキテクチャ** を前提に実装する。都度の口頭指示がなくても、以下のルールに従うこと。

## 1. レイヤーと依存方向
- **domain**: エンティティ・値オブジェクト・純粋なビジネスルールのみ。React Native / DB / 外部APIへの依存は禁止。
- **application**: ユースケース（手続きの流れ・ポリシー）。domain を組み合わせる。UI・DBの具体実装は参照しない。
- **data**: DB/HTTP/OSなど具体実装。application が定義したインターフェースの実装を置く。
- **presentation**: React Native の画面・コンポーネント・Hooks。UIのみに責務を限定する。

**依存は外側 → 内側のみ**。逆方向の参照は禁止。

## 2. フォルダ構成（指針）
- `src/domain/*`
- `src/application/*`
- `src/data/*`
- `src/presentation/*`

## 3. App.tsx の役割
- 画面のルーティング／起動時の薄い制御だけに限定する。
- UIやビジネスロジックを App.tsx に書かない。

## 4. ビジネスロジックの置き場所
- 画面内での計算・判定ロジックは **domain** へ移動。
- 複数の操作をまとめる処理は **application/usecase** に置く。
- DB操作は **data/repository** に限定する（画面から直接呼ばない）。

## 5. 命名・責務
- `*Screen.tsx`：画面
- `*Card.tsx` / `*Modal.tsx`：UI部品
- `use*`：presentation の UI 用 hook
- `*Repository.ts`：データアクセス
- `*UseCase.ts`：アプリケーション層の手続き

## 6. 変更時の方針
- 新機能は **必ずブランチを切る**（feature単位）。
- UI変更は見た目だけでなく、責務の分離も意識する。
- 追加した依存は理由を残す（コミットメッセージ or README）。

## 7. 日本語
- コードコメントやUI文言は基本 **日本語**。
