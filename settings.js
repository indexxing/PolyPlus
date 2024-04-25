const SaveBtn = document.getElementById('Save')
const Elements = Array.from(document.getElementsByClassName('setting-container'))

var Settings;
var ExpectedSettings;

var Utilities;
(async () => {
  Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
  Utilities = Utilities.default

  ExpectedSettings = Utilities.DefaultSettings

  LoadCurrent()
})();

// Handle buttons at the bottom of the page
document.getElementById('ResetDefaults').addEventListener('click', function() {
  document.getElementById('ResetDefaults-Modal').showModal();
});
SaveBtn.addEventListener("click", function() {
  Save();
});

// Handle modal buttons for Reset Defaults modal
document.getElementById('ResetDefaults-Modal-Yes').addEventListener('click', function() {
  Settings = ExpectedSettings
  Save()
  setTimeout(function () {
    LoadCurrent();
    document.getElementById('ResetDefaults-Modal').close();
  }, 400)
});
document.getElementById('ResetDefaults-Modal-No').addEventListener('click', function() {
  document.getElementById('ResetDefaults-Modal').close();
});

// Handle leaving the settings page before saving
/*
window.onbeforeunload = function() {
  if (SaveBtn.getAttribute('disabled') !== null) {
    return "Are you sure you'd like to leave? Your Poly+ settings haven't been saved."
  }
  return "aaa"
}
*/

// Loop thru each setting container and handle toggling, selecting, opening modal, etc
Elements.forEach(element => {
  let Button = element.getElementsByTagName('button')[0]
  let Options = element.getElementsByTagName('button')[1]
  let Select = element.getElementsByTagName('select') || []

  if (Button) {
    Button.addEventListener('click', function() {
      ToggleSetting(Button.getAttribute('data-setting'), element)
    });
  }

  if (Options) {
    Options.addEventListener('click', function() {
      let Modal = document.getElementById(Options.getAttribute('data-modal') + '-Modal')
      let ModalButtons = Modal.getElementsByTagName('button')
      let ModalInputs = Modal.getElementsByTagName('input')
      let ModalSelect = Modal.getElementsByTagName('select')

      Array.from(ModalButtons).forEach(btn => {
        if (!(btn.getAttribute('data-ignore') === 'true')) {
          btn.addEventListener('click', function(){
            let Setting = btn.getAttribute('data-setting')
            if (Setting === '[save]') {
              Array.from(ModalInputs).forEach(input => {
                if (!(input.getAttribute('data-ignore') === 'true')) {
                  if (!(input.getAttribute('data-parent'))) {
                    Settings[Modal.getAttribute('data-setting')][input.getAttribute('data-setting')] = input.value || null
                  } else {
                    let Parent = input.getAttribute('data-parent')
                    if (!isNaN(parseInt(Parent))) {Parent = parseInt(Parent)}
                    Settings[Modal.getAttribute('data-setting')][Parent][input.getAttribute('data-setting')] = input.value || null
                  }
                }
              });
              Array.from(ModalSelect).forEach(select => {
                if (!(select.getAttribute('data-ignore') === 'true')) {
                  if (!(select.getAttribute('data-parent'))) {
                    Settings[Modal.getAttribute('data-setting')][select.getAttribute('data-setting')] = select.selectedIndex
                  } else {
                    let Parent = input.getAttribute('data-parent')
                    if (!isNaN(parseInt(Parent))) {Parent = parseInt(Parent)}
                    Settings[Modal.getAttribute('data-setting')][Parent][select.getAttribute('data-setting')] = select.selectedIndex
                  }
                }
              });
              Save();
              setTimeout(function () {
                LoadCurrent();
                Modal.close();
              }, 400)
            } else if (Setting === '[reset-default]') {
              if (confirm("Are you sure you'd like to reset these options to their defaults?") === true) {
                Settings[Modal.getAttribute('data-setting')] = ExpectedSettings[Modal.getAttribute('data-setting')]
                Save()
                Modal.close();
              }
            } else if (Setting === '[cancel]') {
              Modal.close();
            } else {
              if (!(btn.getAttribute('data-parent'))) {
                ToggleSetting(Modal.getAttribute('data-setting')[btn.getAttribute('data-setting')], null)
              } else {
                let Parent = input.getAttribute('data-parent')
                if (!isNaN(parseInt(Parent))) {Parent = parseInt(Parent)}
                ToggleSetting(Modal.getAttribute('data-setting')[Parent][btn.getAttribute('data-setting')], null)
              }
            }
          });
        }
      });

      Array.from(ModalInputs).forEach(input => {
        if (!(input.getAttribute('data-ignore') === 'true')) {
          if (!(input.getAttribute('data-parent'))) {
            if (Settings[Modal.getAttribute('data-setting')][input.getAttribute('data-setting')] !== "undefined" && Settings[Modal.getAttribute('data-setting')][input.getAttribute('data-setting')] !== undefined) {
              input.value = Settings[Modal.getAttribute('data-setting')][input.getAttribute('data-setting')]
            } else {
              input.value = ''
            }
          } else {
            let Parent = input.getAttribute('data-parent')
            if (Settings[Modal.getAttribute('data-setting')][Parent][input.getAttribute('data-setting')] !== "undefined" && Settings[Modal.getAttribute('data-setting')][Parent][input.getAttribute('data-setting')] !== undefined) {
              if (!isNaN(parseInt(Parent))) {Parent = parseInt(Parent)}
              input.value = Settings[Modal.getAttribute('data-setting')][Parent][input.getAttribute('data-setting')]
            } else {
              input.value = ''
            }
          }
        }
      });

      Array.from(ModalSelect).forEach(select => {
        if (!(select.getAttribute('data-ignore') === 'true')) {
          if (!(select.getAttribute('data-parent'))) {
            if (Settings[Modal.getAttribute('data-setting')][select.getAttribute('data-setting')] !== "undefined") {
              select.selectedIndex = Settings[Modal.getAttribute('data-setting')][select.getAttribute('data-setting')]
            }
          } else {
            let Parent = input.getAttribute('data-parent')
            if (Settings[Modal.getAttribute('data-setting')][Parent][select.getAttribute('data-setting')] !== "undefined") {
              if (!isNaN(parseInt(Parent))) {Parent = parseInt(Parent)}
              select.selectedIndex = Settings[Modal.getAttribute('data-setting')][Parent][select.getAttribute('data-setting')]
            }
          }
        }
      });

      Modal.showModal()
    });
  }

  if (Select.length > 0) {
    Array.from(Select).forEach(element => {
      element.addEventListener('change', function() {
        SetSetting(element.getAttribute('data-setting'), element, element.selectedIndex)
        Save()
      });
    });
  }
});

