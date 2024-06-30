const SaveBtn = document.getElementById('Save');
const Elements = Array.from(document.getElementsByClassName('setting-container'));

var RecentSave;
var Settings;

var Utilities;
(async () => {
	Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
	Utilities = Utilities.default;
	LoadCurrent();

	document.getElementById('PinnedGames-limit').innerText = Utilities.Limits.PinnedGames;
	//document.getElementById('ImprovedFrLists-limit').innerText = Utilities.Limits.ImprovedFrLists;
	//document.getElementById('ItemWishlist-limit').innerText = Utilities.Limits.ItemWishlist;
	document.getElementById('HoardersList-pageLimit').innerText = Utilities.Limits.HoardersListPages;
})();

// Handle buttons at the bottom of the page
document.getElementById('ResetDefaults').addEventListener('click', function () {
	document.getElementById('ResetDefaults-Modal').showModal();
});
SaveBtn.addEventListener('click', Save);

// Handle modal buttons for Reset Defaults modal
document.getElementById('ResetDefaults-Modal-Yes').addEventListener('click', function () {
	Settings = Utilities.DefaultSettings;
	Save();
	setTimeout(function () {
		LoadCurrent();
		document.getElementById('ResetDefaults-Modal').close();
	}, 400);
});
document.getElementById('ResetDefaults-Modal-No').addEventListener('click', function () {
	document.getElementById('ResetDefaults-Modal').close();
});

// Loop thru each setting container and handle toggling, selecting, opening modal, etc
Elements.forEach((element) => {
	let Button = element.getElementsByClassName('toggle-btn')[0];
	let Options = element.getElementsByClassName('options-btn')[0];
	let Select = element.getElementsByTagName('select')[0];
	let Checkbox = element.getElementsByTagName('input');

	if (Button) {
		Button.addEventListener('click', function () {
			SetSetting(Button, 'bool');
		});
	}

	if (Select) {
		Select.addEventListener('change', function () {
			if (Select.getAttribute('data-useValue') !== null) {
				let Value = Select.options[Select.selectedIndex].value;
				if (!isNaN(Value)) {
					Value = parseInt(Value);
				}
				SetSetting(Select, Value, false);
			} else {
				SetSetting(Select, Select.selectedIndex, false);
			}
		});
	}

	if (Checkbox) {
		Array.from(Checkbox).forEach(check => {
			check.addEventListener('change', function () {
				SetSetting(check, check.checked, false);
			});
		})
	}

	if (Options) {
		const Modal = document.getElementById(Options.getAttribute('data-modal') + '-Modal');
		const ModalButtons = Modal.getElementsByTagName('button');
		const ModalInputs = Modal.getElementsByTagName('input');
		const ModalSelect = Modal.getElementsByTagName('select');

		Options.addEventListener('click', function () {
			Array.from(ModalButtons)
				.filter((x) => !x.classList.contains('ignore'))
				.forEach((button) => {
					button.addEventListener('click', function () {
						const Setting = button.getAttribute('data-setting');

						if (Setting === '[save]') {
							// Save Modal Button

							// Save Modal Inputs
							Array.from(ModalInputs)
								.filter((x) => !x.classList.contains('ignore'))
								.forEach((input) => {
									SetSetting(input, input.value, false, Modal.getAttribute('data-setting'));
								});

							// Save Modal Select Menus
							Array.from(ModalSelect)
								.filter((x) => !x.classList.contains('ignore'))
								.forEach((select) => {
									SetSetting(select, select.selectedIndex, false, Modal.getAttribute('data-setting'));
								});

							Save();
							setTimeout(function () {
								LoadCurrent();
								Modal.close();
							}, 400);
						} else if (Setting === '[reset-default]') {
							// Reset to Defaults Modal Button

							if (confirm("Are you sure you'd like to reset these options to their defaults?") === true) {
								Settings[Modal.getAttribute('data-setting')] = Utilities.DefaultSettings[Modal.getAttribute('data-setting')];
								Save();
								Modal.close();
							}
						} else if (Setting === '[cancel]') {
							// Cancel Changes Button

							Modal.close();
						} else {
							// Default Toggle Button

							SetSetting(button, 'bool', false, Modal.getAttribute('data-setting'));
						}
					});
				});

			Array.from(ModalInputs)
				.filter((x) => !x.classList.contains('ignore'))
				.forEach((input) => {
					const Status = GetSettingValue(input, Modal.getAttribute('data-setting'));
					if (Status !== 'undefined' && Status !== undefined) {
						input.value = Status;
					} else {
						input.value = '';
					}
				});

			Array.from(ModalSelect)
				.filter((x) => !x.classList.contains('ignore'))
				.forEach((select) => {
					const Status = GetSettingValue(select, Modal.getAttribute('data-setting'));
					if (Status !== 'undefined' && Status !== undefined) {
						select.selectedIndex = Status;
					}
				});

			Modal.showModal();
		});
	}
});

