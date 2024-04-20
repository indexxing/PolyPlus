const Manifest = chrome.runtime.getManifest()
const SettingsURL = chrome.runtime.getURL('settings.html')

// WHEN CLICKING ON EXTENSION ICON OPEN THE SETTINGS PAGE
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ active: true, url: SettingsURL });
});

// REGISTER AN ALARM FOR DAILY UPDATE CHECK
chrome.alarms.create('PolyPlus-UpdateCheck', {
    when: Date.now() + (GetNext12PM())
});

function GetNext12PM() {
    const Now = new Date();
    const Next = new Date();
    Next.setHours(12, 0, 0, 0);
    if (Now.getHours() >= 12) {
      Next.setDate(Next.getDate() + 1);
    }
    return Next - Now;
}

// HANDLE ALARMS FIRING
chrome.alarms.onAlarm.addListener(function(alarm){
    if (alarm.name === 'PolyPlus-UpdateCheck') {
        RunUpdateNotifier()
    }
});
function RunUpdateNotifier() {
    chrome.storage.local.get(["PolyPlus_LiveVersion", "PolyPlus_OutOfDate", "PolyPlus_SkipUpdate"], function(result){
        const OutOfDate = result.PolyPlus_OutOfDate || false
        const SkipUpdate = result.PolyPlus_SkipUpdate || null
        const LiveVersion = result.PolyPlus_LiveVersion || Manifest.version
        if (OutOfDate !== true && SkipUpdate !== LiveVersion) {
            fetch('https://polyplus.vercel.app/data/version.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network not ok')
                    }
                    return response.json()
                })
                .then(data => {
                    chrome.storage.local.set({'PolyPlus_LiveVersion': data.version}, function(){
                        console.log('Cached live version')
                    })
                    if (data.version > Manifest.version) {
                        chrome.storage.local.set({'PolyPlus_OutOfDate': true, 'PolyPlus_ReleaseNotes': data.releaseNotes}, function(){
                            console.log('Cached update notifier result')
                        });
                        chrome.notifications.create("", {
                            type: "basic",
                            iconUrl: chrome.runtime.getURL("icon.png"),
                            title: "New Update Available",
                            message: "A new update is available for Poly+! (v" + data.version + ")"
                        }, function(notificationID) {
                            chrome.notifications.onClicked.addListener(function (id) {
                                if (id === notificationID) {
                                    chrome.tabs.create({url: 'https://github.com/IndexingGitHub/PolyPlus/releases', active: true})
                                    chrome.notifications.clear(notificationID)
                                }
                            })
                        })
                        chrome.action.setBadgeBackgroundColor(
                            {color: 'red'},
                            () => { /* ... */ },
                        );
                    }
                })
                .catch(error => {console.log(error)})
        }
    });
}

chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        title: 'Run Update Notifier',
        id: 'PolyPlus-RunUpdateNotifier',
        contexts: ['all'],
        documentUrlPatterns: [
            "https://polytoria.com/my/settings/polyplus-debug",
        ]
    });
    
    // COPY ASSET ID CONTEXT MENU ITEM REGISTRATION
    chrome.contextMenus.create({
        title: 'Copy Asset ID',
        id: 'PolyPlus-CopyID',
        contexts: ['link'],
        documentUrlPatterns: [
            "https://polytoria.com/*",
            SettingsURL
        ],
        targetUrlPatterns: [
            "https://polytoria.com/places/**",
            "https://polytoria.com/users/**",
            "https://polytoria.com/store/**"
        ]
    });
    
    // COPY AVATAR HASH CONTEXT MENU ITEM REGISTRATION
    chrome.contextMenus.create({
        title: 'Copy Avatar Hash',
        id: 'PolyPlus-CopyAvatarHash',
        contexts: ['image'],
        documentUrlPatterns: [
            "https://polytoria.com/*",
            SettingsURL
        ],
        targetUrlPatterns: [
            "https://c0.ptacdn.com/thumbnails/avatars/**",
            "https://c0.ptacdn.com/thumbnails/avatars/**"
        ]
    });
})

// HANDLE CONTEXT MENU ITEMS
chrome.contextMenus.onClicked.addListener(function (info, tab){
    if (info.menuItemId === 'PolyPlus-CopyID') {
        let ID = parseInt(info.linkUrl.split('/')[4])
        chrome.scripting
            .executeScript({
                target: {tabId: tab.id},
                func: CopyAssetID,
                args: [ID]
            })
            .then(() => console.log("Copied ID!"));
    }

    if (info.menuItemId === 'PolyPlus-CopyAvatarHash') {
        let Hash = new URL(info.srcUrl).pathname.split('/')[3].replace('-icon', '').replace('.png', '')
        chrome.scripting
            .executeScript({
                target: {tabId: tab.id},
                func: CopyAvatarHash,
                args: [Hash]
            })
            .then(() => console.log("Copied ID!"));
    }

    if (info.menuItemId === 'PolyPlus-RunUpdateNotifier') {
        RunUpdateNotifier()
    }
});

/*
GREEN LOGO WHEN EXTENSION APPLIES TO CURRENT TAB PAGE, RED WHEN IT DOESN'T
COMING SOON

chrome.tabs.onActivated.addListener(function (info){
    chrome.tabs.get(info.tabId, function(tab){
        const Any = CheckIfScriptApplies(tab.url)
        console.log(Any)
    });
});

function CheckIfScriptApplies(url) {
    return Manifest.content_scripts.forEach(script => {
        COMMENT
        if (matchesUrl(script.matches, url)) {
            return true
        }

        script.matches.forEach(match => {
            if (url.startsWith(match.replaceAll('*', ''))) {
                return true
            }
        })
    })
}

function matchesUrl(patterns, url) {
    return patterns.some(pattern => {
        return new RegExp(pattern).test(url);
    });
}
*/

function CopyAssetID(id) {
    navigator.clipboard
        .writeText(id)
        .then(() => {
            alert('Successfully copied ID!')
        })
        .catch(() => {
            alert('Failure to copy ID.')
        });
}

function CopyAvatarHash(hash) {
    navigator.clipboard
        .writeText(hash)
        .then(() => {
            alert('Successfully copied avatar hash!')
        })
        .catch(() => {
            alert('Failure to copy avatar hash.')
        });
}