(() => {
    let youtubeLeftControls;


    const addSongPlayerHandler = () => {
        // console.log("add Song Player Handler");
        chrome.runtime.sendMessage({ action: "saveTabId" }, (response) => {
            if(response && response.success){
                console.log("save tabId success");
            }
        });
    }

    const getCurrnetSong = () => {
        const titleElement = document.querySelector('yt-formatted-string.title.style-scope.ytmusic-player-bar');
        if(titleElement){
            // console.log(titleElement);
            const title = titleElement.getAttribute('title'); // 或者直接 titleElement.title
            // console.log(`Title: ${title}`);
            return title;
        }
        else{
            return null;
        }
    }
    // console.log("load...");
    const newSongLoaded = () => {
        // console.log("New Song Loaded");
        const songmarkBtnExists = document.getElementsByClassName("songmark-btn")[0];
        if(!songmarkBtnExists){
            const songmarkBtn = document.createElement("img");
            songmarkBtn.src = chrome.runtime.getURL("assets/songmark.png");
            songmarkBtn.className = "ytp-button " + "songmark-btn";
            songmarkBtn.title = "Click to add Song player";
            songmarkBtn.style.height = "50px";
            songmarkBtn.style.width = "50px";

            youtubeLeftControls = document.getElementsByClassName("left-controls-buttons")[0];
            youtubeLeftControls.appendChild(songmarkBtn);
            songmarkBtn.addEventListener("click", addSongPlayerHandler);
        }
    }

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        if (request.type === "NEW") {
            newSongLoaded();
            response("sucess");
            // response(currentSong);
        }
        else if(request.type === "GetSong") {
            const currentSong = getCurrnetSong();
            // console.log(currentSong);
            chrome.storage.local.set({ SongName: currentSong }, () => {
                console.log(`now Song is ${currentSong}`);
            });
            response({songname: currentSong});
        }
        return true;
    });
})();