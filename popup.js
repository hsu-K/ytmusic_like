document.addEventListener("DOMContentLoaded", () => {
  // 取得目前存的tabId
  chrome.storage.local.get(['tabIds'], (result) => {
    const tabId = result.tabIds[0] || '';  
    // tabIdInfo.textContent = `tabid is ${tabId}`;
    console.log(tabId);

    let now_tabIds = [];
    // 判斷當前tabId是否還存在
    chrome.runtime.sendMessage( {action: "getAllTabId"}, (response) => {
      now_tabIds = response.tabIds;

      console.log("nowtabIds");
      console.log(now_tabIds);
      if(!now_tabIds.includes(tabId)){
        // tabIdInfo.textContent = "no tab select now!!!";
      }
      else{
        const SongNameDisplay = document.getElementById("songname_display");
        chrome.storage.local.get(['SongName'], (result) => {
          const songName = result.SongName || ''; 
          SongNameDisplay.textContent = `${songName}`;
        });
      }
    });
  });

  const textElement = document.getElementById("songname_display");
  const container = textElement.parentElement;

  function startMarquee() {
    const textWidth = textElement.scrollWidth;
    const containerWidth = container.clientWidth;

    console.log(`textWidth: ${textWidth} / containerWidth: ${containerWidth}`)
    if (textWidth > containerWidth) {
      // textElement.style.animation = `marquee-scroll ${textWidth / 50}s linear infinite`;
      textElement.style.animation = `marquee-scroll ${textWidth / 30 }s linear infinite`;
    } else {
      textElement.style.animation = "none";
    }
  }

  const observer = new MutationObserver(startMarquee);
  observer.observe(textElement, { childList: true, subtree: true, characterData: true });
  // 初始化並偵測視窗變化
  startMarquee();
  window.addEventListener("resize", startMarquee)
})


// 接收訊息
chrome.runtime.onMessage.addListener((request, sender, response) => {
  // 取得songname_display這個欄位，並更新其資訊
  const SongNameDisplay = document.getElementById("songname_display");

  if(request.type === "updateSongInfo"){
    chrome.storage.local.get(['SongName'], (result) => {
      const songName = result.SongName || ''; 
      SongNameDisplay.textContent = `${songName}`;
      response(songName);
    });
  }
  return true;
});

document.getElementById("pause-btn").addEventListener("click", () => {
  chrome.runtime.sendMessage( {action: "pauseSong"}, (response) => {
    console.log(response);
  });
});
