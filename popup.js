document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  // const infoDisplay = document.getElementById("info-display");
  // const tabIdInfo = document.createElement("p");
  
  // 取得目前存的tabId
  chrome.storage.local.get(['tabIds'], (result) => {
    const tabId = result.tabIds[0] || '';  
    // tabIdInfo.textContent = `tabid is ${tabId}`;
    console.log(tabIdInfo);

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
  // infoDisplay.appendChild(tabIdInfo);
  // console.log("open popup");
})


chrome.runtime.onMessage.addListener((request, sender, response) => {
  const SongNameDisplay = document.getElementById("songname_display");
  SongNameDisplay.textContent = "no song now";

  if(request.type === "updateSongInfo"){
    console.log("get requet update song");
    const SongNameDisplay = document.getElementById("songname_display");
    chrome.storage.local.get(['SongName'], (result) => {
      const songName = result.SongName || ''; 
      SongNameDisplay.textContent = `${songName}`;
      response(songName);
    });
  }
  return true;
});