function LoadCurrent() {
  chrome.storage.sync.get(["PolyPlus_Settings"], function(result) {
    Settings = MergeObjects(result.PolyPlus_Settings || ExpectedSettings, ExpectedSettings)

    console.log("Current: ", Settings)

    Elements.forEach(element => {
      const ToggleBtn = element.getElementsByClassName('toggle-btn')[0]
      if (Settings[ToggleBtn.getAttribute('data-setting')] === true) {
        element.classList.add('enabled')
        ToggleBtn.innerText = 'Disable'
        ToggleBtn.classList.add('btn-danger')
      } else {
        element.classList.add('disabled')
        ToggleBtn.innerText = 'Enable'
        ToggleBtn.classList.add('btn-success')
      }
      let SelectInput = element.getElementsByTagName('select')[0]
      if (SelectInput) {
        SelectInput.selectedIndex = Settings[SelectInput.getAttribute('data-setting')]
      }
    });
  });
}

function ToggleSetting(Name, Element) {
  const ToggleBtn = Element.getElementsByClassName('toggle-btn')[0]
  document.title = "*unsaved | Poly+ Settings"
  if (Settings[Name] === true) {
    Settings[Name] = false;
    ToggleBtn.innerText = 'Enable'
  } else {
    Settings[Name] = true;
    ToggleBtn.innerText = 'Disable'
  }
  Element.classList.toggle('enabled')
  Element.classList.toggle('disabled')
  ToggleBtn.classList.toggle('btn-success')
  ToggleBtn.classList.toggle('btn-danger')

  if (SaveBtn.getAttribute('disabled')) {
    SaveBtn.removeAttribute('disabled')
  }
}

function SetSetting(Name, Element, Value) {
  console.log(Settings)
  Settings[Name] = Value

  if (SaveBtn.getAttribute('disabled')) {
    SaveBtn.removeAttribute('disabled')
  }
}

function Save() {
  document.title = 'Poly+ Settings'
  SaveBtn.setAttribute('disabled', 'true')
  chrome.storage.sync.set({ 'PolyPlus_Settings': Settings, arrayOrder: true }, function() {
    console.log('Saved successfully!');
  });

  console.log("Save:", Settings);
}

let LoadThemeFromJSONBtn = document.getElementById('LoadThemeFromJSONBtn')
let SaveThemeToJSONInput = document.getElementById('SaveThemeToJSONInput')
let CopyThemeJSONBtn = document.getElementById('CopyThemeJSONBtn')
LoadThemeFromJSONBtn.addEventListener('click', function(){
  LoadThemeJSON(LoadThemeFromJSONBtn.previousElementSibling.value)
});
document.getElementById('theme-creator').getElementsByTagName('button')[1].addEventListener('click', function(){
  SaveThemeToJSONInput.value = JSON.stringify(Settings.ThemeCreator)
});
CopyThemeJSONBtn.addEventListener('click', function(){
  if (SaveThemeToJSONInput.value.length > 0) {
    navigator.clipboard.writeText(SaveThemeToJSONInput.value)
      .then(() => {
        alert('Successfully copied theme data to clipboard!')
      })
      .catch(() => {
        alert('Failure to copy theme data to clipboard.')
      });
  }
});

