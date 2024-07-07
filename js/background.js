const Manifest = chrome.runtime.getManifest();
const SettingsURL = chrome.runtime.getURL('settings.html');

const DefaultSettings = {
	PinnedGamesOn: true,
	ForumMentsOn: true,
	BestFriendsOn: false,
	ImprovedFrListsOn: false,
	IRLPriceWithCurrency: {
		Enabled: true,
		Currency: 0,
		Package: 0
	},
	IRLPriceWithCurrencyOn: true,
	IRLPriceWithCurrencyCurrency: 0,
	IRLPriceWithCurrencyPackage: 0,
	HideNotifBadgesOn: false,
	StoreOwnTagOn: true,
	ThemeCreatorOn: false,
	ThemeCreator: {
		Enabled: false,
		BGColor: null,
		BGImage: null,
		BGImageSize: 'fit',
		PrimaryTextColor: null,
		SecondaryTextColor: null,
		LinkTextColor: null,
		WebsiteLogo: null
	},
	ModifyNavOn: false,
	ModifyNav: [
		{
			Label: 'Places',
			Link: 'https://polytoria.com/places'
		},
		{
			Label: 'Store',
			Link: 'https://polytoria.com/store'
		},
		{
			Label: 'Guilds',
			Link: 'https://polytoria.com/guilds'
		},
		{
			Label: 'People',
			Link: 'https://polytoria.com/users'
		},
		{
			Label: 'Forum',
			Link: 'https://polytoria.com/forum'
		}
	],
	MoreSearchFiltersOn: true,
	ApplyMembershipTheme: {
		Enabled: false,
		Theme: 0
	},
	ApplyMembershipThemeOn: false,
	ApplyMembershipThemeTheme: 0,
	MultiCancelOutTradesOn: true,
	ItemWishlistOn: true,
	HideUpgradeBtnOn: false,
	TryOnItemsOn: true,
	OutfitCostOn: true,
	ShowPlaceRevenueOn: true,
	ReplaceItemSalesOn: false,
	HoardersListOn: true,
	HoardersList: {
		Enabled: true,
		AvatarsEnabled: false,
		MinCopies: 2
	},
	LibraryDownloadsOn: true,
	EventItemsCatOn: true,
	HomeFriendCountOn: true,
	HideUserAds: {
		Enabled: false,
		Banners: true,
		Rectangles: true
	},
	UploadMultipleDecals: true,
	GD_ServerBalanceOn: true,
	AvatarDimensionToggleOn: true,
	TheGreatDivide: {
		Enabled: true,
		UnbalancedIndicatorOn: true,
		MVPUserIndicatorOn: true,
		UserStatsOn: true,
		LeaderboardsOn: true
	},
	CollectibleInventoryCatOn: true,
	ShowValueListDataOn: true,
	ImprovedAchievements: {
		Enabled: true,
		ProgressBarOn: true,
		PercentageOn: true,
		OpacityOn: true
	}
}

