const ItemID = window.location.pathname.split('/')[2]
const UserID = JSON.parse(window.localStorage.getItem('account_info')).ID
const ItemGrid = document.getElementById('assets')

var Settings;
var Inventory = null;
var Utilities;
(async () => {
    Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
    Utilities = Utilities.default

    Update()
})();


chrome.storage.sync.get(['PolyPlus_Settings'], function(result){ Settings = result.PolyPlus_Settings || Utilities.DefaultSettings; });

async function Update() {
    if (Settings.IRLPriceWithCurrencyOn === true) {
        Array.from(ItemGrid.children).forEach(element => {
            LoadIRLPrices(element)
        });
    }

    if (Settings.StoreOwnTagOn === true) {
        Inventory = (await (await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory?limit=50')).json()).inventory
        Array.from(ItemGrid.children).forEach(element => {
            LoadOwnedTags(element)
        });
    }

    if (Settings.EventItemsCatOn === true) {
        EventItems()
    }
}

const observer = new MutationObserver(async function (list){
    for (const record of list) {
        for (const element of record.addedNodes) {
            if (element.tagName === "DIV" && element.classList.value === 'mb-3 itemCardCont') {
                if (Settings.IRLPriceWithCurrencyOn === true) { LoadIRLPrices(element) }
                if (Settings.StoreOwnTagOn === true) { LoadOwnedTags(element) }
            }
        }
        observer.observe(ItemGrid, {attributes: false,childList: true,subtree: false});
    }
});

observer.observe(ItemGrid, {attributes: false,childList: true,subtree: false});

async function LoadIRLPrices(element) {
    //if (element.tagName !=)
    //if (element.tagName != "DIV") {return}
    if (element.querySelector('small.text-primary')) {return}
    const Parent = element.getElementsByTagName('small')[1]
    if (Parent.innerText === "") { return }
    const Span = document.createElement('span')
    Span.classList = 'text-muted polyplus-price-tag'
    Span.style.fontSize = '0.7rem'
    const Price = Parent.innerText.split(' ')[1]
    const IRLResult = await Utilities.CalculateIRL(Price, Settings.IRLPriceWithCurrencyCurrency)
    Span.innerText = "($" + IRLResult.result + " " + IRLResult.display + ")"
    Parent.appendChild(Span)
}

function LoadOwnedTags(element) {
    let Item = CheckInventory(parseInt(element.querySelector('[href^="/store/"]').getAttribute('href').split('/')[2]))
    if (Item !== null) {
        const Tag = document.createElement('span')
        Tag.classList = 'badge bg-primary polyplus-own-tag'
        Tag.style = 'position: absolute;font-size: 0.7rem;top: 0px;left: 0px;padding: 5.5px;border-top-left-radius: var(--bs-border-radius-lg)!important;border-top-right-radius: 0px;border-bottom-left-radius: 0px;font-size: 0.65rem;'
        if (Item.asset.isLimited === false) {
            Tag.innerText = "owned"
        } else {
            Tag.innerHTML = 'owned<br><span class="text-muted" style="font-size: 0.65rem;">#' + Item.serial
        }
        element.getElementsByTagName('img')[0].parentElement.appendChild(Tag)
    }
}

function CheckInventory(id) {
    let Item = null
    Inventory.forEach(element => {
        if (element.asset.id === id) {
            Item = element
        }
    })
    return Item
}

function EventItems() {
    const Categories = document.getElementById('store-categories').children[0]

    const Selector = document.createElement('div')
    Selector.classList = 'form-check store-category-check fw-bold'
    Selector.style.borderColor = '#B008B0'
    Selector.innerHTML = `
    <input class="form-check-input" type="radio" name="storecat" id="storecat-eventitems">
    <label class="form-check-label" for="storecat-eventitems">
        <i class="fad fa-party-horn"></i> Event Items
    </label>
    `
    Categories.appendChild(Selector)

    const CategoryDiv = document.createElement('div')
    ItemGrid.parentElement.insertBefore(CategoryDiv, ItemGrid)

    let EventData = null
    let Events = []
    let Groups = []

    Array.from(Categories.children).forEach(selector => {
        if (selector !== Selector) {
            selector.children[0].addEventListener('click', function() {
                ItemGrid.innerHTML = ``
                ItemGrid.classList.add('itemgrid')
            })
        }
    })

    Selector.children[0].addEventListener('click', async function() {
        EventItemsEnabled = true
        Array.from(Categories.children).forEach(selector => {
            selector.classList.remove('active')
        })
        Selector.classList.add('active')
        if (EventData === null) {
            EventData = await (await fetch('https://polyplus.vercel.app/data/eventItems.json')).json()

            Object.values(EventData.eventDetails).forEach((x, index) => {Groups.push({
                ...x,
                items: EventData.items.filter((x) => x.event === Object.keys(EventData.eventDetails)[index])
            })})
            while (Events.length > 0) {
                Groups.push(Events.splice(0, 3))
            }
        }

        console.log(Groups)

        ItemGrid.classList.remove('itemgrid')
        ItemGrid.innerHTML = `
        ${
            Groups.map((x, index) => `
            <div class="row px-2 px-lg-0" style="animation-delay: 0.24s;">
					<div class="col">
						<h6 class="dash-ctitle2">${x.date}</h6>
						<h5 class="dash-ctitle">${x.name}</h5>
					</div>
				</div>
				<div class="card card-dash mcard mb-3" style="animation-delay: 0.27s;">
					<div class="card-body p-0 m-1 scrollFadeContainer">
						<div class="d-flex">
							${
                            x.items.map((x) => `
                            <a href="/store/${x.id}">
								<div class="scrollFade card me-2 place-card force-desktop text-center mb-2" style="opacity: 1;">
									<div class="card-body">
										<img src="${x.thumbnail}" class="place-card-image">
										<div>
											<div class="mt-2 mb-1 place-card-title">
												${x.name}
											</div>
										</div>
									</div>
								</div>
							</a>
                            `).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
            `).join('')
        }
        `
    })
}