function LoadCurrent() {
	chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
		Settings = Utilities.MergeObjects(result.PolyPlus_Settings || Utilities.DefaultSettings, Utilities.DefaultSettings);
		RecentSave = structuredClone(Settings)

		console.log('Current Settings: ', Settings);

		Elements.forEach((element) => {
			UpdateElementState(element);
		});
	});
}

function SetSetting(element, value, update, modalParent) {
	document.title = '*unsaved | Poly+ Settings'
	const name = element.getAttribute('data-setting');
	let parent = element.getAttribute('data-parent');

	if (modalParent !== undefined) {
		console.log(modalParent);
		parent = modalParent;
	}

	if (value === 'bool') {
		value = !GetSettingValue(element, modalParent);
	}
	if (parent !== null) {
		let Parent = Object.values(Settings)[Object.keys(Settings).indexOf(parent)];
		if (!isNaN(element.getAttribute('data-parent')) && element.getAttribute('data-parent') !== null) {
			Parent = Parent[parseInt(element.getAttribute('data-parent'))];
		}
		Parent[name] = value;
	} else {
		Settings[name] = value;
	}
	if (update !== false) {
		UpdateElementState(document.querySelector(`.setting-container:has([data-setting="${name}"])${parent !== null ? `:has([data-parent="${parent}"])` : ''}`), value);
	}
	if (SaveBtn.getAttribute('disabled')) {
		SaveBtn.removeAttribute('disabled');

		// Handle leaving the settings page before saving
		window.onbeforeunload = function (e) {
			return "Are you sure you'd like to leave? Your Poly+ settings haven't been saved."
		};
	}
	/*
	if (AreIdentical(Settings, RecentSave) === true) {
		document.title = 'Poly+ Settings'
		SaveBtn.disabled = true
	}
	*/
}

function GetSettingValue(element, modalParent) {
	const name = element.getAttribute('data-setting');
	let parent = element.getAttribute('data-parent');

	if (modalParent !== undefined) {
		parent = modalParent;
	}

	let Status = name;
	if (parent !== null) {
		let Parent = Object.values(Settings)[Object.keys(Settings).indexOf(parent)];
		if (!isNaN(element.getAttribute('data-parent')) && element.getAttribute('data-parent') !== null) {
			Parent = Parent[parseInt(element.getAttribute('data-parent'))];
			Status = Parent[name];
		} else {
			Status = Object.values(Parent)[Object.keys(Parent).indexOf(name)];
		}
	} else {
		Status = Settings[Status];
	}

	if (element.tagName === 'SELECT' && element.getAttribute('data-useValue') === 'true') {
		Status = Array.from(element.children).indexOf(element.querySelector('option[value="' + Status + '"]'))
	}

	return Status;
}

