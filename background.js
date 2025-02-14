let now_tabId = '';

chrome.storage.local.get(['tabIds'], (result) => {
  // 取得目前所存在storage的tabIds，並把它紀錄到now_tabId裡
  now_tabId = result.tabIds[0] || '';
})

// 將sendmessage to tab改成Promise確保執行順序
function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// 將sendMessage to runtime改成Promise確保執行順序
function sendMessageToRuntime(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// 取得當前所有的tabId，並回傳
const getAllTabID = () => {
  let tabIds = [];
  return new Promise((resolve, reject) => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError); // 如果有錯誤，回傳 reject
      } else {
        windows.forEach((window) => {
          window.tabs.forEach((tab) => {
            tabIds.push(tab.id);
          })
        })
        resolve(tabIds); // 回傳 ID 列表
      }
    });
  });
}

// (onUpdated)當畫面有更新時就會觸發
chrome.tabs.onUpdated.addListener((tabId, changeinfo, tab) => {
  // 確保是ytmusic這個網站發生更新才做動作
  if (tab.url && tab.url.includes("music.youtube.com")) {

    // 向contentScript發送NEW指令
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    });

    // 當前刷新的tab是我正在監看的tab
    if (tabId === now_tabId) {

      // 向contentScript發送GetSong，取得當前正在播放的歌曲
      chrome.tabs.sendMessage(tabId, {
        type: "GetSong"
      });

      // 送至彈出視窗，要更新歌曲名稱
      chrome.runtime.sendMessage({
        type: "updateSongInfo",
      }, (response) => {
        console.log(`upadate songname in popup: ${response}`);
      });
    }
  }
});

// 接收訊息
chrome.runtime.onMessage.addListener((message, sender, response) => {

  // 從contentScript發送過來，要紀錄新的tabId到storage裡
  if (message.action === "saveTabId") {
    const tabId = sender.tab.id;  // 取得發送訊息過來的分頁，紀錄它的tabId
    chrome.storage.local.get(['tabIds'], (result) => {
      let _tabIds = result.tabIds || [];
      _tabIds = [tabId];
      chrome.storage.local.set({ tabIds: _tabIds }, async () => {
        console.log(`Tab ID ${tabId} has been saved to storage.`);
        // 紀錄目前正在監控的tabId
        now_tabId = _tabIds[0];

        // 取的新的分頁正在播放的歌曲
        const tabResponse = await sendMessageToTab(tabId, { type: "GetSong" });
        console.log(`get songname from content ${tabResponse.songname}`);

        // 更新到彈出視窗上
        const popupResponse = await sendMessageToRuntime({ type: "updateSongInfo" });
        console.log(`upadate songname in popup: ${popupResponse}`);

        response({ success: true }); // 回應 content.js
      });
    });
  }
  // 彈出視窗請求當前所有tabid
  else if (message.action === "getAllTabId") {
    // 確保完成，使用異步
    getAllTabID().then((_tabIds) => {
      response({ tabIds: _tabIds });
    });
  }

  else if(message.action === "pauseSong"){
    console.log('background: send pause')
    chrome.tabs.sendMessage(now_tabId, {
      type: "PAUSE",
    });
    // const tabResponse = await sendMessageToTab(tabId, { type: "PAUSE" });
    // response(tabResponse);
  }
  return true;
});

// 點擊圖示後新增彈出視窗
chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"), // 指定要打開的頁面
    type: "popup", // 設置窗口類型為彈出窗口
    width: 220,    // 設定窗口寬度
    height: 30,    // 設定窗口高度
  }, (newWindow) => {
    console.log("New window created:", newWindow);
  });
});

