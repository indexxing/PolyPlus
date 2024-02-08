var Settings;
const ExpectedSettings = {
  PinnedGamesOn: false,
  ForumMentsOn: false,
  BestFriendsOn: false,
  ImprovedFrListsOn: false,
  IRLPriceWithCurrencyOn: true,
  IRLPriceWithCurrencyCurrency: 0,
  IRLPriceWithCurrencyPackage: 0,
  HideNotifBadgesOn: true,
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
      Label: "Play",
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
  ForumMarkOn: true,
  MultiCancelOutTradesOn: true,
  ItemWishlistOn: true,
  HideUpgradeBtnOn: false
}
let Theme = null;

chrome.storage.sync.get(["PolyPlus_Settings"], function(result) {
  // Merge settings and expected settings to make sure all keys exist
  let RawSettings = result.PolyPlus_Settings
  Settings = MergeObjects(RawSettings || ExpectedSettings, ExpectedSettings);
  //chrome.storage.sync.set({ 'PolyPlus_Settings': Settings, arrayOrder: true }, function() {});

  // If theme exists, create a style element to represent it
  if (Settings.ThemeCreatorOn && Settings.ThemeCreatorOn === true) {
    Theme = document.createElement('style')
    switch (Settings.ThemeCreator.BGImageSize) {
      case 0:
        Settings.ThemeCreator.BGImageSize = 'fit'
        break
      case 1:
        Settings.ThemeCreator.BGImageSize = 'cover'
        break
      case 2:
        Settings.ThemeCreator.BGImageSize = 'contain'
        break
    }
    Theme.innerHTML = `
    :root {
      --polyplus-navbgcolor: ${Settings.ThemeCreator.NavBGColor};
      --polyplus-navbordercolor: ${Settings.ThemeCreator.NavBorderColor};
      --polyplus-navitemcolor: ${Settings.ThemeCreator.NavItemColor};
      --polyplus-sidebarbgcolor: ${Settings.ThemeCreator.SideBGColor};
      --polyplus-sidebarbordercolor: ${Settings.ThemeCreator.SideBorderColor};
      --polyplus-sidebaritembgcolor: ${Settings.ThemeCreator.SideItemBGColor};
      --polyplus-sidebaritembordercolor: ${Settings.ThemeCreator.SideItemBorderColor};
      --polyplus-sidebaritemcolor: ${Settings.ThemeCreator.SideItemColor};
      --polyplus-sidebaritemlabelcolor: ${Settings.ThemeCreator.SideItemLabelColor};
      --polyplus-bgcolor: ${Settings.ThemeCreator.BGColor};
      --polyplus-bgimage: url(${Settings.ThemeCreator.BGImage});
      --polyplus-bgimagesize: ${Settings.ThemeCreator.BGImageSize};
      --polyplus-primarytextcolor: ${Settings.ThemeCreator.PrimaryTextColor};
      --polyplus-secondarytextcolor: ${Settings.ThemeCreator.SecondaryTextColor};
      --polyplus-linktextcolor: ${Settings.ThemeCreator.LinkTextColor};
      --polyplus-linkhoveredtextcolor: ${Settings.ThemeCreator.LinkHoveredTextColor};
      --polyplus-linkfocusedtextcolor: ${Settings.ThemeCreator.LinkFocusedTextColor};
      --polyplus-linkvisitedtextcolor: ${Settings.ThemeCreator.LinkVisitedTextColor};
      --polyplus-cardheadbgcolor: ${Settings.ThemeCreator.CardHeadBGColor};
      --polyplus-cardbodybgcolor: ${Settings.ThemeCreator.CardBodyBGColor};
      --polyplus-cardbordercolor: ${Settings.ThemeCreator.CardBorderColor};
    }

    nav {
      background-color: var(--polyplus-navbgcolor) !important;
      border-bottom: 1px solid var(--polyplus-navbordercolor) !important;
    }

    .nav-sidebar {
      background-color: var(--polyplus-sidebarbgcolor) !important;
      border-right: 1px solid var(--polyplus-sidebarbordercolor) !important;
    }

    #app {
      background-color: var(--polyplus-bgcolor) !important;
      background-image: var(--polyplus-bgimage) !important;
      background-size var(--polyplus-bgimagesize)
      color: var(--polyplus-primarytextcolor) !important;
    }

    .text-muted {
      color: var(--polyplus-secondarytextcolor) !important;
    }

    a {
      color: var(--polyplus-linktextcolor) !important;
    }

    a:hover {
      color: var(--polyplus-linkhoveredtextcolor) !important;
    }

    a:focus {
      color: var(--polyplus-linkfocusedtextcolor) !important;
    }

    /*
    a:visited {
      color: var(--polyplus-linkvisitedtextcolor) !important;
    }
    */

    .card-header {
      background-color: var(--polyplus-cardheadbgcolor) !important;
    }

    .card {
      background-color: var(--polyplus-cardbodybgcolor) !important;
      border-color: var(--polyplus-cardbordercolor) !important;
    }

    nav a.nav-link {
      color: var(--polyplus-navitemcolor) !important;
    }

    .nav-sidebar .nav-sidebar-button {
      background-color: var(--polyplus-sidebaritembgcolor) !important;
      border-color: var(--polyplus-sidebaritembordercolor) !important;
      color: var(--polyplus-sidebaritemcolor) !important;
    }

    .nav-sidebar-text {
      color: var(--polyplus-sidebaritemlabelcolor) !important;
    }
    `
  }
});

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementsByClassName('card-header')[0] && document.getElementsByClassName('card-header')[0].innerText === ' Page not found') {
    return
  }

  // Check if Theme Exists, if so Load It
  if (Settings.ThemeCreatorOn && Settings.ThemeCreatorOn === true) {
    if (!(Settings.ThemeCreator.WebsiteLogo === null)) {
      document.querySelector('.nav-sidebar img').setAttribute('src', Settings.ThemeCreator.WebsiteLogo)
    }
  }
  if (Settings.ThemeCreatorOn && Settings.ThemeCreatorOn === true && Theme != null) {
    document.body.prepend(Theme)
  }

  // Define Data
  const UserData = {
    Username: document.querySelector('a.text-reset.text-decoration-none[href^="/users"]').innerText.replace(/\s+/g,''),
    ID: document.querySelector('.text-reset.text-decoration-none[href^="/users/"]').getAttribute('href').split('/')[2],
    Bricks: document.querySelector('.brickBalanceCont').innerText.replace(/\s+/g,'')
  }

  window.localStorage.setItem('account_info', JSON.stringify(UserData))
  document.body.setAttribute('data-URL', window.location.href)

  // Add PolyPlus Settings link to Sidebar
  const Parent = document.querySelector('ul.nav.nav-flush')
  const Clone = Parent.querySelectorAll('li.nav-item')[0].cloneNode(true)
  Clone.getElementsByTagName('a')[0].href = '/my/settings/polyplus'
  Clone.getElementsByTagName('span')[0].innerText = "Poly+"
  const Icon = Clone.querySelector('i')
  Icon.classList = 'fa-regular fa-sparkles'

  if (Settings.ModifyNavOn && Settings.ModifyNavOn === true) {
    let NavbarItems = document.querySelectorAll('#main-content nav.navbar .nav-link')
    let Needed = [NavbarItems[11],NavbarItems[12],NavbarItems[13],NavbarItems[14],NavbarItems[15]]
    for (let i = 0; i < Settings.ModifyNav.length; i++) {
      if (Settings.ModifyNav[i].Label != null) {
        Needed[i].children[1].innerText = Settings.ModifyNav[i].Label
        Needed[i].href = Settings.ModifyNav[i].Link
      }
    }
  }

  if (Settings.HideUpgradeBtnOn && Settings.HideUpgradeBtnOn === true) {
    document.querySelector('.nav-sidebar a[href="/upgrade"].nav-link.py-1.nav-sidebar-link').remove()
  }

  if (Settings.IRLPriceWithCurrencyOn && Settings.IRLPriceWithCurrencyOn === true) {
    var IRL;
    var DISPLAY;
    switch (Settings.IRLPriceWithCurrencyCurrency) {
      case 0:
        IRL = (UserData.Bricks.replace(/,/g, '') * 0.0099).toFixed(2)
        DISPLAY = 'USD'
        break
      case 1:
        IRL = (UserData.Bricks.replace(/,/g, '') * 0.009).toFixed(2)
        DISPLAY = 'EUR'
        break
      case 2:
        IRL = (UserData.Bricks.replace(/,/g, '') * 0.0131).toFixed(2)
        DISPLAY = 'CAD'
        break
      case 3:
        IRL = (UserData.Bricks.replace(/,/g, '') * 0.0077).toFixed(2)
        DISPLAY = 'GBP'
        break
      case 4:
        IRL = (UserData.Bricks.replace(/,/g, '') * 0.1691).toFixed(2)
        DISPLAY = 'MXN'
        break
      case 5:
        IRL = (UserData.Bricks.replace(/,/g, '') * 0.0144).toFixed(2)
        DISPLAY = 'AUD'
        break
      case 6:
        IRL = (UserData.Bricks.replace(/,/g, '') *  0.2338).toFixed(2)
        DISPLAY = 'TRY'
        break
    }
    let BrickBalanceCount = [document.querySelector('.text-success .brickBalanceCount'), document.querySelector('.text-success .brickBalanceCont')]
    BrickBalanceCount.forEach(element => {
      element.innerText = element.innerText + ` ($${IRL} ${DISPLAY})`
    });
  }

  if (Settings.HideNotifBadgesOn && Settings.HideNotifBadgesOn === true) {
    document.querySelectorAll('.notif-nav.notif-sidebar').forEach(element => {element.remove();});
  }
});

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