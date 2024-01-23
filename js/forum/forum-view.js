const ForumText = document.querySelectorAll('p:not(.text-muted):not(.mb-0)')

var Settings = []
chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
    Settings = result.PolyPlus_Settings || []

    if (Settings.ForumMentsOn === true || 1 === 2) {
        HandleForumMentions()
    }

    if (1 === 1) {
        HandleUnixTimestamps()
    }
});

function HandleForumMentions() {
    const Regex = /@([\w.]+)/g

    for (let text of ForumText) {
        let FormattedText = text.innerHTML
        let match;
        while ((match = Regex.exec(text.innerText)) !== null) {
            const Username = match[0].substring(1)
            FormattedText = FormattedText.replaceAll(match[0], `<a href="/profile/reufihfuighqre8uogqre?ref=${encodeURIComponent(window.location.pathname)}" class="polyplus-mention">${match[0]}</a>`)
        }
        text.innerHTML = FormattedText
    }
}

function HandleUnixTimestamps() {
    const Regex = /<t:[A-Za-z0-9]+>/gm
    //const Regex = /&lt;t:[A-Za-z0-9]+&gt;/i

    for (let text of ForumText) {
        //let FormattedText = text.innerHTML
        let match;
        while ((match = Regex.exec(text.innerText)) !== null) {
            console.log(match[0])
            const Timestamp = new Date(parseInt(match[0].substring(3).slice(0, -1))*1000)
            const Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

            const Result = `${Months[Timestamp.getMonth()]} ${Timestamp.getDate()}, ${Timestamp.getFullYear()}`
            text.innerHTML = text.innerText.replaceAll(Regex.exec(text.innerText)[0], Result)
        }
        //text.innerHTML = FormattedText
    }
}