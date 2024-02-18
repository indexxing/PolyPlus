const SaveBtn = document.getElementById('Save')
const Elements = Array.from(document.getElementsByClassName('setting-container'))

var Settings;
/*
var ExpectedSettings = {
  PinnedGamesOn: true,
  ForumMentsOn: false,
  BestFriendsOn: true,
  ImprovedFrListsOn: true,
  IRLPriceWithCurrencyOn: true,
  IRLPriceWithCurrencyCurrency: 0,
  IRLPriceWithCurrencyPackage: 0,
  HideNotifBadgesOn: false,
  StoreOwnTagOn: true,
  ThemeCreatorOn: false,
  ThemeCreator: {
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
      Label: "Places",
      Link: "https://polytoria.com/places"
    },
    {
      Label: "Store",
      Link: "https://polytoria.com/store"
    },
    {
      Label: "Guilds",
      Link: "https://polytoria.com/guilds"
    },
    {
      Label: "People",
      Link: "https://polytoria.com/users"
    },
    {
      Label: "Forum",
      Link: "https://polytoria.com/forum"
    }
  ],
  MoreSearchFiltersOn: true,
  ApplyMembershipThemeOn: false,
  ApplyMembershipThemeTheme: 0,
  MultiCancelOutTradesOn: true,
  ItemWishlistOn: true,
  HideUpgradeBtnOn: false
}
*/
var ExpectedSettings;
var Utilities;
(async () => {
  Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
  Utilities = Utilities.default

  ExpectedSettings = Utilities.DefaultSettings

  LoadCurrent()
})();

const ResetDefaultsModal = document.getElementById('ResetDefaults-Modal')
var ThemeCreatorModal = {
  Modal: document.getElementById('ThemeCreator-Modal'),
  Save: document.getElementById('ThemeCreator-Modal-Save'),
  BGColor: document.getElementById('ThemeCreator-Modal-BGColor'),
  BGImage: document.getElementById('ThemeCreator-Modal-BGImage'),
  BGImageSize: document.getElementById('ThemeCreator-Modal-BGImageSize'),
  PrimaryTextColor: document.getElementById('ThemeCreator-Modal-PrimaryTextColor'),
  SecondaryTextColor: document.getElementById('ThemeCreator-Modal-SecondaryTextColor'),
  LinkTextColor: document.getElementById('ThemeCreator-Modal-LinkTextColor'),
  WebsiteLogo: document.getElementById('ThemeCreator-Modal-WebsiteLogo')
}
var ModifyNavModal = {
  Modal: document.getElementById('ModifyNav-Modal'),
  Save: document.getElementById('ModifyNav-Modal-Save'),
  "1Label": document.getElementById('ModifyNav-Modal-1Label'),
  "1Link": document.getElementById('ModifyNav-Modal-1Link'),
  "2Label": document.getElementById('ModifyNav-Modal-2Label'),
  "2Link": document.getElementById('ModifyNav-Modal-2Link'),
  "3Label": document.getElementById('ModifyNav-Modal-3Label'),
  "3Link": document.getElementById('ModifyNav-Modal-3Link'),
  "4Label": document.getElementById('ModifyNav-Modal-4Label'),
  "4Link": document.getElementById('ModifyNav-Modal-4Link'),
  "5Label": document.getElementById('ModifyNav-Modal-5Label'),
  "5Link": document.getElementById('ModifyNav-Modal-5Link'),
}
SaveBtn.addEventListener("click", function() {
  Save();
});
Elements.forEach(element => {
  let Button = element.getElementsByTagName('button')[0]
  let Options = element.getElementsByTagName('button')[1]
  let Select = element.getElementsByTagName('select') || []
  console.log(element, Select)

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
      });
    });
  }
});
document.getElementById('ResetDefaults').addEventListener('click', function() {
  ResetDefaultsModal.showModal();
});
document.getElementById('ResetDefaults-Modal-Yes').addEventListener('click', function() {
  Settings = ExpectedSettings
  Save()
  setTimeout(function () {
    LoadCurrent();
    ResetDefaultsModal.close();
  }, 400)
});
document.getElementById('ResetDefaults-Modal-No').addEventListener('click', function() {
  ResetDefaultsModal.close();
});