function LoadThemeJSON(string) {
  try {
    let JSONTable = JSON.parse(string)
    if (JSONTable.length === ExpectedSettings.ThemeCreator.length) {
      if (confirm('Are you sure you\'d like to replace this theme with the theme specified in the JSON?') === true) {
        LoadThemeFromJSONBtn.previousElementSibling.value = ''
        document.getElementById('ThemeCreator-Modal').close()
        for (let i = 0; i < JSONTable.length; i++) {
          if (JSONTable[i][0] !== "#") {
            JSONTable[i] = ""
          }
        }
        Settings.ThemeCreator = MergeObjects(JSONTable, ExpectedSettings.ThemeCreator)
        Save();
        console.log(JSONTable.length, JSONTable, 'applied')
        document.getElementById('ThemeCreator').getElementsByTagName('button')[1].click();
      }
    } else {
      alert('JSON is not a theme!')
    }
  } catch (error) {
    alert('JSON is invalid!')
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

function FormatBool(bool){
  if (bool === true) { return 'enabled' }
  else { return 'disabled' }
}

const Manifest = chrome.runtime.getManifest()
let BuildType = "Stable"
if (Manifest.version_name !== undefined) {BuildType = "Pre-Release"}

const FooterText = document.getElementById('footer-text')
FooterText.children[0].innerHTML = `Version: v${Manifest.version} | Build Type: ${BuildType}`

const CheckForUpdatesButton = document.getElementById('check-for-updates')
function CheckForUpdates() {
  CheckForUpdatesButton.removeEventListener('click', CheckForUpdates)
  CheckForUpdatesButton.disabled = true
  fetch('https://polyplus.vercel.app/data/version.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network not ok')
      }
      return response.json()
    })
    .then(data => {
      if (data.version === Manifest.version || Math.floor((data.version - Manifest.version) * 10) === 0) {
        CheckForUpdatesButton.innerHTML = '<b>No updates available</b>'
        alert('No updates available')
      } else {
        const NumberOfUpdatesAvailable = Math.floor((data.version - Version) * 10)
        CheckForUpdatesButton.innerHTML = '<b>'+NumberOfUpdatesAvailable+' update(s) available</b>'
        alert(NumberOfUpdatesAvailable + ' updates available')
      }
    })
    .catch(error => {console.log(error)});
}
CheckForUpdatesButton.addEventListener('click', CheckForUpdates)

fetch(chrome.runtime.getURL('resources/currencies.json'))
  .then(response => {
    if (!response.ok) {
      throw new Error('Network not ok')
    }
    return response.json()
  })
  .then(data => {
    const DateText = new Date(data.Date).toLocaleDateString("en-US", {day:"numeric",month:"long",year:"numeric"})
    document.getElementById('IRLPriceWithCurrency-Date').innerText = DateText
  })
  .catch(error => {console.log(error)})

chrome.storage.local.get(['PolyPlus_OutOfDate', 'PolyPlus_LiveVersion', 'PolyPlus_ReleaseNotes', 'PolyPlus_SkipUpdate'], function(result) {
  const OutOfDate = result.PolyPlus_OutOfDate || false
  const SkipUpdate = result.PolyPlus_SkipUpdate || null
  const LiveVersion = result.PolyPlus_LiveVersion || Manifest.version
  if (OutOfDate === true && SkipUpdate !== LiveVersion) {
    const Banner = document.createElement('div')
    Banner.classList = 'alert position-sticky p-3'
    Banner.style = 'top: 30px; box-shadow: 0 0 20px 2px #000; z-index: 2000; background: rgb(163 39 39);'
    Banner.innerHTML = `
    <b>New Update Available!</b>
    <br>
    Your Poly+ installation is out of date! If you would like to get the latest and greatest features, improvements, and bug fixes click on one of the links below to dismiss this banner!
    <br>
    <div role="group" class="btn-group w-100 mt-2">
      <a href="${result.PolyPlus_ReleaseNotes}" class="btn btn-primary btn-sm w-25" target="_blank">Go to Release Notes</a>
      <button id="skip-this-update" class="btn btn-warning btn-sm w-25">(Not Recommended) Skip this Update</button>
    </div>
    `
    document.getElementById('page').insertBefore(Banner, document.getElementById('page').children[1])

    const SkipButton = document.getElementById('skip-this-update')
    SkipButton.addEventListener('click', function(){
      Banner.remove()
      chrome.storage.local.set({'PolyPlus_SkipUpdate': result.PolyPlus_LiveVersion}, function(){
        console.log('set skip update to live version: ', result.PolyPlus_LiveVersion)
      })
    });
  }
})