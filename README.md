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

## LoRa無線モジュール

送信用1台と受信用1台で2台使います。入手方法やモジュールの詳しい情報は以下のURLをご参照ください

<https://www.i2-ele.co.jp/LoRa.html>

## 使い方

準備中

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

```shell-session
> npx electron-rebuild
```

再構築が完了すると `Rebuild Complete` と表示されます

## ライセンス情報

* Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)
