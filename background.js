let now_tabId = '';

chrome.storage.local.get(['tabIds'], (result) =>{
  now_tabId = result.tabIds[0] || '';
  console.log(`original tabid: ${now_tabId}`)
}) 

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

chrome.tabs.onUpdated.addListener((tabId, changeinfo, tab) => {
  if(tab.url && tab.url.includes("music.youtube.com")){
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    });

    // 當前刷新的tab是我正在監看的tab
    if(tabId === now_tabId){
      chrome.tabs.sendMessage(tabId, {
        type: "GetSong"
      });
      
      // 送至彈出視窗
      chrome.runtime.sendMessage({
        type: "updateSongInfo",
      }, (response) =>{
        console.log(`upadate songname in popup: ${response}`);
      });
      // console.log("update Song Info");
      // console.log("need to update song info");
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.action === "saveTabId") {
    // console.log("Save TabId");
    const tabId = sender.tab.id;
    chrome.storage.local.get(['tabIds'], (result) => {
      let _tabIds = result.tabIds || [];
      _tabIds = [tabId];
      // console.log(_tabIds); 
      chrome.storage.local.set({ tabIds: _tabIds}, async() => {
        console.log(`Tab ID ${tabId} has been saved to storage.`);
        // 紀錄目前正在監控的tabId
        now_tabId = _tabIds[0];

        const tabResponse = await sendMessageToTab(tabId, { type: "GetSong" });
        console.log(`get songname from content ${tabResponse.songname}`);

        const popupResponse = await sendMessageToRuntime({ type: "updateSongInfo" });
        console.log(`upadate songname in popup: ${popupResponse}`);

        // chrome.tabs.sendMessage(tabId, {
        //   type: "GetSong"
        // }, (response) => {
        //   console.log(`get songname from content ${response.songname}`);
        // });
        
        // // 送至彈出視窗
        // chrome.runtime.sendMessage({
        //   type: "updateSongInfo",
        // }, (response) =>{
        //   console.log(`upadate songname in popup: ${response}`);
        // });

        response({ success: true }); // 回應 content.js
      });
    });
  }

  // 彈出視窗請求當前所有tabid
  if(message.action === "getAllTabId"){
    // 確保完成，使用異步
    getAllTabID().then((_tabIds) => {
      response({ tabIds: _tabIds });
    });
  }
  return true;
});

// 點擊圖示後新增彈出視窗
chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"), // 指定要打開的頁面
    type: "popup", // 設置窗口類型為彈出窗口
    width: 200,    // 設定窗口寬度
    height: 100,    // 設定窗口高度
  }, (newWindow) => {
    console.log("New window created:", newWindow);
  });
});

