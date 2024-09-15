/*
    Developer & Debug Page
    Accessable at /my/settings/polyplus#dev and /my/settings/polyplus#debug
*/

document.title = 'Poly+ Debug - Polytoria';
const Version = chrome.runtime.getManifest().version;

if (window.location.pathname.split('/')[3] === 'polyplus' && window.location.hash === '#dev') {
	document.addEventListener('DOMContentLoaded', function () {
		document.querySelector('#main-content .container').innerHTML = `
        <style>
            #main-content .container label {
                font-size: 0.8rem;
                color: darkgray;
            }

            #main-content .container label + p {
                margin-bottom: 4px;
                font-size: 0.9rem;
                margin-top: -4px;
            }
        </style>
        <div class="text-center mb-3">
            <h1 class="text-center" style="font-size: 4.6rem;">Poly+ Developer</h1>
            <p class="w-75 d-block mx-auto">This page is used by developers for debugging most data related things. It is unrecommended you modify any data on this page, but if you ever want to go ahead.</p>
        </div>
        <div class="row">
            <div class="col-md-2" style="padding-left: 0px;">
                <div class="card">
                    <div class="card-body">
                        <p class="text-muted mb-1">Version: v${Version}</p>
                        <p class="text-muted mb-3">Data Size: <span id="data-size">Loading</span> byte(s)</p>
                        <button class="btn btn-primary btn-sm w-100" id="check-for-updates">Check for Updates</button>
                        <a href="https://github.com/indexxing/PolyPlus" class="btn btn-dark btn-sm w-100 mt-2" target="_blank">Open GitHub</a>
                    </div>
                </div>
                <hr>
                Created by <a href="/u/Index" target="_blank">Index</a>
                <br><br>
                Beta Testers:
                <ul>
                    <li><a href="/u/datastore" target="_blank">datastore</a></li>
                    <li><a href="/u/Emir" target="_blank">Emir</a></li>
                    <li><a href="/u/InsertSoda" target="_blank">InsertSoda</a></li>
                    <li><a href="/u/qwp" target="_blank">qwp</a></li>
                </ul>
            </div>
            <div class="col">
                <label for="settingName">Edit Setting Value</label>
                <p>Set a value of the extension's local settings data</p>
                <div role="group" class="input-group mb-3">
                    <input type="text" name="settingName" id="edit-setting-name" class="form-control" placeholder="Setting Name..">
                    <input type="text" id="edit-setting-value" class="form-control" placeholder="New Value..">
                    <button class="btn btn-success w-25" id="edit-setting">Submit</button>
                </div>

                <label>Load Example Data</label>
                <p>Quickly clear specific parts of the extension's local data</p>
                <div role="group" class="btn-group w-100 mb-3">
                    <button class="btn btn-secondary" id="example-pinnedgames">Load Example Pinned Games</button>
                    <button class="btn btn-secondary" id="example-bestfriends">Load Example Best Friends</button>
                    <button class="btn btn-secondary" id="example-itemwishlist">Load Example Item Wishlist</button>
                </div>

                <label>Clear Specific Local Data</label>
                <p>Quickly clear specific parts of the extension's local data</p>
                <div role="group" class="btn-group w-100 mb-3">
                    <button class="btn btn-secondary" id="reset-settings">Reset Settings to Defaults</button>
                    <button class="btn btn-secondary" id="clear-pinnedgames">Clear Pinned Games</button>
                    <button class="btn btn-secondary" id="clear-bestfriends">Clear Best Friends</button>
                    <button class="btn btn-secondary" id="clear-itemwishlist">Clear Item Wishlist</button>
                </div>

                <hr>

                <div class="card">
                    <div class="card-header text-primary">Tools</div>
                    <div class="card-body">
                        <label>Generate <code style="color: orange;">JSON</code> for "Event Items" store category</label>
                        <div class="input-group">
							<input type="text" class="form-control bg-dark" placeholder="Event ID..">
							<input type="text" class="form-control bg-dark" placeholder="Item IDs (separated by commas)..">
							<button class="btn btn-primary" id="generate-event-items">Generate</button>
						</div>
                    </div>
                </div>
                
                <hr>

                <div class="card">
                    <div class="card-header" style="color: red;">Danger Zone!</div>
                    <div class="card-body">
                        <label>Clear Specific Data Locations</label>
                        <p>Quickly clear specific locations of the extension's local data</p>
                        <div role="group" class="btn-group w-100 mb-3">
                            <button class="btn btn-primary" id="delete-sync">Delete Sync Storage (primary, storage is backed up to Google account)</button>
                            <button class="btn btn-secondary" id="delete-local">Delete Local Storage (secondary, storage is only on local device)</button>
                        </div>
                
                        <label>Delete All Data</label>
                        <p>This will clear all local data associated with the extension</p>
                        <button class="btn btn-danger w-100 mb-3" id="delete-all-data">Delete All Data</button>
                    </div>
                </div>
            </div>
        </div>
        `;

		const CheckForUpdatesButton = document.getElementById('check-for-updates');
		function CheckForUpdates() {
			CheckForUpdatesButton.removeEventListener('click', CheckForUpdates);
			CheckForUpdatesButton.disabled = true;
			fetch('https://polyplus.vercel.app/data/version.json')
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network not ok');
					}
					return response.json();
				})
				.then((data) => {
					if (data.version === Version || Math.floor((data.version - Version) * 10) === 0) {
						CheckForUpdatesButton.innerText = 'No updates available';
					} else {
						CheckForUpdatesButton.innerText = Math.floor((data.version - Version) * 10) + ' updates available';
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
		CheckForUpdatesButton.addEventListener('click', CheckForUpdates);

		document.getElementById('edit-setting').addEventListener('click', function () {
			const EditSettingName = document.getElementById('edit-setting-name');
			const EditSettingValue = document.getElementById('edit-setting-value');

			chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
				result = result.PolyPlus_Settings;

				let NewValue = EditSettingValue.value;
				switch (NewValue) {
					case 'true':
						NewValue = true;
						break;
					case 'false':
						NewValue = false;
						break;
					case 'null':
						NewValue = null;
						break;
					case 'undefined':
						NewValue = undefined;
						break;
					case parseInt(NewValue):
						NewValue = parseInt(NewValue);
						break;
				}
				result[EditSettingName.value] = NewValue;

				chrome.storage.sync.set({PolyPlus_Settings: result}, function () {
					alert('Successfully set: "' + EditSettingName.value + '" to ' + NewValue);
				});
			});
		});

		document.getElementById('reset-settings').addEventListener('click', async function () {
			let Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
			Utilities = Utilities.default;
			chrome.storage.sync.set({PolyPlus_Settings: Utilities.DefaultSettings}, function () {
				alert('Successfully reset settings to their defaults!');
			});
		});

		document.getElementById('example-pinnedgames').addEventListener('click', function () {
			chrome.storage.sync.set({PolyPlus_PinnedGames: [6012, 3857, 2537]}, function () {
				alert('Successfully loaded example for Pinned Games!');
			});
		});

		document.getElementById('example-bestfriends').addEventListener('click', function () {
			chrome.storage.sync.set({PolyPlus_BestFriends: [1, 2, 3]}, function () {
				alert('Successfully loaded example for Best Friends!');
			});
		});

		document.getElementById('example-itemwishlist').addEventListener('click', function () {
			chrome.storage.sync.set({PolyPlus_ItemWishlist: [31495, 31493, 31492]}, function () {
				alert('Successfully loaded example for Item Wishlist!');
			});
		});

		document.getElementById('clear-pinnedgames').addEventListener('click', function () {
			chrome.storage.sync.set({PolyPlus_PinnedGames: []}, function () {
				alert('Successfully cleared Pinned Games!');
			});
		});

		document.getElementById('clear-bestfriends').addEventListener('click', function () {
			chrome.storage.sync.set({PolyPlus_BestFriends: []}, function () {
				alert('Successfully cleared Best Friends!');
			});
		});

		document.getElementById('clear-itemwishlist').addEventListener('click', function () {
			chrome.storage.sync.set({PolyPlus_ItemWishlist: []}, function () {
				alert('Successfully cleared Item Wishlist!');
			});
		});

		document.getElementById('delete-sync').addEventListener('click', function () {
			if (confirm("Are you sure you'd like to delete all sync data associated with the extension?") === false) {
				return;
			}
			chrome.storage.sync.clear(function () {
				alert('Successfully deleted all sync data associated with the extension!');
			});
		});

		document.getElementById('delete-local').addEventListener('click', function () {
			if (confirm("Are you sure you'd like to delete all local data associated with the extension?") === false) {
				return;
			}
			chrome.storage.local.clear(function () {
				alert('Successfully deleted all local data associated with the extension!');
			});
		});

		document.getElementById('delete-all-data').addEventListener('click', function () {
			if (confirm("Are you sure you'd like to delete all sync and local data associated with the extension?") === false) {
				return;
			}
			chrome.storage.sync.clear(function () {
				alert('Successfully deleted all sync data associated with the extension!');
			});
			chrome.storage.local.clear(function () {
				alert('Successfully deleted all local data associated with the extension!');
			});
		});

		const GenerateEventItems = document.getElementById('generate-event-items')
		GenerateEventItems.addEventListener('click', async function(){
			const EventItemsJSON = []
			const ItemIDs = GenerateEventItems.previousElementSibling.value.split(',')
			for (let id of ItemIDs) {
				const ItemDetails = (await (await fetch('https://api.polytoria.com/v1/store/' + id.trim())).json())
				EventItemsJSON.push({
					id: parseInt(id),
					name: ItemDetails.name,
					event: GenerateEventItems.previousElementSibling.previousElementSibling.value,
					thumbnail: ItemDetails.thumbnail
				})
			}

			console.log(EventItemsJSON)

			navigator.clipboard.writeText(JSON.stringify(EventItemsJSON, null, 2))
				.then(() => {
					alert('Successfully copied generated event items JSON!')
				})
				.catch(() => {
					alert('Failure when trying to copy generated event items JSON.')
				})
		})

		chrome.storage.sync.getBytesInUse(['PolyPlus_Settings', 'PolyPlus_PinnedGames', 'PolyPlus_ItemWishlist', 'PolyPlus_TimePlayed', 'PolyPlus_AvatarSandboxOutfits'], function (sync) {
			chrome.storage.local.getBytesInUse(['PolyPlus_InventoryCache', 'PolyPlus_GreatDivideStats'], function(local){
				document.getElementById('data-size').innerText = (sync + local).toLocaleString();
			})
		});
	});
} else if (window.location.pathname.split('/')[3] === 'polyplus' && window.location.hash === '#debug') {
	document.addEventListener('DOMContentLoaded', function () {
		chrome.storage.sync.get(['PolyPlus_Settings', 'PolyPlus_PinnedGames', 'PolyPlus_BestFriends', 'PolyPlus_ItemWishlist', 'PolyPlus_AvatarSandboxOutfits', 'PolyPlus_TimePlayed'], function(sync) {
			chrome.storage.local.get(['PolyPlus_InventoryCache', 'PolyPlus_GreatDivideStats', 'PolyPlus_FriendCount', 'PolyPlus_AssetDesigners'], function(local){
				document.querySelector('#main-content .container').innerHTML = `
				<style>
					#main-content .container label {
						font-size: 0.8rem;
						color: darkgray;
					}

					#main-content .container label + p {
						margin-bottom: 4px;
						font-size: 0.9rem;
						margin-top: -4px;
					}

					.card:has([data-bs-toggle="collapse"]):not(:has(.card-body.collapse.show)) a:has(.card-header), .card:has([data-bs-toggle="collapse"]):not(:has(.card-body.collapse.show)) .card-header, .card:has([data-bs-toggle="collapse"]):has(.card-body.collapse.collapsing) a:has(.card-header), .card:has([data-bs-toggle="collapse"]):has(.card-body.collapse.collapsing) .card-header {
						border-radius: inherit;
					}
				</style>
				<div class="text-center mb-3">
					<h1 class="text-center" style="font-size: 4.6rem;">Poly+ Debug</h1>
					<p class="w-75 d-block mx-auto mb-0">This page is used for accessing most data-related objects stored by the extension.</p>
					<small style="font-size: 0.75rem;" class="text-muted">* note: cache objects don't get cleared, instead when they are requested, if the data stored is old, new data will replace the old data.</small>
				</div>
				<div class="row">
					<div class="col-md-2" style="padding-left: 0px;">
						<div class="card">
							<div class="card-body">
								<p class="text-muted mb-1">Version: v${Version}</p>
								<p class="text-muted mb-3">Data Size: <span id="data-size">Loading</span> byte(s)</p>
								<button class="btn btn-primary btn-sm w-100" id="check-for-updates">Check for Updates</button>
								<a href="https://github.com/indexxing/PolyPlus" class="btn btn-dark btn-sm w-100 mt-2" target="_blank">Open GitHub</a>
							</div>
						</div>
						<hr>
						Created by <a href="/u/Index" target="_blank">Index</a>
						<br><br>
						Beta Testers:
						<ul>
							<li><a href="/u/datastore" target="_blank">datastore</a></li>
							<li><a href="/u/Emir" target="_blank">Emir</a></li>
							<li><a href="/u/InsertSoda" target="_blank">InsertSoda</a></li>
							<li><a href="/u/qwp" target="_blank">qwp</a></li>
						</ul>
					</div>
					<div class="col">
					<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#settings" role="button" aria-expanded="false" aria-controls="settings">
								<div class="card-header">
									<span class="badge bg-primary" style="margin-right: 5px; vertical-align: text-bottom;">Sync</span>
									Settings
								</div>
							</a>
							<div class="card-body collapse" id="settings">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((sync.PolyPlus_Settings || {}), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#pinned-games" role="button" aria-expanded="false" aria-controls="pinned-games">
								<div class="card-header">
									<span class="badge bg-primary" style="margin-right: 5px; vertical-align: text-bottom;">Sync</span>
									Pinned Games
									<small class="text-muted" style="font-size: 0.7rem;">(${(sync.PolyPlus_PinnedGames || []).length})</small>
								</div>
							</a>
							<div class="card-body collapse" id="pinned-games">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((sync.PolyPlus_PinnedGames || []), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
									<button class="btn btn-warning btn-sm" style="position: absolute; top: 0; right: 0; margin: 10px;" onclick="navigator.clipboard.writeText('${JSON.stringify((sync.PolyPlus_PinnedGames || []))}') .then(() => {alert('copied')}) .catch(() => {});">copy</button>
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#item-wishlist" role="button" aria-expanded="false" aria-controls="item-wishlist">
								<div class="card-header">
									<span class="badge bg-primary" style="margin-right: 5px; vertical-align: text-bottom;">Sync</span>
									Item Wishlist
									<small class="text-muted" style="font-size: 0.7rem;">(${(sync.PolyPlus_ItemWishlist || []).length})</small>
								</div>
							</a>
							<div class="card-body collapse" id="item-wishlist">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((sync.PolyPlus_ItemWishlist || []), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
									<button class="btn btn-warning btn-sm" style="position: absolute; top: 0; right: 0; margin: 10px;" onclick="navigator.clipboard.writeText('${JSON.stringify((sync.PolyPlus_ItemWishlist || []))}') .then(() => {alert('copied')}) .catch(() => {});">copy</button>
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#avatar-sandbox-outfits" role="button" aria-expanded="false" aria-controls="item-wishlist">
								<div class="card-header">
									<span class="badge bg-primary" style="margin-right: 5px; vertical-align: text-bottom;">Sync</span>
									Avatar Sandbox Outfits
									<small class="text-muted" style="font-size: 0.7rem;">(${(sync.PolyPlus_AvatarSandboxOutfits || []).length})</small>
								</div>
							</a>
							<div class="card-body collapse" id="avatar-sandbox-outfits">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((sync.PolyPlus_AvatarSandboxOutfits || []), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
									<button class="btn btn-warning btn-sm" style="position: absolute; top: 0; right: 0; margin: 10px;" onclick="navigator.clipboard.writeText('${JSON.stringify((sync.PolyPlus_AvatarSandboxOutfits || []))}') .then(() => {alert('copied')}) .catch(() => {});">copy</button>
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#time-played" role="button" aria-expanded="false" aria-controls="item-wishlist">
								<div class="card-header">
									<span class="badge bg-primary" style="margin-right: 5px; vertical-align: text-bottom;">Sync</span>
									Time Played
									<small class="text-muted" style="font-size: 0.7rem;">(${(Object.keys(sync.PolyPlus_TimePlayed) || []).length} places tracked)</small>
								</div>
							</a>
							<div class="card-body collapse" id="time-played">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((sync.PolyPlus_TimePlayed || []), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
									<button class="btn btn-warning btn-sm" style="position: absolute; top: 0; right: 0; margin: 10px;" onclick="navigator.clipboard.writeText('${JSON.stringify((sync.PolyPlus_AvatarSandboxOutfits || []))}') .then(() => {alert('copied')}) .catch(() => {});">copy</button>
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#inventory-cache" role="button" aria-expanded="false" aria-controls="inventory-cache">
								<div class="card-header">
									<span class="badge bg-secondary" style="margin-right: 5px; vertical-align: text-bottom;">Local</span>
									Inventory Cache
									<small class="text-muted" style="font-size: 0.7rem;">(cached for 5 minutes, ${local.PolyPlus_InventoryCache.data.length} items cached)</small>
								</div>
							</a>
							<div class="card-body collapse" id="inventory-cache">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((local.PolyPlus_InventoryCache || {data: [], requested: "never"}), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#great-divide-stats" role="button" aria-expanded="false" aria-controls="inventory-cache">
								<div class="card-header">
									<span class="badge bg-secondary" style="margin-right: 5px; vertical-align: text-bottom;">Local</span>
									Great Divide User Statistics
									<small class="text-muted" style="font-size: 0.7rem;">(cached for 5 minutes, ${Object.keys(local.PolyPlus_GreatDivideStats || {}).length} users cached)</small>
								</div>
							</a>
							<div class="card-body collapse" id="great-divide-stats">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((local.PolyPlus_GreatDivideStats || {}), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#friend-count" role="button" aria-expanded="false" aria-controls="inventory-cache">
								<div class="card-header">
									<span class="badge bg-secondary" style="margin-right: 5px; vertical-align: text-bottom;">Local</span>
									Friend Count
									<small class="text-muted" style="font-size: 0.7rem;">(cached for 5 minutes)</small>
								</div>
							</a>
							<div class="card-body collapse" id="friend-count">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((local.PolyPlus_FriendCount || {data: [], requested: "never"}), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
								</div>
							</div>
						</div>
						<div class="card mb-3">
							<a class="text-reset" data-bs-toggle="collapse" href="#asset-designers" role="button" aria-expanded="false" aria-controls="inventory-cache">
								<div class="card-header">
									<span class="badge bg-secondary" style="margin-right: 5px; vertical-align: text-bottom;">Local</span>
									Asset Designers Cache
									<small class="text-muted" style="font-size: 0.7rem;">(cached for 5 minutes)</small>
								</div>
							</a>
							<div class="card-body collapse" id="asset-designers">
								<div style="padding: 10px; background: #171717; font-family: monospace; color: orange; font-size: 0.8rem; border-radius: 10px; position: relative;">
									${JSON.stringify((local.PolyPlus_AssetDesigners || {data: {}, requested: "never"}), null, 2)
										.replaceAll('\n','<br>')
										.replaceAll(' ', '&nbsp;')
										.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}
								</div>
							</div>
						</div>
					</div>
				</div>
				`;

				const CheckForUpdatesButton = document.getElementById('check-for-updates');
				function CheckForUpdates() {
					CheckForUpdatesButton.removeEventListener('click', CheckForUpdates);
					CheckForUpdatesButton.disabled = true;
					fetch('https://polyplus.vercel.app/data/version.json')
						.then((response) => {
							if (!response.ok) {
								throw new Error('Network not ok');
							}
							return response.json();
						})
						.then((data) => {
							if (data.version === Version || Math.floor((data.version - Version) * 10) === 0) {
								CheckForUpdatesButton.innerText = 'No updates available';
							} else {
								CheckForUpdatesButton.innerText = Math.floor((data.version - Version) * 10) + ' updates available';
							}
						})
						.catch((error) => {
							console.log(error);
						});
				}
				CheckForUpdatesButton.addEventListener('click', CheckForUpdates);

				chrome.storage.sync.getBytesInUse(['PolyPlus_Settings', 'PolyPlus_PinnedGames', 'PolyPlus_ItemWishlist', 'PolyPlus_TimePlayed', 'PolyPlus_AvatarSandboxOutfits'], function (sync) {
					chrome.storage.local.getBytesInUse(['PolyPlus_InventoryCache'], function(local){
						document.getElementById('data-size').innerText = (sync + local).toLocaleString();
					})
				});
			})
		})
	});
}