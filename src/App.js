// React
import { React, useEffect, useState } from 'react';

// UI
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Contract
import { ethers } from 'ethers';
import songContractJson from './utils/SongStorage.json';
import { CONTRACT_ADDRESS } from './constants';

// MIDI
import { Song, toERC721Body, toEntity } from './utils/ERC721BodyConverter';
import { compress, decompress } from './utils/MidiCompressor';

// Constants
const GOERLI_NETWORK_VERSION = "5";
const TWITTER_HANDLE = 'yappi_web3';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const ViewMode = Object.freeze({
  MENU : Symbol(0),
  MINT : Symbol(1),
  PLAY_LIST : Symbol(2),
});

const App = () => {
  const [_viewMode, setViewMode] = useState(ViewMode.MENU);
  const [_account, setAccount] = useState(null);
  const [_songContract, setSongContract] = useState(null);
  const [_nftName, setNFTName] = useState("");
  const [_selectedFileName, setSelectedFileName] = useState("");
  const [_selectedFile, setSelectedFile] = useState(null);  
  const [_songs, setSongs] = useState([]);
  const [_destAddress, setDestAddress] = useState(null);

  let picoAudio;

  const connectEthereumApi = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask などのウォレット接続プラグインをインストールしてください。");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const validateChain = async () => {
    try {
      if (window.ethereum.networkVersion !== GOERLI_NETWORK_VERSION) {
        alert("Goerli Test Network に接続してください!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const isConnectedWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
  
        setAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      await connectEthereumApi();
      await validateChain();
      await isConnectedWallet();

      if (_account) {
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Connected Wallet:", account);
  
        setAccount(account);
      } else {
        console.log("Failed Connect Wallet");
      }      
    } catch (error) {
      console.log(error);
    }
  };

  const connectSongContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        songContractJson.abi,
        signer
      );
  
      setSongContract(contract);
    } catch (error) {
      console.log(error);
    }
  };

  const getSongsFromChain = async () => {
    const songs = await _songContract.getSongs();

    console.log("getSongsFromChain: ", songs);

    setSongs(songs);
    setViewMode(ViewMode.PLAY_LIST);
  };

  const mintSong = async (songName, arrayBuffer) => {
    if (!songName) {
      return;
    }

    if (!arrayBuffer) {
      return;
    }

    const compressed = await compress(arrayBuffer);

    console.log("compressed: ", compressed);

    const song = new Song(songName, compressed);
    const erc721Body = await toERC721Body(song);

    console.log("erc721Body: ", erc721Body);

    const txn = await _songContract.mint(songName, erc721Body);

    console.log("mint txn: ", txn);

    backToMenu();
  };

  const getMidiFromChain = async (tokenId) => {
    const txn = await _songContract.tokenURI(tokenId);
    
    console.log("tokenURI : ", txn);

    const song = await toEntity(txn);

    return decompress(song.score);
  };

  const playSong = (tokenId) => async () => {
    if(picoAudio) {
      picoAudio.pause();
    }

    const midi = await getMidiFromChain(tokenId);

    console.log(midi);

    var { default: PicoAudio } = require("picoaudio");
    picoAudio = new PicoAudio();
    picoAudio.init();   
    const parsedData = picoAudio.parseSMF(midi);
    picoAudio.setData(parsedData);
    picoAudio.play();     
  };

  useEffect(() => {
    if (!_account) {
      return;
    }

    connectSongContract();
  }, [_account]);

  const backToMenu = () => {
    setViewMode(ViewMode.MENU);
    setSelectedFileName("");
    setSelectedFile(null);
    setSongs([]);
    setDestAddress(null);

    if(picoAudio) {
      picoAudio.pause();
    }
  }

  const renderInputForm = () => {  
    return (
      <form>
        <div>
          <input
            type="file"
            className="file-button"
            accept="audio/midi"
            onChange={(_event) => {
              const selectedFile = _event.target.files[0];
              console.log("name: ", selectedFile.name);

              setSelectedFile(selectedFile);
              setSelectedFileName(selectedFile.name);
            }}
          />          
          <label
            className="file-name-text"
          >
            { _selectedFileName }
          </label>
        </div>
        <div>
          <input
            type="text"
            placeholder="NFT MIDI 名を入力してください"
            className="content-input-name"
            onChange={(_event) => {
              const nftName = _event.target.value;
              setNFTName(nftName);
            }}
          />

          <button 
            type="button" 
            className="submit-button content-sub-button"
            onClick={submitForm}>
              Submit
          </button>
        </div>

        <div>
          <a
              href="./midi/because.mid"
              className="sample-midi-text"
              target="_blank"
              rel="noreferrer"
            >sample-midi1</a>
        </div>
        <div>
          <a
              href="./midi/A_F_NO7_01.mid"
              className="sample-midi-text"
              target="_blank"
              rel="noreferrer"
            >sample-midi2</a>
        </div>
      </form>
    );
  }

  const submitForm = async (event) => {
    if (!_selectedFile) {
      alert("MIDIファイルを選択してください。");
      return;
    }

    if (_selectedFile.size > 1024 * 100) {
      alert("指定できるMIDIファイルは100KBが上限です。");
      return;
    }

    if (!_nftName) {
      alert("NFT名を入力してください。");
      return;
    }

    console.log("submitForm");

    var fileReader = new FileReader();

    fileReader.onload = function () {
      console.log("onload");
      console.log("name : ", _nftName);

      const arrayBuffer = fileReader.result;
      console.log("arrayBuffer : ", arrayBuffer);

      mintSong(_nftName, arrayBuffer);
    }
    
    fileReader.readAsArrayBuffer(_selectedFile);
  };

  const transfer = (tokenId) => async () => {
    console.log("tokenId : ", tokenId);
    console.log("destAddress : ", _destAddress);

    const txn = await _songContract.transferFrom(_account, _destAddress, tokenId);

    console.log("mint txn: ", txn);

    backToMenu()
  }

  const renderSongNFTs = () => {
    return (
      _songs.map((_song) => (
        <div 
          key={_song.tokenId} >
          <button
            className="cta-button content-button content-list-button"
            onClick={playSong(_song.tokenId)}
            key={_song.tokenId}
          >
            {`Play - id#${_song.tokenId} : ${_song.name}`}
          </button>

          <form>
            <input
              type="text"
              className="content-input"
              placeholder="送付先 Wallet Address を入力してください"
              onChange={(_event) => {
                const destAddress = _event.target.value;
                setDestAddress(destAddress);
              }}
            />

            <button 
              type="button" 
              className="cta-sub-button content-sub-button"
              onClick={transfer(_song.tokenId)}>
                Transfer
            </button>
          </form>
        </div>
      ))  
    );
  }

  const renderBackButton = () => {
    return (
      <div>
        <p className="control-back-button-text"> Menu へ戻る</p>
        <button
        className="cta-button content-button"
        onClick={backToMenu}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const renderContent = () => {    
    if (_account && _songContract) {
      switch (_viewMode) {
        case ViewMode.MENU:
        default:
          return (
            <div className="control-panel-container">
              <p className="control-panel-text"> MIDI ファイルを NFT としてオンチェーンプレイリストに追加する </p>
              <button
                className="menu-button"
                onClick={() => { setViewMode(ViewMode.MINT) }}
              >
                Mint Song
              </button>
              <p className="control-panel-text"> プレイリストを表示する </p>
              <button
                className="menu-button"
                onClick={getSongsFromChain}
              >
                Play List
              </button>
            </div>
          );
        case ViewMode.MINT:
          return (
            <div className="control-panel-container">
              <p className="control-panel-text"> MIDI ファイルを選択、NFT名を入力して「Submit」 </p>
              { renderInputForm() }
              { renderBackButton() }
            </div>        
          );
        case ViewMode.PLAY_LIST:
          return (
            <div className="control-panel-container">
              <p className="control-panel-text"> 所持 MIDI NFT リスト </p>
              { renderSongNFTs() }
              { renderBackButton() }
            </div>          
          );          
      }
    } else {
      return (
        <div className="connect-wallet-container">
          <button
            className="connect-wallet-button"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        </div>        
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">Web3 MIDI NFT Player</p>
          <p className="sub-text"> - フルオンチェーン MIDI NFT プレイヤー & Transfer - </p>
          <img src="./music_norinori_man.png" alt="character" width="250" />
          { renderContent() }
        </div>
        <div className="footer-container">
          <div>
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built with @${TWITTER_HANDLE}`}</a>
          </div>
          <a
            className="licence-text"
            href="./ThirdPartyNotices.txt"
            target="_blank"
            rel="noreferrer"
          >ThirdPartyNotices</a>
        </div>
      </div>
    </div>
  );
};

export default App;