function UpdateElementState(element, status) {
	const Button = element.getElementsByClassName('toggle-btn')[0];

	if (status === undefined) {
		status = GetSettingValue(Button);
	}

	if (status === true) {
		element.classList.add('enabled');
		element.classList.remove('disabled');
		Button.innerText = 'Disable';
		Button.classList.add('btn-danger');
		Button.classList.remove('btn-success');
	} else {
		element.classList.add('disabled');
		element.classList.remove('enabled');
		Button.innerText = 'Enable';
		Button.classList.add('btn-success');
		Button.classList.remove('btn-danger');
	}

	let SelectInput = element.getElementsByTagName('select')[0];
	if (SelectInput) {
		SelectInput.selectedIndex = GetSettingValue(SelectInput);
	}

	let Checkbox = Array.from(element.getElementsByTagName('input'));
	if (Checkbox.length > 0) {
		Checkbox.forEach((check) => {
			check.checked = GetSettingValue(check);
		});
	}
}

function Save() {
	document.title = 'Poly+ Settings';
	SaveBtn.setAttribute('disabled', 'true');
	chrome.storage.sync.set({PolyPlus_Settings: Settings}, function () {
		console.log('Saved successfully!');
		RecentSave = Settings
	});

	// Handle leaving the settings page after saving
	window.onbeforeunload = null

	console.log('Save:', Settings);
}

let LoadThemeFromJSONBtn = document.getElementById('LoadThemeFromJSONBtn');
let SaveThemeToJSONInput = document.getElementById('SaveThemeToJSONInput');
let CopyThemeJSONBtn = document.getElementById('CopyThemeJSONBtn');
LoadThemeFromJSONBtn.addEventListener('click', function () {
	LoadThemeJSON(LoadThemeFromJSONBtn.previousElementSibling.value);
});
document
	.getElementById('theme-creator')
	.getElementsByTagName('button')[1]
	.addEventListener('click', function () {
		SaveThemeToJSONInput.value = JSON.stringify(Settings.ThemeCreator);
	});
CopyThemeJSONBtn.addEventListener('click', function () {
	if (SaveThemeToJSONInput.value.length > 0) {
		navigator.clipboard
			.writeText(SaveThemeToJSONInput.value)
			.then(() => {
				alert('Successfully copied theme data to clipboard!');
			})
			.catch(() => {
				alert('Failure to copy theme data to clipboard.');
			});
	}
});

function LoadThemeJSON(string) {
	try {
		let JSONTable = JSON.parse(string);
		if (JSONTable.length === Utilities.DefaultSettings.ThemeCreator.length) {
			if (confirm("Are you sure you'd like to replace this theme with the theme specified in the JSON?") === true) {
				LoadThemeFromJSONBtn.previousElementSibling.value = '';
				document.getElementById('ThemeCreator-Modal').close();
				for (let i = 0; i < JSONTable.length; i++) {
					if (JSONTable[i][0] !== '#') {
						JSONTable[i] = '';
					}
				}
				Settings.ThemeCreator = Utilities.MergeObjects(JSONTable, Utilities.DefaultSettings.ThemeCreator);
				Save();
				console.log(JSONTable.length, JSONTable, 'applied');
				document.getElementById('ThemeCreator').getElementsByTagName('button')[1].click();
			}
		} else {
			alert('JSON is not a theme!');
		}
	} catch (error) {
		alert('JSON is invalid!');
	}
}

chrome.storage.sync.get(['PolyPlus_AutoAds'], function(result){
	let AutoAds = result.PolyPlus_AutoAds || [];

	const Modal = document.getElementById("AutoAdBidding-Modal")
	const AddButton = document.getElementById('auto-ad-bidding-add')

	AddButton.addEventListener('click', async function() {
		const Page = new DOMParser().parseFromString((await (await fetch('https://polytoria.com/create/ad/' + AddButton.previousElementSibling.value)).text()), 'text/html')


	})

	const AddRow = function(index, info) {
		const Row = document.createElement('tr')
		Row.innerHTML = `
		<th scope="row">${index+1}</th>
		<td><a href="https://polytoria.com/create/ad/${info.id}">"${info.name}"</a></td>
		<td class="text-success"><span class="pi">$</span> 150</td>
		<td>
			<select class="form-select ignore">
				<option value="daily" selected>Daily</option>
				<option value="weekly">Weekly</option>
				<option value="monthly">Monthly</option>
			</select>
		</td>
		<td>
			<div role="group" class="btn-group w-100">
				<button class="btn btn-success w-25">
					BID
				</button>
				<button class="btn btn-orange w-25">
					EDIT
				</button>
				<button class="btn btn-danger w-25">
					DELETE
				</button>
			</div>
		</td>
		`
	}
})

