var Settings;
let Theme = ``;

(async () => {
  let Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
  Utilities = Utilities.default;

  chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
    // Merge settings and expected settings to make sure all keys exist
    const RawSettings = result.PolyPlus_Settings;
    Settings = Utilities.MergeObjects(RawSettings || Utilities.DefaultSettings, Utilities.DefaultSettings);

    const PageLoad = async function() {
      if (document.getElementsByClassName('card-header')[0] && document.getElementsByClassName('card-header')[0].innerText === ' Page not found') {
        return;
      }

      Utilities.InjectResource('getUserDetails');
      document.body.setAttribute('data-URL', window.location.pathname);

      if (Settings.IRLPriceWithCurrency && Settings.IRLPriceWithCurrency.Enabled === true) {
        const IRLResult = await Utilities.CalculateIRL(document.querySelector('.brickBalanceCont').innerText.replace(/\s+/g, ''), Settings.IRLPriceWithCurrency.Currency);
        // Desktop
        document.querySelector('.text-success .brickBalanceCount').innerHTML += ` (${IRLResult.icon}${IRLResult.result} ${IRLResult.display})`;

        // Mobile
        document.querySelector('.text-success .brickBalanceCont').innerHTML += ` (${IRLResult.icon}${IRLResult.result} ${IRLResult.display})`;
        //document.querySelector('.text-success .brickBalanceCont').innerHTML += `<div class="text-muted" style="font-size: 0.6rem;text-align: right;">(${IRLResult.icon}${IRLResult.result} ${IRLResult.display})</div>`
      }

      if (Settings.ModifyNavOn && Settings.ModifyNavOn === true) {
        let NavbarItems = document.querySelectorAll('.navbar-nav.me-auto a.nav-link[href]');
        let Needed = [NavbarItems[11], NavbarItems[12], NavbarItems[13], NavbarItems[14], NavbarItems[15]];
        for (let i = 0; i < Settings.ModifyNav.length; i++) {
          if (Settings.ModifyNav[i].Label != null) {
            Needed[i].children[1].innerText = Settings.ModifyNav[i].Label;
            Needed[i].href = Settings.ModifyNav[i].Link;
          }
        }
      }

      if (Settings.HideUserAds && Settings.HideUserAds.Enabled === true) {
        if (Settings.HideUserAds.Banners && Settings.HideUserAds.Banners === true) {
          Theme += `
          div[style^="max-width: 728px;"]:has(a[href^="/ads"]) {
            display: none;
          }
          `;
        }
  
        if (Settings.HideUserAds.Rectangles && Settings.HideUserAds.Rectangles === true) {
          Theme += `
          div[style^="max-width: 300px;"]:has(a[href^="/ads"]) {
            display: none;
          }
          `;
        }
      }
  
      if (Settings.HideNotifBadgesOn === true) {
        document.getElementsByClassName('notifications-toggle')[0].getElementsByTagName('i')[0].classList = 'fa-bell far'
        Theme += `
        .notif-nav.notif-sidebar {
          display: none;
        }
  
        .notifications-toggle {
          opacity: 0.6;
        }
  
        .notifications-toggle .unread-indicator {
          display: none;
        }
        `;
      }
      
      // Credit to @SK-Fast (also known as DevPixels) for the improved loading code (taken from his original Poly+, and reformatted to Index Poly+)
      const ThemeBlob = new Blob([Theme], { type: 'text/css' });
      const ThemeURL = URL.createObjectURL(ThemeBlob);
      document.head.innerHTML += `<link href="${ThemeURL}" rel="stylesheet" type="text/css">`;

      /*
      chrome.storage.local.get(['PolyPlus_AdCache'], async function(result){
        const AdCache = result.PolyPlus_AdCache || {};

        const NewCacheAdditions = Array.from(document.querySelectorAll('a[href^="/ads"]')).map(async (ad) => {
          const AdID = ad.getAttribute('href').split('/')[2]
          if (Object.keys(AdCache).indexOf(AdID) === -1) {
            const AssetURL = (await fetch(ad.href)).url
            const AssetInfo = ((await fetch(AssetURL.replace('polytoria.com/', 'api.polytoria.com/v1/'))).json())
            console.log(AssetInfo)
            AdCache[AdID] = AssetInfo
          }
        })

        await Promise.all(NewCacheAdditions)

        console.log(AdCache)
      })
        */

      if (/\/inbox\/messages\/[0-9]+\/compose/.test(window.location.pathname) && new URLSearchParams(window.location.search).has('anniversaryPreset')) {
        const AnniversaryNumber = parseInt(new URLSearchParams(window.location.search).get('anniversaryPreset'))
        const MessageSubject = document.querySelector('[action^="/inbox"] #subject')
        const MessageBody = document.querySelector('[action^="/inbox"] #body')
  
        const RandomAnniversaryMessage = [
          {
            subject: "Happy :number+ Polytorian Anniversary!",
            body: `Congratulations on your :number full year on Polytoria, :recipient! 🎉🎂🎈
  
Best wishes,
- :username
            `
          },
          {
            subject: `:number Year${ (AnniversaryNumber > 1) ? 's' : '' } on Polytoria!`,
            body: `Happy :number+ Polytorian Anniversary, :recipient! 🎈🎈🎉🎉
  
Yours truly,
- :username
            `
          },
          {
            subject: `:number Year${ (AnniversaryNumber > 1) ? 's' : '' } of Polytorian Fun!`,
            body: `I am so proud of you for reaching :number years on Polytoria, :recipient! 🎉🎂🎈
  
Warm regards,
- :username
            `
          },
          {
            subject: "Congratulations on :number Years on Polytoria!",
            body: `:recipient, you have been on Polytoria for :number ${ (AnniversaryNumber === 1) ? 'whole' : 'full' } years! I am writing to congratulate you on this amazing achievement! 🎉🎂🎈
  
With love and fun,
- :username
            `
          }
        ][Math.floor(Math.random() * 3) + 1]
  
        MessageSubject.value = RandomAnniversaryMessage.subject.replace(':number', AnniversaryNumber).replace(':number+', AnniversaryNumber + (AnniversaryNumber % 10 === 1 && AnniversaryNumber % 100 !== 11 ? 'st' : AnniversaryNumber % 10 === 2 && AnniversaryNumber % 100 !== 12 ? 'nd' : AnniversaryNumber % 10 === 3 && AnniversaryNumber % 100 !== 13 ? 'rd' : 'th'))
          
        setTimeout(() => {
          const NewMessageBody = document.createElement('textarea')
          NewMessageBody.classList = 'form-control'
          NewMessageBody.id = 'body'
          NewMessageBody.name = 'body'
          NewMessageBody.rows = '16'
          NewMessageBody.innerHTML = RandomAnniversaryMessage.body.replace(':number', AnniversaryNumber).replace(':number+', AnniversaryNumber + (AnniversaryNumber % 10 === 1 && AnniversaryNumber % 100 !== 11 ? 'st' : AnniversaryNumber % 10 === 2 && AnniversaryNumber % 100 !== 12 ? 'nd' : AnniversaryNumber % 10 === 3 && AnniversaryNumber % 100 !== 13 ? 'rd' : 'th')).replace(':recipient', document.querySelector('[action^="/inbox"] a[href^="/u"]').innerText).replace(':username', document.querySelector('a[href^="/u"]:has(.dropdown-item):first-child').innerText.replaceAll('\n', '').replaceAll('\t', '').trim())
          MessageBody.parentElement.appendChild(NewMessageBody)
          MessageBody.remove()
        }, 100);
      }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      PageLoad()
    } else {
      document.addEventListener('DOMContentLoaded', PageLoad);
    }

    // Apply Theme
    LoadTheme();

    const combination = "reload";
    let currentCombination = "";
    document.addEventListener("keypress", function (e) {
      currentCombination += e.key;
      if (currentCombination === combination && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        try {
          console.log("Reloading Poly+...");
          chrome.runtime.sendMessage({ action: "reload" });
          window.location.reload();
        } catch(error) {
          console.log("Reloading Poly+...");
          window.location.reload()
          chrome.runtime.sendMessage({ action: "reload" });
          window.location.reload();
        }
      } else if (!combination.startsWith(currentCombination)) {
        currentCombination = "";
      }
    });
  });
})();

function LoadTheme() {
  if (!Settings.ThemeCreator || Settings.ThemeCreator.Enabled !== true) { return }

  switch (Settings.ThemeCreator.BGImageSize) {
    case 0:
      Settings.ThemeCreator.BGImageSize = 'fit';
      break;
    case 1:
      Settings.ThemeCreator.BGImageSize = 'cover';
      break;
    case 2:
      Settings.ThemeCreator.BGImageSize = 'contain';
      break;
  }
  Theme += `
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
  `;
}