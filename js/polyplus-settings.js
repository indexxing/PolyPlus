const InExtensionSettings = (window.location.pathname.split('/')[3] === "polyplus")
console.log(window.location.pathname.split('/')[3], InExtensionSettings)

if (InExtensionSettings === true) {
  window.location.href = chrome.runtime.getURL('settings.html')
}

document.addEventListener('DOMContentLoaded', function(){
  const Nav = document.getElementsByClassName('nav nav-pills')[0]
  
  if (InExtensionSettings === true) {
    Array.from(Nav.children).forEach(item => {
      if (item.classList.contains('active')) {
        item.classList.remove('active')
      }
    })
  }

  const PolyPlusItem = document.createElement('a')
  PolyPlusItem.classList = 'nav-link'
  PolyPlusItem.href = chrome.runtime.getURL('settings.html')
  PolyPlusItem.innerHTML = `
  <i class="fa-regular fa-sparkles me-1"></i> <span class="pilltitle">Poly+</span>
  `

  Nav.insertBefore(PolyPlusItem, Nav.getElementsByTagName('hr')[0])

  return
  if (window.location.pathname.split('/')[3] === "polyplus") {
    console.log('is settings')
    PolyPlusItem.classList.add('active')
    document.getElementsByClassName('col-lg-10')[0].innerHTML = `
    <style>
      #page {
        margin-top: 7.5rem;
      }
  
      h1 {
        font-size: 4.6rem;
        color: rgb(48, 48, 48);
      }
  
      h1 span.indent {
        border-left: 10px solid rgb(48, 48, 48);
        margin-right: 15px;
      }
  
      h1 span.highlight {
        color: red;
      }
  
      h2 {
        color: rgb(48, 48, 48);
      }
  
      h2 span.indent {
        border-left: 7.5px solid rgb(48, 48, 48);
        margin-right: 15px;
      }
  
      p span:first-child {
        font-size: 1.4rem;
      }
  
      span.desc {
        color: rgb(120, 120, 120);
      }
  
      .goback {
        color: rgb(120, 120, 120);
        text-decoration: none;
      }
  
      dialog {
        background-color: #080808;
        color: #c4c4c4;
        border: 1px solid #3bafff;
        border-radius: 10px;
      }
  
      .input-group-text {
        background-color: #000;
        border-color: #000;
        color: #fff;
      }
  
      label {
        font-size: 0.8rem;
        margin-bottom: 2.75px;
      }
  
      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.73);
      }
  
      dialog .modal-header p {
        margin-bottom: 0px;
        color: #fff;
      }
  
      dialog .modal-body p:first-child {
        font-size: 0.9rem;
      }
  
      /*
      p span span.status {
        font-size: 0.16rem !important;
        color: #cee;
      }
      */
    </style>
    <dialog class="w-50" id="ResetDefaults-Modal">
      <div class="modal-header">
        <p>Are you Sure?</p>
      </div>
      <div class="modal-body">
        <p>Are you sure you'd like to reset all settings to their respective defaults? (this action is irreversible)</p>
        <button id="ResetDefaults-Modal-Yes" class="btn btn-danger">Yes</button>
        <button id="ResetDefaults-Modal-No" class="btn btn-primary">No</button>
      </div>
    </dialog>
    <dialog class="w-50" id="ThemeCreator-Modal" data-setting="ThemeCreator">
      <div class="modal-header">
        <p>Theme Creator</p>
      </div>
      <div class="modal-body">
        <p>Unleash your creativity and customize the Polytoria website to your liking! (this feature is still in development)</p>
        <!--
        <div class="mx-auto" style="width: 450px; height: 350px; border: 2.5px solid #fff;">
          <div class="row h-100">
            <div class="col-md-1 h-100" style="padding: 25px; border-right: 2.5px solid #fff; padding-left: 0px !important;"></div>
            <div class="col h-100" style="padding-left: 0px !important;">
              <div style="padding: 10px; width: 100%; border-bottom: 2.5px solid #fff; margin-bottom: 3.5px"></div>
              <h2 class="mb-1">Heading</h2>
              <p>This is a preview!</p>
            </div>
          </div>
        </div>
        -->
        <hr class="mt-2 mb-3">
  
        <label>Save Theme to JSON</label>
        <div class="row">
          <div class="col">
            <input id="SaveThemeToJSONInput" type="text" class="form-control bg-dark mb-2" placeholder="JSON..." data-ignore="true" disabled>
          </div>
          <div class="col-auto">
            <button id="CopyThemeJSONBtn" class="btn btn-warning"><i class="fa-duotone fa-clipboard"></i></button>
          </div>
        </div>
  
        <label>Load Theme from JSON</label>
        <input type="text" class="form-control bg-dark mb-2" placeholder="JSON..." data-ignore="true">
        <button id="LoadThemeFromJSONBtn" class="btn btn-primary mb-2" data-ignore="true" data-onclick="LoadThemeJSON(this.previousElementSibling.value)">Load</button>
  
        <hr class="mt-2 mb-3">
  
        <div class="card mb-2">
          <div class="card-header">Navigation</div>
          <div class="card-body">
            <label>Navbar Background Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="NavBGColor">
  
            <label>Navbar Border Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="NavBorderColor">
  
            <label>Sidebar Background Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SideBGColor">
  
            <label>Sidebar Border Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SideBorderColor">
  
            <hr class="navbar-divider">
  
            <label>Navbar Item Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="NavItemColor">
  
            <label>Sidebar Item Background Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SideItemBGColor">
  
            <label>Sidebar Item Border Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SideItemBorderColor">
  
            <label>Sidebar Item Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SideItemColor">
  
            <label>Sidebar Item Label Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SideItemLabelColor">
          </div>
        </div>
  
        <div class="card mb-2">
          <div class="card-header">Background</div>
          <div class="card-body">
            <label>Background Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="BGColor">
        
            <label>Background Image (URL)</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="BGImage">
        
            <label>Background Image Size (if there is a background image)</label>
            <select class="form-select bg-dark mb-2" data-setting="BGImageSize">
              <option value="fit" selected>Fit (default)</option>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>
        </div>
  
        <div class="card mb-2">
          <div class="card-header">Text</div>
          <div class="card-body">
            <label>Primary Text Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="PrimaryTextColor">
        
            <label>Secondary Text Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="SecondaryTextColor">
        
            <div class="row">
              <div class="col">
                <label>Link (state: default) Text Color</label>
                <input class="form-control bg-dark mb-2" placeholder="..." data-setting="LinkTextColor">
              </div>
              <div class="col">
                <label>Link (state: hovered) Text Color</label>
                <input class="form-control bg-dark mb-2" placeholder="..." data-setting="LinkHoveredTextColor">
              </div>
              <div class="col">
                <label>Link (state: focused) Text Color</label>
                <input class="form-control bg-dark mb-2" placeholder="..." data-setting="LinkFocusedTextColor">
              </div>
              <!--
              <div class="col">
                <label>Link (state: visited) Text Color</label>
                <input class="form-control bg-dark mb-2" placeholder="..." data-setting="LinkVisitedTextColor">
              </div>
              -->
            </div>
          </div>
        </div>
  
        <div class="card mb-2">
          <div class="card-header">Cards</div>
          <div class="card-body">
            <label>Card (Header) Background Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="CardHeadBGColor">
  
            <label>Card (Body) Background Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="CardBodyBGColor">
  
            <label>Card Border Color</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="CardBorderColor">
          </div>
        </div>
  
        <div class="card mb-2">
          <div class="card-header">Branding</div>
          <div class="card-body">
            <label>Website Logo (URL)</label>
            <input class="form-control bg-dark mb-2" placeholder="..." data-setting="WebsiteLogo">
          </div>
        </div>
  
        <button class="btn btn-success" data-setting="[save]">Save</button>
        <button class="btn btn-secondary" data-setting="[cancel]">Cancel</button>
      </div>
    </dialog>
    <dialog class="w-50" id="ModifyNav-Modal" data-setting="ModifyNav">
      <div class="modal-header">
        <p>Modify Navbar</p>
      </div>
      <div class="modal-body">
        <p>Customize the navbar to your liking!</p>
        <hr class="mt-2 mb-3">
        <div class="card mb-2">
          <div class="card-header">#1 Navbar Item</div>
          <div class="card-body">
            <label>Label</label>
            <input id="ModifyNav-Modal-1Label" class="form-control bg-dark mb-2" placeholder="Play" data-parent="0" data-setting="Label">
  
            <label>Link</label>
            <input id="ModifyNav-Modal-1Link" class="form-control bg-dark mb-2" placeholder="https://polytoria.com/places/" data-parent="0" data-setting="Link">
          </div>
        </div>
        <div class="card mb-2">
          <div class="card-header">#2 Navbar Item</div>
          <div class="card-body">
            <label>Label</label>
            <input id="ModifyNav-Modal-2Label" class="form-control bg-dark mb-2" placeholder="Store" data-parent="1" data-setting="Label">
  
            <label>Link</label>
            <input id="ModifyNav-Modal-2Link" class="form-control bg-dark mb-2" placeholder="https://polytoria.com/store/" data-parent="1" data-setting="Link">
          </div>
        </div>
        <div class="card mb-2">
          <div class="card-header">#3 Navbar Item</div>
          <div class="card-body">
            <label>Label</label>
            <input id="ModifyNav-Modal-3Label" class="form-control bg-dark mb-2" placeholder="Guilds" data-parent="2" data-setting="Label">
  
            <label>Link</label>
            <input id="ModifyNav-Modal-3Link" class="form-control bg-dark mb-2" placeholder="https://polytoria.com/guilds/" data-parent="2" data-setting="Link">
          </div>
        </div>
        <div class="card mb-2">
          <div class="card-header">#4 Navbar Item</div>
          <div class="card-body">
            <label>Label</label>
            <input id="ModifyNav-Modal-4Label" class="form-control bg-dark mb-2" placeholder="People" data-parent="3" data-setting="Label">
  
            <label>Link</label>
            <input id="ModifyNav-Modal-4Link" class="form-control bg-dark mb-2" placeholder="https://polytoria.com/users/" data-parent="3" data-setting="Link">
          </div>
        </div>
        <div class="card mb-2">
          <div class="card-header">#5 Navbar Item</div>
          <div class="card-body">
            <label>Label</label>
            <input id="ModifyNav-Modal-5Label" class="form-control bg-dark mb-2" placeholder="Forum" data-parent="4" data-setting="Label">
  
            <label>Link</label>
            <input id="ModifyNav-Modal-5Link" class="form-control bg-dark mb-2" placeholder="https://polytoria.com/forum" data-parent="4" data-setting="Link">
          </div>
        </div>
  
        <button id="ModifyNav-Modal-Save" class="btn btn-success" data-setting="[save]">Save</button>
        <button id="ModifyNav-Modal-Save" class="btn btn-secondary" data-setting="[cancel]">Cancel</button>
      </div>
    </dialog>
    <div>
      <p id="PinnedGames">
        <span>
          Pinned Games (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="PinnedGamesOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Pin your favorite games to the top of the homepage!</span>
      </p>
      <p id="ForumMentions">
        <span>
          Forum Mentions (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ForumMentsOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Get a quick link to the popular person everyone is talking about's profile!</span>
      </p>
      <p id="BestFriends">
        <span>
          Best Friends (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="BestFriendsOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Prioritize the bestest of friends on applicable friend lists!</span>
      </p>
      <p id="ImprovedFriendLists">
        <span>
          Improved Friend Lists (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ImprovedFrListsOn">Toggle</button>
        </span>
        <br>
        <span class="desc">
          Accept or decline all friend requests with the click of a button or multi-remove existing friends!
          <br>
          <span style="font-size: 0.8rem; color: orange;">* You can only remove up to 25 friends at once.</span>
        </span>
      </p>
      <p id="IRLPriceWithCurrency">
        <span>
          Show IRL price with Brick Count (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="IRLPriceWithCurrencyOn">Toggle</button>
        </span>
        <br>
        <span class="desc mb-4">
          See the real life currency value along with Bricks across the site!
          <br>
          <span style="font-size: 0.8rem; color: orange;">* Currencies were calculated on [DATE].</span>
          <br>
          <span style="font-size: 0.8rem; color: orange;">* Currencies other than USD are purely approximations.</span>
        </span>
        <select id="IRLPriceWithCurrencyCurrency" class="form-select form-select-sm mb-2" style="width:350px;" data-setting="IRLPriceWithCurrencyCurrency">
          <option value="USD" selected>United States Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="CAD">Canadian Dollar (CAD)</option>
          <option value="GBP">Great British Pound (GBP)</option>
          <option value="MXN">Mexican Peso (MXN)</option>
          <option value="AUD">Australian Dollar (AUD)</option>
          <option value="TRY">Turkish Lira (TRY)</option>
        </select>
  
        <select id="IRLPriceWithCurrencyPackage" class="form-select form-select-sm mb-2" style="width:350px;" data-setting="IRLPriceWithCurrencyPackage">
          <option value="0" selected>$0.99 USD</option>
          <option value="1">$4.99 USD</option>
          <option value="2">$9.99 USD</option>
          <option value="3">$24.99 USD</option>
          <option value="4">$49.99 USD</option>
          <option value="5">$99.99 USD</option>
        </select>
      </p>
      <p id="HideNotifBadges">
        <span>
          Hide Notification Badges (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="HideNotifBadgesOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Hide the annoying red circles on the sidebar!</span>
      </p>
      <p id="SimplifiedProfileURLs">
        <span>
          Simplified Profile URLs (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="SimplifiedProfileURLsOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Makes all profile URLs simpler by allowing for you to go to "https://polytoria.com/profile/UsernameGoesHere" to redirect to the real profile URL!</span>
      </p>
      <p id="StoreOwnTag">
        <span>
          Show "OWNED" Tag on Store Main Page (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="StoreOwnTagOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Quickly see if you own the item at a glance with a little tag in the top left corner of item cards on the main store page!</span>
      </p>
      <p id="ThemeCreator">
        <span>
          Theme Creator (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ThemeCreatorOn">Toggle</button>
          <button id="ThemeCreator-Options" class="btn btn-primary btn-sm" data-modal="ThemeCreator">Options</button>
        </span>
        <br>
        <span class="desc">Unleash your creativity and customize the Polytoria website to your liking! (this feature is still in development)</span>
      </p>
      <p id="MoreSearchFilters">
        <span>
          More Search Filters (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="MoreSearchFiltersOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Easily find what you're looking for with more search filters side-wide! (this does not affect the main site search on the navbar)</span>
      </p>
      <p id="ApplyMembershipTheme">
        <span>
          Apply Membership Theme for <b>Free</b> (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ApplyMembershipThemeOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Ever want the fancy membership themes for completely <b>free</b>? Well now you can get apply them site-wide!</span>
        <select id="ApplyMembershipThemeTheme" class="form-select form-select-sm mb-2" style="width:350px;" data-setting="ApplyMembershipThemeTheme">
          <option value="Plus" selected>Plus</option>
          <option value="PlusDX">Plus Deluxe</option>
        </select>
      </p>
      <p id="ForumMarkdown" style="display: none;">
        <span>
          Forum Markdown (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ForumMarkOn">Toggle</button>
        </span>
        <br>
        <span class="desc">
          Format forum posts to make them look epic!
        </span>
      </p>
      <p id="MultiCancelOutTrades">
        <span>
          Multi-Cancel Outbound Trades (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="MultiCancelOutTradesOns">Toggle</button>
        </span>
        <br>
        <span class="desc">
          Quickly cancel several out-bound trades (trades that you have sent) all at once
          <br>
          <span style="font-size: 0.8rem; color: orange;">* You can only cancel up to 10 trades at once.</span>
        </span>
      </p>
      <p id="ModifyNav">
        <span>
          Modify Navbar (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ModifyNavOn">Toggle</button>
          <button id="ModifyNav-Options" class="btn btn-primary btn-sm" data-modal="ModifyNav">Options</button>
        </span>
        <br>
        <span class="desc">
          Customize the navbar to your liking!
        </span>
      </p>
      <p id="ItemWishlist">
        <span>
          Item Wishlist (<span class="status">enabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="ItemWishlistOn">Toggle</button>
        </span>
        <br>
        <span class="desc">
          Wishlist that item that you REALLY want!
        </span>
      </p>
      <p id="HideUpgradeBtn">
        <span>
          Hide Upgrade Button (<span class="status">disabled</span>)
          <button class="btn btn-warning btn-sm" data-setting="HideUpgradeBtnOn">Toggle</button>
        </span>
        <br>
        <span class="desc">Hide the ugly blue "Upgrade" button on the sidebar!</span>
      </p>
      <hr>
      <button id="Save" class="btn btn-primary" disabled="true">Save</button>
      <button id="ResetDefaults" class="btn btn-warning">Reset to Default Settings</button>
      <p class="text-muted mt-2" style="font-size: 0.8rem;">made by Index</p>
    </div>
    `;
  
    const SaveBtn = document.getElementById('Save')
    const Elements = [
      document.getElementById("PinnedGames"),
      document.getElementById("ForumMentions"),
      document.getElementById("BestFriends"),
      document.getElementById("ImprovedFriendLists"),
      document.getElementById("IRLPriceWithCurrency"),
      document.getElementById("HideNotifBadges"),
      document.getElementById("SimplifiedProfileURLs"),
      document.getElementById("StoreOwnTag"),
      document.getElementById("ThemeCreator"),
      document.getElementById("MoreSearchFilters"),
      document.getElementById("ApplyMembershipTheme"),
      document.getElementById("MultiCancelOutTrades"),
      document.getElementById("ModifyNav"),
      document.getElementById("ItemWishlist"),
      document.getElementById("HideUpgradeBtn")
    ];
    const ExpectedSettings = {
      PinnedGamesOn: true,
      ForumMentsOn: false,
      BestFriendsOn: true,
      ImprovedFrListsOn: true,
      IRLPriceWithCurrencyOn: true,
      IRLPriceWithCurrencyCurrency: 0,
      IRLPriceWithCurrencyPackage: 0,
      HideNotifBadgesOn: false,
      SimplifiedProfileURLsOn: true,
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
    }
  
    /*
    const ResetDefaultsModal = document.getElementById('ResetDefaults-Modal')
    const ThemeCreatorModal = {
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
    */
    SaveBtn.addEventListener("click", function() {Save()});
    Elements.forEach(element => {
      let Button = element.getElementsByTagName('button')[0]
      let Options = element.getElementsByTagName('button')[1]
      let Select = element.getElementsByTagName('select') || []
  
      if (Button) {
        Button.addEventListener('click', function() {
          console.log('button clicked!!!!')
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
                if (Settings[Modal.getAttribute('data-setting')][input.getAttribute('data-setting')] !== "undefined") {
                  input.value = Settings[Modal.getAttribute('data-setting')][input.getAttribute('data-setting')]
                }
              } else {
                let Parent = input.getAttribute('data-parent')
                if (Settings[Modal.getAttribute('data-setting')][Parent][input.getAttribute('data-setting')] !== "undefined") {
                  if (!isNaN(parseInt(Parent))) {Parent = parseInt(Parent)}
                  input.value = Settings[Modal.getAttribute('data-setting')][Parent][input.getAttribute('data-setting')]
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
          console.log(element, FormatBool(Settings[element.getElementsByTagName('button')[0].getAttribute('data-setting')]))
          Status.innerText = FormatBool(Settings[element.getElementsByTagName('button')[0].getAttribute('data-setting')])
          let SelectInput = element.getElementsByTagName('select')[0]
          if (SelectInput) {
            SelectInput.selectedIndex = Settings[SelectInput.getAttribute('data-setting')]
          }
        });
      });
    }
    LoadCurrent();
  
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
      SaveBtn.setAttribute('disabled', 'true')
      window.localStorage.setItem('PolyPlusSettings', JSON.stringify(Settings))
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
      }
    });
  
    let CurrencyDate = LoadFile(chrome.runtime.getURL('js/resources/currencies.json'), function(text){
      CurrencyDate = new Date(JSON.parse(text).Date).toLocaleDateString("en-US", {day:"numeric",month:"long",year:"numeric"})
  
      document.getElementById('IRLPriceWithCurrencyCurrency').previousElementSibling.children[1].innerText = document.getElementById('IRLPriceWithCurrencyCurrency').previousElementSibling.children[1].innerText.replace('[DATE]', CurrencyDate)
    })
  
    function LoadThemeJSON(string) {
      try {
        let JSONTable = JSON.parse(string)
        if (JSONTable.length === ExpectedSettings.ThemeCreator.length) {
          if (confirm('Are you sure you\'d like to replace this theme with the theme specified in the JSON?') === true) {
            LoadThemeFromJSONBtn.previousElementSibling.value = ''
            document.getElementById('ThemeCreator-Modal').close()
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
  }
});