function LoadCurrent() {
  chrome.storage.sync.get(["PolyPlus_Settings"], function(result) {
    Settings = MergeObjects(result.PolyPlus_Settings || ExpectedSettings, ExpectedSettings)

    console.log(Settings)

    Elements.forEach(element => {
      let Status = element.getElementsByClassName('status')[0]
      if (Status !== undefined) {
        Status.innerText = FormatBool(Settings[element.getElementsByTagName('button')[0].getAttribute('data-setting')])
      }
      let SelectInput = element.getElementsByTagName('select')[0]
      if (SelectInput) {
        SelectInput.selectedIndex = Settings[SelectInput.getAttribute('data-setting')]
      }
    });
  });
}

function ToggleSetting(Name, Element) {
  if (Settings[Name] === true) {
    Settings[Name] = false;
  } else {
    Settings[Name] = true;
  }

  if (Element != null) {
    Element.getElementsByClassName('status')[0].innerText = FormatBool(Settings[Name])
  }
  if (SaveBtn.getAttribute('disabled')) {
    console.log('is disabled button - toggle')
    SaveBtn.removeAttribute('disabled')
  }
}

function SetSetting(Name, Element, Value) {
  console.log(Settings)
  Settings[Name] = Value

  if (SaveBtn.getAttribute('disabled')) {
    console.log('is disabled button')
    SaveBtn.removeAttribute('disabled')
  }
}

function Save() {
  SaveBtn.setAttribute('disabled', 'true')
  chrome.storage.sync.set({ 'PolyPlus_Settings': Settings, arrayOrder: true }, function() {
    console.log('Saved successfully!');
  });

  console.log(Settings);
}

let LoadThemeFromJSONBtn = document.getElementById('LoadThemeFromJSONBtn')
let SaveThemeToJSONInput = document.getElementById('SaveThemeToJSONInput')
let CopyThemeJSONBtn = document.getElementById('CopyThemeJSONBtn')
LoadThemeFromJSONBtn.addEventListener('click', function(){
  LoadThemeJSON(LoadThemeFromJSONBtn.previousElementSibling.value)
});
document.getElementById('ThemeCreator').getElementsByTagName('button')[1].addEventListener('click', function(){
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

let CurrencyDate = 
LoadFile(chrome.runtime.getURL('js/resources/currencies.json'), function(text){
  CurrencyDate = new Date(JSON.parse(text).Date).toLocaleDateString("en-US", {day:"numeric",month:"long",year:"numeric"})

  document.getElementById('IRLPriceWithCurrencyCurrency').previousElementSibling.children[1].innerText = document.getElementById('IRLPriceWithCurrencyCurrency').previousElementSibling.children[1].innerText.replace('[DATE]', CurrencyDate)
})

function LoadThemeJSON(string) {
  alert('This feature has been disabled for now.')
  return
  try {
    let JSONTable = JSON.parse(string)
    if (JSONTable.length === ExpectedSettings.ThemeCreator.length) {
      if (confirm('Are you sure you\'d like to replace this theme with the theme specified in the JSON?') === true) {
        LoadThemeFromJSONBtn.previousElementSibling.value = ''
        document.getElementById('ThemeCreator-Modal').close()
        /*
        for (let i = 0; i < JSONTable.length; i++) {
          JSONTable[i] = new Sanitzer(JSONTable[i])
        }
        */
        Settings.ThemeCreator = MergeObjects(JSONTable, ExpectedSettings.ThemeCreator)
        Save();
        console.log(JSONTable.length, JSONTable, 'applied')
        document.getElementById('ThemeCreator').getElementsByTagName('button')[1].click();
      }
    } else {
      alert('JSON is not a theme!')
      //LoadThemeFromJSONBtn.innerText = 'JSON is too short or too long!'
      //setTimeout(function () {LoadThemeFromJSONBtn.innerText = 'Load'}, 1250)
    }
  } catch (error) {
    alert('JSON is invalid!')
    //LoadThemeFromJSONBtn.innerText = 'JSON is invalid!'
    //setTimeout(function () {LoadThemeFromJSONBtn.innerText = 'Load'}, 1250)
  }
}

/*
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
    } else if (obj1[key] !== obj2[key]) {
      mergedObj[key] = obj2[key];
    }
  }

  // Remove keys from mergedObj if they are not present in obj2
  for (var key in mergedObj) {
    if (!obj2.hasOwnProperty(key)) {
      delete mergedObj[key];
    }
  }

  return mergedObj;
}
*/

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
  if (bool === true) {
    return 'enabled'
  } else {
    return 'disabled'
  }
}

function LoadFile(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () { return callback(this.responseText); }
  xhr.open("GET", path, true);
  xhr.send();
}