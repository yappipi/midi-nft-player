# Web3 MIDI NFT Player

## Web3 MIDI NFT Player について

Web3 MIDI NFT Player は MIDIファイルそのものをオンチェーン上に NFT として保持し、再生及び他ウォレットへの転送を行うフルオンチェーン MIDI NFT Player の dApp です。
MIDIファイルをJSON変換後zip圧縮したデータを扱うことでガス代への考慮をおこなっています。

## 機能

機能は以下の3つです。

- MIDI ファイルと任意の名前を入力として、接続されたウォレットに属する MIDI NFT として mint する
- 接続されたウォレットに属する MIDI NFT を一覧で表示し、ブラウザ上での再生を行う
- 接続されたウォレットに属する MIDI NFT を指定されたウォレットへ転送する

## 使用方法

### プロダクトURL

https://midi-nft-player.vercel.app/

### ウォレット接続

Goerli Test Network に接続します。
テストネットワーク追加はこちらのリンクから行うことができます。

![MetaMask](https://user-images.githubusercontent.com/115483245/199988714-c3324a4e-cc30-48f6-90bc-065d03652427.png)

トップ画面にて「Connect Wallet」を行います。

### MIDI NFT の mint

MIDIファイルを選択し、NFT名を入力後、「Submit」を行います。

![mint](https://user-images.githubusercontent.com/115483245/199991578-06170dbe-743e-404f-b0f4-a74a0ee6da73.png)

#### サンプルMIDIファイル

以下linkにサンプルMIDIファイルを用意しています。

- [sample1](https://midi-nft-player.vercel.app/midi/because.mid)
- [sample2](https://midi-nft-player.vercel.app/midi/A_F_NO7_01.mid)

### MIDI NFT の再生

所持 MIDI NFT リスト にて再生するMIDI NFTにて 「Play」を行います。

![play](https://user-images.githubusercontent.com/115483245/199994501-f2668b17-61fc-4984-a8fe-21bdecd54f27.png)

### MIDI NFT の転送

所持 MIDI NFT リスト にて転送するMIDI NFTにて「送付先Wallet Address」を入力後、「Transfer」を行います。

![transfer](https://user-images.githubusercontent.com/115483245/199995636-3bba5b77-523e-4e09-a8d3-c3bb48afe52c.png)

## 技術スタック

Node.js, React, Ethereum, Solidity

## スマートコントラクト

### コントラクトアドレス

0x11c0461492E2b8e8a17D51B479EA3a60bE5BccaB

### リポジトリ

https://github.com/yappipi/midi-nft-on-chain

## 利用しているライブラリ

- [midi-json-parser](https://github.com/chrisguttandin/midi-json-parser)
- [json-midi-encoder](https://github.com/chrisguttandin/json-midi-encoder)
- [PicoAudio.js](https://github.com/cagpie/PicoAudio.js)
