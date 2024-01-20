chrome.contextMenus.create({
    title: 'Copy Asset ID',
    id: 'PolyPlus-CopyID',
    contexts: ['link'],
    documentUrlPatterns: ['https://polytoria.com/*'],
    targetUrlPatterns: [
        "https://polytoria.com/places/**",
        "https://polytoria.com/users/**",
        "https://polytoria.com/store/**"
    ]
});

chrome.contextMenus.create({
    title: 'Copy Avatar Hash',
    id: 'PolyPlus-CopyAvatarHash',
    contexts: ['image'],
    documentUrlPatterns: ['https://polytoria.com/*'],
    targetUrlPatterns: [
        "https://c0.ptacdn.com/thumbnails/avatars/**",
        "https://c0.ptacdn.com/thumbnails/avatars/**"
    ]
});

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
});

/*
chrome.webNavigation.onCompleted.addListener(function (details){
    console.log('TAB CREATED')

    chrome.scripting
        .executeScript({
            target: {tabId: details.tabId},
            func: HandleJoinPlace,
            args: [details.url]
        })
}, {
    url: [{ urlMatches: "https://polytoria.com/join-place/*" }]
});
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

function HandleJoinPlace(url) {
    console.log('HANDLING JOINING PLACE')
    const PlaceID = new URL(url).pathname.split('/')[2]
    fetch('https://polytoria.com/api/places/join',{
        method: 'POST',
        body: {
            placeID:PlaceID
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.json()
        })
        .then(data => {
            if (data.success !== true) {throw new Error(data.message)}
            window.location.href = 'polytoria://client/' + data.token
        })
        .catch(error => {console.log(error)})
}