function AreIdentical(obj1, obj2) {
	if (obj1.length !== obj2.length) { return false }
	return JSON.stringify(obj1) === JSON.stringify(obj2)
}

function FormatBool(bool) {
	if (bool === true) {
		return 'enabled';
	} else {
		return 'disabled';
	}
}

const Manifest = chrome.runtime.getManifest();
let BuildType = 'Stable';
if (Manifest.version_name !== undefined) {
	BuildType = 'Pre-Release';
}

const FooterText = document.getElementById('footer-text');
FooterText.children[0].innerHTML = `Version: v${Manifest.version} | Build Type: ${BuildType}`;

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
			if (data.version === Manifest.version || Math.floor((data.version - Manifest.version) * 10) === 0) {
				CheckForUpdatesButton.innerHTML = '<b>No updates available</b>';
				alert('No updates available');
			} else {
				const NumberOfUpdatesAvailable = Math.floor((data.version - Version) * 10);
				CheckForUpdatesButton.innerHTML = '<b>' + NumberOfUpdatesAvailable + ' update(s) available</b>';
				alert(NumberOfUpdatesAvailable + ' updates available');
			}
		})
		.catch((error) => {
			console.log(error);
		});
}
CheckForUpdatesButton.addEventListener('click', CheckForUpdates);

/*
fetch(chrome.runtime.getURL('resources/currencies.json'))
	.then((response) => {
		if (!response.ok) {
			throw new Error('Network not ok');
		}
		return response.json();
	})
	.then((data) => {
		const DateText = new Date(data.Date).toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'});
		document.getElementById('IRLPriceWithCurrency-Date').innerText = DateText;
	})
	.catch((error) => {
		console.log(error);
	});
*/

chrome.storage.local.get(['PolyPlus_OutOfDate', 'PolyPlus_LiveVersion', 'PolyPlus_ReleaseNotes', 'PolyPlus_SkipUpdate'], function (result) {
	const OutOfDate = result.PolyPlus_OutOfDate || false;
	const SkipUpdate = result.PolyPlus_SkipUpdate || null;
	const LiveVersion = result.PolyPlus_LiveVersion || Manifest.version;
	if (OutOfDate === true && SkipUpdate !== LiveVersion) {
		const Banner = document.createElement('div');
		Banner.classList = 'alert position-sticky p-3';
		Banner.style = 'top: 30px; box-shadow: 0 0 20px 2px #000; z-index: 2000; background: rgb(163 39 39);';
		Banner.innerHTML = `
    <b>New Update Available!</b>
    <br>
    Your Poly+ installation is out of date! If you would like to get the latest and greatest features, improvements, and bug fixes click on one of the links below to dismiss this banner!
    <br>
    <div role="group" class="btn-group w-100 mt-2">
      <a href="${result.PolyPlus_ReleaseNotes}" class="btn btn-primary btn-sm w-25" target="_blank">Go to Release Notes</a>
      <button id="skip-this-update" class="btn btn-warning btn-sm w-25">(Not Recommended) Skip this Update</button>
    </div>
    `;
		document.getElementById('page').insertBefore(Banner, document.getElementById('page').children[1]);

		const SkipButton = document.getElementById('skip-this-update');
		SkipButton.addEventListener('click', function () {
			Banner.remove();
			chrome.storage.local.set({PolyPlus_SkipUpdate: result.PolyPlus_LiveVersion}, function () {
				console.log('set skip update to live version: ', result.PolyPlus_LiveVersion);
			});
		});
	}
});