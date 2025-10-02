<h1 align="center">
  <img src="./public/og-image.png" alt="ReturnMeTags!" />
</h1>

## ReturnMeTags! とは

ReturnMeTags! は、迷子になった持ち物が戻ってくる確率を高める「連絡先付きタグ」を、ブラウザだけで手軽に作成できるジェネレーターです。名前・連絡先・カラー・フォントを入力すると、L版サイズにぴったり敷き詰めたタグシートを生成し、PNGとしてダウンロードできます。生成された画像は完全にクライアントサイドで処理され、送信や保存は行われません。ネットプリントなどでシール用紙に印刷すれば、そのまま持ち物に貼って使えます。

## Docker を使った開発の始め方

1. リポジトリをクローンします。
   ```bash
   git clone <your-repo-url>
   cd <your-repo-dir>
   ```
2. Docker イメージをビルドします。
   ```bash
   docker build -t qr-name-tag:latest .
   ```
3. コンテナを起動します。
   ```bash
   docker run --rm -it -p 3000:3000 qr-name-tag:latest
   ```
4. ブラウザで http://localhost:3000 を開き、ReturnMeTags! を確認します。

開発コンテナを停止する場合は、ターミナルで `Ctrl+C` を押してください。
