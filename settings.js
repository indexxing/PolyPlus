const SaveBtn = document.getElementById('Save');
const Elements = Array.from(document.getElementsByClassName('setting-container'));

var Settings;

var Utilities;
(async () => {
	Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
	Utilities = Utilities.default;
	LoadCurrent();

	document.getElementById('PinnedGames-limit').innerText = Utilities.Limits.PinnedGames;
	document.getElementById('BestFriends-limit').innerText = Utilities.Limits.BestFriends;
	document.getElementById('ImprovedFrLists-limit').innerText = Utilities.Limits.ImprovedFrLists;
	document.getElementById('ItemWishlist-limit').innerText = Utilities.Limits.ItemWishlist;
})();

// Handle buttons at the bottom of the page
document.getElementById('ResetDefaults').addEventListener('click', function () {
	document.getElementById('ResetDefaults-Modal').showModal();
});
SaveBtn.addEventListener('click', function () {
	Save();
});

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

// Handle leaving the settings page before saving
window.onbeforeunload = function () {
	if (SaveBtn.getAttribute('disabled') !== undefined) {
		return "Are you sure you'd like to leave? Your Poly+ settings haven't been saved.";
	}
};

// Loop thru each setting container and handle toggling, selecting, opening modal, etc
Elements.forEach((element) => {
	console.log('Handle Element', element);
	let Button = element.getElementsByTagName('button')[0];
	let Options = element.getElementsByTagName('button')[1];
	let Select = element.getElementsByTagName('select')[0];
	let Checkbox = element.getElementsByTagName('input')[0];

	if (Button) {
		Button.addEventListener('click', function () {
			SetSetting(Button, 'bool');
		});
	}

	if (Select) {
		Select.addEventListener('change', function () {
			if (Select.getAttribute('data-useValue') !== undefined) {
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
		Checkbox.addEventListener('change', function () {
			SetSetting(Checkbox, Checkbox.checked, false);
		});
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

							Array.from(ModalInputs)
								.filter((x) => !x.classList.contains('ignore'))
								.forEach((input) => {
									SetSetting(input, input.value, false, Modal.getAttribute('data-setting'));
								});
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
		Settings = MergeObjects(result.PolyPlus_Settings || Utilities.DefaultSettings, Utilities.DefaultSettings);

		console.log('Current Settings: ', Settings);

		Elements.forEach((element) => {
			console.log('For Each Update');
			UpdateElementState(element);
		});
	});
}

function SetSetting(element, value, update, modalParent) {
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
			console.log('is numbere!!!!');
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
	}

	const getInObject = function (a, b) {
		return Object.values(a)[Object.keys(a).indexOf(b)];
	};
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

		/*
    if (!isNaN(element.getAttribute('data-parent'))) {
      Parent = Parent[parseInt(element.getAttribute('data-parent'))]
    }
    Status = Object.values(Parent)[Object.keys(Parent).indexOf(Status)]
    */
	} else {
		Status = Settings[Status];
	}
	console.log('Get Value Result', Status);

	return Status;
}

function UpdateElementState(element, status) {
	console.log('Update Element State', element, status);

	const Button = element.getElementsByClassName('toggle-btn')[0];

	if (status === undefined) {
		console.log('Update Element State, no status provided');
		status = GetSettingValue(Button);
	}

	if (status === true) {
		console.log('Is Enabled so Set False');
		element.classList.add('enabled');
		element.classList.remove('disabled');
		Button.innerText = 'Disable';
		Button.classList.add('btn-danger');
		Button.classList.remove('btn-success');
	} else {
		console.log('Is Disabled so Set True');
		element.classList.add('disabled');
		element.classList.remove('enabled');
		Button.innerText = 'Enable';
		Button.classList.add('btn-success');
		Button.classList.remove('btn-danger');
	}

	let SelectInput = element.getElementsByTagName('select')[0];
	if (SelectInput) {
		console.log('Select Found');
		SelectInput.selectedIndex = GetSettingValue(SelectInput);
	}

	let Checkbox = Array.from(element.getElementsByTagName('input'));
	if (Checkbox.length > 0) {
		console.log('Checkbox/Input(s) Found', Checkbox);
		Checkbox.forEach((check) => {
			console.log('check', GetSettingValue(check));
			check.checked = GetSettingValue(check);
		});
	}
}

function Save() {
	document.title = 'Poly+ Settings';
	SaveBtn.setAttribute('disabled', 'true');
	chrome.storage.sync.set({PolyPlus_Settings: Settings, arrayOrder: true}, function () {
		console.log('Saved successfully!');
	});

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
				Settings.ThemeCreator = MergeObjects(JSONTable, Utilities.DefaultSettings.ThemeCreator);
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
