/*
HOW TO USE IN CONTENT SCRIPTS:

(async () => {
  let Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
  Utilities = Utilities.default
})();
*/

export default {
  DefaultSettings: {
    PinnedGamesOn: true,
    ForumMentsOn: true,
    BestFriendsOn: false,
    ImprovedFrListsOn: false,
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
    MultiCancelOutTradesOn: true,
    ItemWishlistOn: true,
    HideUpgradeBtnOn: false
  },
  CalculateIRL: async function(bricks, to, brickPackage) {
    /*
    const response = await fetch(chrome.runtime.getURL('/js/resources/currencies.json'))
    if (!response.ok) {
      throw new Error('Getting currency data failure')
    }
    const data = await response.json()
    */

    let IRL;
    let DISPLAY;
    //const UnitPrice = data.Data[brickPackage][to]
    switch (to) {
      case 0:
        IRL = (bricks.replace(/,/g, '') * 0.0099).toFixed(2)
        DISPLAY = 'USD'
        break
      case 1:
        IRL = (bricks.replace(/,/g, '') * 0.009).toFixed(2)
        DISPLAY = 'EUR'
        break
      case 2:
        IRL = (bricks.replace(/,/g, '') * 0.0131).toFixed(2)
        DISPLAY = 'CAD'
        break
      case 3:
        IRL = (bricks.replace(/,/g, '') * 0.0077).toFixed(2)
        DISPLAY = 'GBP'
        break
      case 4:
        IRL = (bricks.replace(/,/g, '') * 0.1691).toFixed(2)
        DISPLAY = 'MXN'
        break
      case 5:
        IRL = (bricks.replace(/,/g, '') * 0.0144).toFixed(2)
        DISPLAY = 'AUD'
        break
      case 6:
        IRL = (bricks.replace(/,/g, '') *  0.2338).toFixed(2)
        DISPLAY = 'TRY'
        break
      case 7:
        IRL = (bricks.replace(/,/g, '') * 0.49).toFixed(2)
        DISPLAY = 'BRL'
        break
    }
    return {bricks: IRL, display: DISPLAY}
  }
}
