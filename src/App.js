import React, { useState, useRef, useEffect } from 'react';
import Quagga from "quagga";

function App() {
    const [selectedTab, setSelectedTab] = useState(null);
    const [barcode,setBarcode] = useState("") // バーコードの値
    const [savedImage, setSavedImage] = useState("https://3.bp.blogspot.com/-Qw2v7ui_SZs/VahRZXAxmjI/AAAAAAAAvqk/_1H3LsFxAlc/s800/barcode_reader.png"); // スキャンした時のバーコード画像
    const [cameraActive, setCameraActive] = useState(false);  // 写真入力を判定する

    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [error, setError] = useState('');
  
    const correctPassword = '1234'; 
    const handleLogin = () => {
      if (password === correctPassword) {
        setLoggedIn(true);
        setError('');
      } else {
        setError('パスワードが違うよ～！');
      }
    };
    
    // Quagga初期化のおまじない
    const startCamera = () => {
      const config = {
        inputStream: {
          name : "Live",
          type : "LiveStream",        
          target: '#preview',
          size: 1000,
          singleChannel: false
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        decoder: {
          readers: [{
            format: "ean_reader",
            config: {}
          }]
        },
        numOfWorker: navigator.hardwareConcurrency || 4,
        locate: true,
        src: null
      };

      Quagga.init(config, function(err) {
          if (err) {
              console.log(err);
              return;
          }
          Quagga.start();
        });
    };

    useEffect(() => {
        //Quaggaライブラリでバーコードが検出されたら実行される関数。引数のresultには検出情報が含まれる。
        Quagga.onDetected(result => {
          if (result !== undefined){
            setBarcode(result.codeResult.code);
            const canvas = Quagga.canvas.dom.image;
            const imgSrc = canvas.toDataURL();  // Base64形式
            // このimgSrcをどこかのuseStateに保存して、後で表示する
            setSavedImage(imgSrc);

            Quagga.stop();  // ここでカメラを停止
            setCameraActive(false);  // カメラの状態をアップデート
              }
          });
        // カメラがアクティブなら起動
        if (cameraActive) {
            setBarcode("スキャン中")
            startCamera();
        }
        if(selectedTab == "manual") {
          Quagga.stop();
        }
    }, [cameraActive]);



    return (
        <div className="App">
          {loggedIn ?(
            <div>

              <div>
                <button onClick={() => { setSelectedTab('photo'); setCameraActive(true); }}>写真入力</button>
                <button onClick={() => {setSelectedTab('manual'); setCameraActive(false);}}>手動入力</button>
              </div>
              {/* タブの内容 */}
              {selectedTab === 'photo' && (
                <div>
                  <h2>写真入力画面</h2>
                  {barcode !== "" ? `バーコード：${barcode}` : "スキャン中"}
                  <img src={savedImage} alt="Scanned barcode" width="200" height="200"/>

                  {/* 写真入力を押したら、カメラ起動する */}
                  {cameraActive && (<div id="preview"></div>)}
                </div>
              )}
              {selectedTab === 'manual' && (
                <div>
                  <h2>手動入力画面</h2>
                  初期化
                </div>
              )}
              {selectedTab === null && (
                <div>
                  {/* 何も表示しない、または何かメッセージを表示 */}
                </div>
              )}
             
            </div>

          ):(
          <div>
          <h1>ログインしてください</h1>
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>ログイン</button>
            {error && <p>{error}</p>}
        </div>

          )}
          {/* {cameraActive && (<div id="preview"></div>)} */}
          
          
          
        </div>
    )
}

export default App;
