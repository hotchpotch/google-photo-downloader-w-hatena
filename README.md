## yarn -s extract

引数のファイル群から、Google Photos の URL を抽出して標準出力に表示する。

```
$ yarn -s extract ~/HatenaBlogSync/data/my.hatenablog.com/**/*.md > download.list
```

## yarn download

```
$ yarn download -h
$ yarn download -l download.list
```

- 前提として、ダウンロードしたい画像にアクセスできる、ログイン済みの Google Chrome が必要。
  - 現在ログインしているブラウザでないと、画像がダウンロードできない
  - そのため、puppeteer を使ってログインしている Chrome 経由で画像をダウンロードさせる
- 実行時は、起動している Google Chrome 終了させた後に、 yarn download を実行する
- `-l` オプションで指定する、google photos の画像リストをもとにダウンロード
  - 画像リストは　 google photos の url の羅列リスト。 /s1200/ のようなサムネイルサイズを含んで OK。
  - yarn extract で抽出したファイル

例: `download.list`

```
https://lh3.googleusercontent.com/-nlYCT9o7SVQ/XKH-EWEwgII/AAAAAAAA_pM/WDK5sNv0sDUJe9PiYKHIjT2BFBOPpl6nwCLcBGAs/s1200/20190302-20190302-DSC05666.jpg
https://lh3.googleusercontent.com/-RlhNdg46VDc/XKH8yatb7rI/AAAAAAAA_ok/B4pgaJ0bU7wJq8MWNRtmA4_WkqJpvPmZwCLcBGAs/s1200/20190302-20190302-DSC05597.jpg
...
```

- chrome の path とか　 userDataDir とか profile とかは環境に合わせて変える
- デフォルトでは ./photos に画像をダウンロードする
- 完了すると、`download.result` に `URL,ダウンロードしたファイル名` というファイルが作られる
- `-t` のタイムアウトは標準だと 30 秒(30000)だけど、ネットワークが遅い環境だともっと長めにとったほうが良いかも。

## yarn fotolife-upload

```
$ yarn fotolife-upload -h
$ yarn fotolife-upload -u hatena-id -a apikey
```

- ./photos/ にダウンロードした画像をもとに、はてなフォトライフにアップロードする。
- apikey は AtomPub の　 API キー
  - はてなブログの詳細設定から取得できる
  - http://blog.hatena.ne.jp/my/config/detail
- fotolife にアップロードされる画像サイズ、オリジナル画像の保存等の設定は https://f.hatena.ne.jp/my/config から。
  - 画像サイズのおすすめはお好みで(1200px ぐらいが個人的にはちょうどよい)、オリジナル画像の保存はオン。
  - デフォルトでは、fotolife の `Google Photos` フォルダーにアップロードされる
- アップロードが成功した画像は、`./fototolife_result/${ファイル名}.data` にファイルが作られる
  - 中身はアップロードされた URL がテキストで格納されてる
  - 例: https://cdn-ak.f.st-hatena.com/images/fotolife/s/secondlife/20200730/20200730064312.jpg
  - これは 1200px 設定なら長辺 1200px の画像
  - オリジナルの元画像は、拡張子の前に `_original` をつけるとアクセスできる
  - 例: https://cdn-ak.f.st-hatena.com/images/fotolife/s/secondlife/20200730/20200730064312_original.jpg
- はてなフォトライフは無料だと 1 月あたり 300MB, 有料だと 3GB アップロードできる
  - ので、画像容量が気になる人はアップドード前に photos 以下の画像を適当に縮小してください。
  - 例: imagemagick を使って長辺が 2048px 以下に変換 `mogrify -resize '2048>' photos/*.jpg`

## yarn -s generate-photo-mapping-csv ./fotolife_results/ download.json

- ./fotolife_results/ のファイルと download.json ファイルを元に、 `置換元URL,置換後URL` な csv ファイルを標準出力に出力する

```
$ yarn -s generate-photo-mapping-csv ./fotolife_results/ download.json > replace-list.csv
```

## yarn replace-photo-url

- -i で指定したファイルに基づいて url の置換を行う
  - ファイルの中身は、以下のような `,` 区切りの単純な CSV

```
置換元URL,置換後URL
https://lh3.googleusercontent.com/-nlYCT9o7SVQ/XKH-EWEwgII/AAAAAAAA_pM/WDK5sNv0sDUJe9PiYKHIjT2BFBOPpl6nwCLcBGAs/s1200/20190302-20190302-DSC05666.jpghttps://lh3.googleusercontent.com/-nlYCT9o7SVQ/XKH-EWEwgII/AAAAAAAA_pM/WDK5sNv0sDUJe9PiYKHIjT2BFBOPpl6nwCLcBGAs/s1200/20190302-20190302-DSC05666.jpg,https://cdn-ak.f.st-hatena.com/images/fotolife/s/secondlife/20200730/20200730064312.jpg
```
