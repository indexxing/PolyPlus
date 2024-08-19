const ForumText = document.querySelectorAll('p:not(.text-muted):not(.mb-0)');

var Settings = [];
chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
	Settings = result.PolyPlus_Settings || {
		ForumMentsOn: false,
		ForumUnixStampsOn: false
	};

	if (Settings.ForumMentsOn === true) {
		ForumMentions();
	}

	if (Settings.ForumUnixStampsOn === true) {
		ForumUnixTimestamps();
	}
});

function ForumMentions() {
    const Regex = /@([\w.]+)/g;

    for (let text of ForumText) {
        const TreeWalker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT, null, false);
        let Node;
        
        while ((Node = TreeWalker.nextNode())) {
            let Match;
            let Replacement = Node.nodeValue;
            
            while ((Match = Regex.exec(Node.nodeValue)) !== null) {
                const Username = Match[0].substring(1);
                const Mention = `<a href="/u/${Username}" class="polyplus-mention">${Match[0]}</a>`;
                Replacement = replacedText.replace(Match[0], Mention);
            }
            
            Node.nodeValue = replacedText;
        }
    }
}

function ForumUnixTimestamps() {
	const Regex = /&lt;t:[A-Za-z0-9]+&gt;/i;

	for (let text of ForumText) {
		let FormattedText = text.innerHTML;
		let match;

		while ((match = Regex.exec(FormattedText)) !== null) {
			const Timestamp = new Date(match[0].substring(6, match[0].length - 4) * 1000);
			const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			const Distance = new Intl.RelativeTimeFormat({numeric: 'auto', style: 'short'}).format(Math.floor((Timestamp - new Date()) / (60 * 1000)), 'day');
			const Result = `<code style="color: orange;">${Months[Timestamp.getMonth()]} ${Timestamp.getDate()}, ${Timestamp.getFullYear()} (${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Timestamp.getDay() - 1]}) at ${Timestamp.getHours() - 12}:${String(Timestamp.getMinutes()).padStart(2, '0')} (${Distance})</code>`;
			FormattedText = FormattedText.replaceAll(match[0], Result);
		}
		text.innerHTML = FormattedText;
	}
}
