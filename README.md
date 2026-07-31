# わたしの日記 (my-journal-pwa)

iPhone の「ホーム画面に追加」でアプリのように使える、自分専用のジャーナリング PWA です。
ビルド不要の素の HTML / CSS / JavaScript のみで作られています。

## 機能

- 日記の新規作成（日付・タイトル・本文・5段階の気分絵文字）
- 月ごとのカレンダー表示と、日付をタップした一覧の絞り込み
- 本文・タイトルのキーワード検索
- 日記の編集・削除
- データは端末内の LocalStorage にのみ保存（外部送信なし）
- オフライン起動に対応（Service Worker によるアプリシェルのキャッシュ）
- ダークモード / ライトモード自動切り替え（`prefers-color-scheme`）

## 使い方（ローカルで確認する場合）

Service Worker は `file://` では正しく動作しないため、簡易サーバーを立てて確認してください。

```bash
cd my-journal-pwa
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。iPhone の実機で試す場合は、同一 Wi-Fi 上の
PC でサーバーを起動し、`http://<PCのIPアドレス>:8000` に Safari からアクセスしてください
（本番運用時は HTTPS 配信を推奨します。GitHub Pages 等の HTTPS ホスティングであれば
そのまま公開できます）。

## iPhone のホーム画面に追加する

1. Safari で本アプリの URL を開く
2. 共有ボタン（□に↑）をタップ
3. 「ホーム画面に追加」を選択

ホーム画面のアイコンから起動すると、URL バーのない全画面（standalone）表示になります。

## ファイル構成

```
index.html          アプリ本体（一覧・検索・新規作成の3画面）
manifest.json        PWA マニフェスト（standalone 表示・アイコン設定）
sw.js                 Service Worker（アプリシェルのオフラインキャッシュ）
css/styles.css        スタイル（ダーク/ライト対応、iPhone セーフエリア対応）
js/app.js             アプリロジック（データ保存・カレンダー・検索・フォーム）
icons/                ホーム画面アイコン各サイズ
```

## データについて

日記データはすべてブラウザの LocalStorage（キー: `journal_entries_v1`）に保存されます。
サーバーには一切送信されません。Safari の「履歴とWebサイトデータを消去」を行うと
データも削除されるためご注意ください。
