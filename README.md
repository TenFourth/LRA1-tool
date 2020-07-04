# LRA1-tool

LoRaの通信距離を計測するためのツールです

## 構成

* Windows PC
* GPSモジュール
* LoRa無線モジュール (株式会社アイ・ツー LRA1) 2台

### Windows PC

Windowsは日本語 64Bit版をお使いください。動作確認は Windows 10 Home で行っています

### GPSモジュール

NMEAデータを出力するモジュールであれば基本的に対応可能です。位置が正常に取得できないケースがありましたら、issueを上げてサンプルデータを添付頂ければ可能な限り対応いたします

### LoRa無線モジュール

送信用1台と受信用1台で2台使います。入手方法やモジュールの詳しい情報は以下のURLをご参照ください

<https://www.i2-ele.co.jp/LoRa.html>

## 準備

LoRaモジュールにデータ送信と受信のプログラムをセットしておきます。 `AUTO` 変数に実行したいコマンドをセットして起動と同時に実行するようにします

### 送信用プログラムのセットアップ

```vbnet
AUTO="DO:SEND 1234567890:DELAY 5000:LOOP"
SSAVE
```

* 上記のプログラムでは5秒おきにデータを送信します。間隔を変えたい場合は `DELAY` の値を適宜変更してください

### 受信用プログラムのセットアップ

```vbnet
AUTO="RECV"
SSAVE
```

### 設置

* 送信用プログラムをセットしたモジュール(送信側)には電源を接続し出発点に置いたままにします
* 受信用プログラムをセットしたモジュール(受信側)にはPCと繋ぎ、本ツールで受信したデータとRSSI(電波感度)を受取って記録します

## 使い方

### 1. ツールの起動

setupプログラムを実行した後、デスクトップとスタートメニューに [lra1-tool] のアイコンが作成されますので、そこからツールを起動できます

ツールの起動前に各モジュールはPCに繋いだ状態にしておきます

### 2. 設定

最初に起動した時は [設定] ボタンをクリックして必要な設定を行ってください

* GPSモジュールの COM ポートを指定して、Baudrateを選びます
* LoRaモジュールの COM ポートを指定して、Baudrateを選びます(モジュールの設定を変えていない場合は 115200 です)
* ログファイルの保存先を設定します。空白の場合や存在しない場所が設定されている場合はファイルが保存されません

設定が完了したら [OK] をクリックします

COMポートの一覧にモジュールのポートが表示されない場合は、[キャンセル] を押して設定画面を閉じた後に再度 [設定] をクリックして画面を開きなおしてください

### 3. ログ

Preview欄にモジュールの出力する文字列が正しく表示されている事をご確認ください

* GPSモジュールは `$GP` で始まる文字が確認できればOKです
* LoRaモジュールには `@` で始まって数字がいくつか並んでいる状態(LoRa通信が正しく行われた場合)か `>>timeout` などのエラーメッセージ(LoRa通信が失敗した場合)が確認できればOKです

PCとGPSモジュール、受信側LoRaモジュールを外に持ち出してGPSモジュールが測位するまで待ちます。測位が出来れば `Location` 欄の lat と lng (緯度経度)の値が表示されます

測位が出来たら [ログ開始] をクリックして、動き回ってみましょう。ログを止めるには [ログ停止] をクリックします

保存先に指定した場所に `日付-時刻.csv` の形でログファイルが生成されています

### 4. GeoJSONで地図上に表示する

国土地理院が提供する地理院地図(<https://maps.gsi.go.jp/>)を使えば、動き回った場所とRSSIを視覚的に確認することができます

* 地理院地図に読み込むための GeoJSON ファイルは、本ツールの [Convert] 画面から作成します
  * ログのCSVファイルを選択して [変換] ボタンをクリックすれば生成されます
* 地図の画面で [ツール] → [作図・ファイル] のサブウィンドウを表示してから、フォルダのアイコン(ファイルからデータを読込み)をクリックしてGeoJSONファイルを指定します
  * または、GeoJSONファイルを地図上にドラッグ&ドロップしても開くことができます
* RSSIの強度によって印の色が変わります
  * 0 ～ -100 は青の印になります(良好)
  * -101 ～ -120 は緑の印になります(低下)
  * -121 ～ -137 は赤の印になります(悪い)
  * 受信に失敗した場所は `×` になります

印の色を区別する閾値は本ツール作者の目安値ですので参考程度に留めてください

## 開発者向け情報

### electronの再構築

NODE_MODULE_VERSION の不一致でserialportの読込みに失敗する場合は electron-rebuild を実行してください

```shell-session
App threw an error during load
Error: The module '\\?\C:\Users\zuzuk\Desktop\Develop\LRA1-tool\node_modules\@serialport\bindings\build\Release\bindings.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 72. This version of Node.js requires
NODE_MODULE_VERSION 80. Please try re-compiling or re-installing
```

このようなエラーが出た場合は、 `electron-rebuild` を実行すると改善されます

```shell-session
> npx electron-rebuild
```

再構築が完了すると `Rebuild Complete` と表示されます

## ライセンス情報

* Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)
