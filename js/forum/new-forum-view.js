var Settings = []
chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
    Settings = result.PolyPlus_Settings || []

    if (Settings.ForumMentsOn === true || 1 === 1) {
        HandleForumMentions()
    }
});

function HandleForumMentions() {
    const ForumText = document.querySelectorAll('p:not(.text-muted):not(.mb-0)')
    const IDCache = {}

    for (let text of ForumText) {
        if (/@([\w.]+)/g.test(text.innerText) === true) {
            const FormattedText = text.innerText.replace(/@([\w.]+)/g, '<a href="#" class="polyplus-mention">@$1</a>')
            console.log(FormattedText)

            fetch('https://api.polytoria.com/v1/users/find?username=')
        }
    }
}