// ON EXTENSION INSTALL / RELOAD
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
		const MergedSettings = MergeObjects((result.PolyPlus_Settings || DefaultSettings), DefaultSettings)
		chrome.storage.sync.set({'PolyPlus_Settings': MergedSettings}, function(){
			console.log('Successfully merged settings')
		})
	})
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === 'reload') {
		chrome.runtime.reload();
	} else if (request.action === 'greatdivide_stats') {
		chrome.storage.local.get(['PolyPlus_GreatDivideStats_' + request.userID], async function(result){
			let Statistics = result['PolyPlus_GreatDivideStats_' + request.userID]

			// cache for 5 minutes
			if (Statistics !== undefined && (new Date().getTime() - Statistics.requested < 300000)) {
				Statistics = Statistics.data
			} else {
				Statistics = (await (await fetch('https://stats.silly.mom/player_stats?id=' + request.userID)).json()).results
				if (Statistics !== null) { Statistics = Statistics[0] }
				chrome.storage.local.set({['PolyPlus_GreatDivideStats_' + request.userID]: {data: Statistics, requested: new Date().getTime()}}, function(){})
			}

			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
				chrome.scripting
					.executeScript({
						target: {tabId: tabs[0].id},
						func: LoadStats,
						args: [Statistics]
					})
			})
		})

		const LoadStats = function(stats){	
			const GreatDivideCard = document.getElementById('p+greatdivide_card')
			if (stats !== null) {
				let KDR = (stats.Kills / stats.Deaths)
				if (isNaN(KDR)) {
					KDR = "N/A"
				} else {
					KDR = KDR.toFixed(4)
				}

				GreatDivideCard.innerHTML = `
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-eye text-center d-inline-block" style="width:1.2em"></i>
						Last Round Seen
					</b>
					<span class="float-end">
						${ (stats.LastRoundSeen === 0) ? '-' : stats.LastRoundSeen }
					</span>
				</div>
				<hr class="mb-3 mt-2">
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-swords text-center d-inline-block" style="width:1.2em"></i>
						Kills
					</b>
					<span class="float-end">
						${stats.Kills.toLocaleString()} <small class="text-muted" style="font-size: 0.8rem;">(${stats.UniqueKills.toLocaleString()} unique)</small>
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-skull text-center d-inline-block" style="width:1.2em"></i>
						Deaths
					</b>
					<span class="float-end">
						${stats.Deaths.toLocaleString()}
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-solid fa-percent text-center d-inline-block" style="width:1.2em"></i>
						Kill Death Ratio
					</b>
					<span class="float-end ${ (!isNaN(KDR) && KDR > 1) ? 'text-success' : (!isNaN(KDR) && KDR !== 0) ? 'text-danger' : '' }">
						${KDR} <i class="fa-solid fa-circle-info" data-bs-toggle="tooltip" data-bs-title="KDR is a user's kills divided by the amount of times they have died. If their KDR is above 1, they are making a positive contribution. If their KDR is less than 1, that means they die more than they kill."></i>
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-hundred-points text-center d-inline-block" style="width:1.2em"></i>
						Points Scored
					</b>
					<span class="float-end">
						${stats.PointsScored.toLocaleString()}
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-solid fa-money-bill-wave text-center d-inline-block" style="width:1.2em"></i>
						Cash Earned
					</b>
					<span class="float-end">
						${stats.CashEarned.toLocaleString()}
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-flag text-center d-inline-block" style="width:1.2em"></i>
						Flags Captured
					</b>
					<span class="float-end">
						${stats.FlagsCaptured} (${stats.FlagsReturned} returned)
					</span>
				</div>
				<div>
					<b>
						<i class="fa-solid fa-box-open text-center d-inline-block" style="width:1.2em"></i>
						Airdrops Collected
					</b>
					<span class="float-end">
						${stats.AirdropsCollected}
					</span>
				</div>
				<hr class="mb-3 mt-2">
				<div class="mb-1">
					<b>
						<i class="fa-solid fa-chart-pyramid text-center d-inline-block" style="width:1.2em"></i>
						Monoliths Destroyed
					</b>
					<span class="float-end">
						${stats.ObelisksDestroyed}
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-block-question text-center d-inline-block" style="width:1.2em"></i>
						Blocks Placed
					</b>
					<span class="float-end">
						${stats.BlocksPlaced} (${stats.BlocksDestroyed} destroyed)
					</span>
				</div>
				<div class="mb-1">
					<b>
						<i class="fa-duotone fa-head-side-brain text-center d-inline-block" style="width:1.2em"></i>
						Headshots
					</b>
					<span class="float-end">
						${stats.Headshots}
					</span>
				</div>
				`

				const Script = document.createElement('script');
				Script.setAttribute('type', 'text/javascript');
				Script.setAttribute('src', chrome.runtime.getURL('resources/registerTooltips.js'));
				Script.addEventListener('load', function () {
					Script.remove();
				});
				document.body.appendChild(Script);
			} else {
				GreatDivideCard.classList.add('text-center', 'py-5')
				GreatDivideCard.innerHTML = `
				<h1 class="display-3"><i class="fa-solid fa-face-thinking"></i></h1>
				<h5> Not Drafted </h5>
				<p class="mb-0">This user hasn't participated in The Great Divide.</p>
				`
			}
		}
		return true
	}
});

