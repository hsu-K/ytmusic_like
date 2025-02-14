(() => {
  let youtubeLeftControls;
  let ytPlayer;

  const getYoutubePlayer = () => {
    ytPlayer = document.querySelector('ytmusic-player-bar');
    console.log(`ytmusic: ${ytPlayer}`);
  }

  const toggleYTpause = () => {
    const pause_btn = ytPlayer.querySelector('.play-pause-button');
    if(pause_btn){
      pause_btn.click();
    }
    else{
      console.log('pause button not found QQ...');
    }
  }

  // 添加新的tabId到紀錄裡
  const addSongPlayerHandler = () => {
    // 向background發送saveTabId的訊號
    chrome.runtime.sendMessage({ action: "saveTabId" }, (response) => {
      if (response && response.success) {
        console.log("save tabId success");
      }
    });

  }

  // 取得當前正在播放的歌曲名稱
  const getCurrnetSong = () => {
    const titleElement = document.querySelector('yt-formatted-string.title.style-scope.ytmusic-player-bar');
    if (titleElement) {
      const title = titleElement.getAttribute('title'); // 或者直接 titleElement.title
      return title;
    }
    else {
      return null;
    }
  }

  // 當有心的歌曲載入時，因為播放器會刷新，因此要再為它加入保存tabId的按鈕
  const newSongLoaded = () => {
    // 因為這個function會被重複呼叫，因此若這個按鈕已經存在，就不用再加入了
    const songmarkBtnExists = document.getElementsByClassName("songmark-btn")[0];
    if (!songmarkBtnExists) {
      getYoutubePlayer();
      // 創建這個按鈕的各項元素
      const songmarkBtn = document.createElement("img");
      songmarkBtn.src = chrome.runtime.getURL("assets/songmark.png");
      songmarkBtn.className = "ytp-button " + "songmark-btn";
      songmarkBtn.title = "Click to add Song player";
      songmarkBtn.style.height = "50px";
      songmarkBtn.style.width = "50px";

      // 把按鈕添加到畫面上，並為其綁定功能
      youtubeLeftControls = document.getElementsByClassName("left-controls-buttons")[0];
      youtubeLeftControls.appendChild(songmarkBtn);
      songmarkBtn.addEventListener("click", addSongPlayerHandler);
    }
  }

  // 接收訊息
  chrome.runtime.onMessage.addListener((request, sender, response) => {

    // 若是NEW則表示畫面有更新，要去更新播放器
    if (request.type === "NEW") {
      newSongLoaded();
      response("sucess");
      // response(currentSong);
    }
    else if (request.type === "GetSong") {
      // 取得歌曲名稱並回傳
      const currentSong = getCurrnetSong();
      chrome.storage.local.set({ SongName: currentSong }, () => {
        console.log(`now Song is ${currentSong}`);
      });
      response({ songname: currentSong });
    }
    else if(request.type === "PAUSE"){
      console.log('contentScript receive: PAUSE')
      toggleYTpause();
      // response('暫停歌曲');
    }
    return true;
  });
})();