// WHEN CLICKING ON EXTENSION ICON OPEN THE SETTINGS PAGE
chrome.action.onClicked.addListener((tab) => {
	chrome.tabs.create({active: true, url: SettingsURL});
});

// REGISTER AN ALARM FOR DAILY UPDATE CHECK
chrome.alarms.create('PolyPlus-UpdateCheck', {
	when: Date.now() + GetNext12PM()
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
/*
chrome.alarms.onAlarm.addListener(function (alarm) {
	if (alarm.name === 'PolyPlus-UpdateCheck') {
		RunUpdateNotifier();
	}
});
*/
function RunUpdateNotifier() {
	chrome.storage.local.get(['PolyPlus_LiveVersion', 'PolyPlus_OutOfDate', 'PolyPlus_SkipUpdate'], function (result) {
		const OutOfDate = result.PolyPlus_OutOfDate || false;
		const SkipUpdate = result.PolyPlus_SkipUpdate || null;
		const LiveVersion = result.PolyPlus_LiveVersion || Manifest.version;
		if (OutOfDate !== true && SkipUpdate !== LiveVersion) {
			fetch('https://polyplus.vercel.app/data/version.json')
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network not ok');
					}
					return response.json();
				})
				.then((data) => {
					chrome.storage.local.set({PolyPlus_LiveVersion: data.version}, function () {
						console.log('Cached live version');
					});
					if (data.version > Manifest.version) {
						chrome.storage.local.set({PolyPlus_OutOfDate: true, PolyPlus_ReleaseNotes: data.releaseNotes}, function () {
							console.log('Cached update notifier result');
						});
						chrome.notifications.create(
							'',
							{
								type: 'basic',
								iconUrl: chrome.runtime.getURL('icon.png'),
								title: 'New Update Available',
								message: 'A new update is available for Poly+! (v' + data.version + ')'
							},
							function (notificationID) {
								chrome.notifications.onClicked.addListener(function (id) {
									if (id === notificationID) {
										chrome.tabs.create({url: 'https://github.com/IndexingGitHub/PolyPlus/releases', active: true});
										chrome.notifications.clear(notificationID);
									}
								});
							}
						);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	});
}

chrome.contextMenus.removeAll(function () {
	chrome.contextMenus.create({
		title: 'Run Update Notifier',
		id: 'PolyPlus-RunUpdateNotifier',
		contexts: ['all'],
		documentUrlPatterns: [
			'https://polytoria.com/my/settings/polyplus*'
		]
	});

	// COPY ASSET ID CONTEXT MENU ITEM REGISTRATION
	/*
	const AssetTypes = ["Place", "User", "Item", "Guild"]
	AssetTypes.forEach(type => {
		chrome.contextMenus.create({
			title: 'Copy ' + type + ' ID',
			id: 'PolyPlus-Copy' + type + 'ID',
			contexts: ['link'],
			documentUrlPatterns: ['https://polytoria.com/*', SettingsURL],
			targetUrlPatterns: [
				'https://polytoria.com/places/**'
			]
		});
	})
	*/
	chrome.contextMenus.create({
		title: 'Copy Place ID',
		id: 'PolyPlus-CopyPlaceID',
		contexts: ['link'],
		documentUrlPatterns: ['https://polytoria.com/*', SettingsURL],
		targetUrlPatterns: [
			'https://polytoria.com/places/**'
		]
	});
	chrome.contextMenus.create({
		title: 'Copy User ID',
		id: 'PolyPlus-CopyUserID',
		contexts: ['link'],
		documentUrlPatterns: ['https://polytoria.com/*', SettingsURL],
		targetUrlPatterns: [
			'https://polytoria.com/users/**',
			'https://polytoria.com/u/**'
		]
	});
	chrome.contextMenus.create({
		title: 'Copy Item ID',
		id: 'PolyPlus-CopyItemID',
		contexts: ['link'],
		documentUrlPatterns: ['https://polytoria.com/*', SettingsURL],
		targetUrlPatterns: [
			'https://polytoria.com/store/**'
		]
	});
	chrome.contextMenus.create({
		title: 'Copy Guild ID',
		id: 'PolyPlus-CopyGuildID',
		contexts: ['link'],
		documentUrlPatterns: ['https://polytoria.com/*', SettingsURL],
		targetUrlPatterns: [
			'https://polytoria.com/guilds/**'
		]
	});

	// COPY AVATAR HASH CONTEXT MENU ITEM REGISTRATION
	chrome.contextMenus.create({
		title: 'Copy Avatar Hash',
		id: 'PolyPlus-CopyAvatarHash',
		contexts: ['image'],
		documentUrlPatterns: ['https://polytoria.com/*', SettingsURL],
		targetUrlPatterns: [
			'https://c0.ptacdn.com/thumbnails/avatars/**'
		]
	});
});

// HANDLE CONTEXT MENU ITEMS
chrome.contextMenus.onClicked.addListener(async function (info, tab) {
	if (["CopyPlaceID", "CopyUserID", "CopyItemID", "CopyGuildID"].indexOf(info.menuItemId.split('-')[1]) !== -1) {
		console.log(info.linkUrl.split('/')[3]);
		let ID = info.linkUrl.split('/')[4];
		if (info.linkUrl.split('/')[3] === 'u') {
			ID = (await (await fetch('https://api.polytoria.com/v1/users/find?username=' + info.linkUrl.split('/')[4])).json()).id;
		}
		console.log(ID);
		chrome.scripting
			.executeScript({
				target: {tabId: tab.id},
				func: CopyAssetID,
				args: [ID]
			})
			.then(() => console.log('Copied ID!'));
	}

	if (info.menuItemId === 'PolyPlus-CopyAvatarHash') {
		let Hash = new URL(info.srcUrl).pathname.split('/')[3].replace('-icon', '').replace('.png', '');
		chrome.scripting
			.executeScript({
				target: {tabId: tab.id},
				func: CopyAvatarHash,
				args: [Hash]
			})
			.then(() => console.log('Copied ID!'));
	}

	if (info.menuItemId === 'PolyPlus-RunUpdateNotifier') {
		RunUpdateNotifier();
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
	const matches = Manifest.content_scripts.map(script => {
        script.matches.forEach(match => {
			console.log(url, match, url.startsWith(match))
            if (url.startsWith(match)) {
                return true
            } else {
				return false
			}
        })
    })

	return matches
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
		.catch((err) => {
			alert('Failure to copy ID.', err);
		});
}

function CopyAvatarHash(hash) {
	navigator.clipboard
		.writeText(hash)
		.then(() => {
			alert('Successfully copied avatar hash!');
		})
		.catch(() => {
			alert('Failure to copy avatar hash.');
		});
}

function OpenSweetAlert2Modal(icon, title, text) {
	console.log(window, window.Swal, window.bootstrap)
	window.Swal.fire({
		icon: icon,
		title: title,
		text: text
	})
}

// MergeObjects function was written by ChatGPT cause I was lazy and it was awhile ago
function MergeObjects(obj1, obj2) {
	var mergedObj = {};

	// Copy the values from obj1 to the mergedObj
	for (var key in obj1) {
		mergedObj[key] = obj1[key];
	}

	// Merge the values from obj2 into the mergedObj, favoring obj2 for non-existing keys in obj1
	for (var key in obj2) {
		if (!obj1.hasOwnProperty(key)) {
			mergedObj[key] = obj2[key];
		}
	}

	return mergedObj;
}