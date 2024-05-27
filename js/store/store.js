const ItemID = window.location.pathname.split('/')[2]
const UserID = JSON.parse(window.localStorage.getItem('p+account_info')).ID
const ItemGrid = document.getElementById('assets')
const Categories = document.getElementById('store-categories').children[0]

var Settings;
var Inventory = null;
var Utilities;

let EventItemsShown = false

chrome.storage.sync.get(['PolyPlus_Settings'], async function(result){
    Settings = result.PolyPlus_Settings || {};

    Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
    Utilities = Utilities.default

    if (Settings.IRLPriceWithCurrency.Enabled === true) {
        Array.from(ItemGrid.children).forEach(element => {
            LoadIRLPrices(element)
        });
    }

    if (Settings.StoreOwnTagOn === true) {
        Inventory = (await (await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory?type=hat&limit=100')).json()).inventory
        Inventory.concat(await (await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory?type=face&limit=100')).json()).inventory
        Inventory.concat(await (await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory?type=tool&limit=100')).json()).inventory
        console.log(Inventory)
        Array.from(ItemGrid.children).forEach(element => {
            LoadOwnedTags(element)
        });
    }

    if (Settings.EventItemsCatOn === true) {
        EventItems()
    }
});

const observer = new MutationObserver(async function (list){
    if (Settings.EventItemsCatOn === true) {
        if (document.getElementById('event-items-pagination') === null) {
            ItemGrid.classList.add('itemgrid')
            ItemGrid.parentElement.classList.remove('col-lg-9')
            document.getElementById('pagination').style.display = 'block'
            if (document.getElementById('storecat-eventitems') !== null) {
                document.getElementById('storecat-eventitems').checked = false
            }
        } else {
            ItemGrid.classList.remove('itemgrid')
            ItemGrid.parentElement.classList.add('col-lg-9')
            document.getElementById('pagination').style.display = 'none'
        }
    }
    for (const record of list) {
        for (const element of record.addedNodes) {
            if (element.tagName === "DIV" && element.classList.value === 'mb-3 itemCardCont') {
                if (Settings.IRLPriceWithCurrency.Enabled === true) {
                    LoadIRLPrices(element)
                }

                if (Settings.StoreOwnTagOn === true && Inventory !== null) {
                    LoadOwnedTags(element)
                }
            }
        }
        observer.observe(ItemGrid, {attributes: false,childList: true,subtree: false});
    }
});

observer.observe(ItemGrid, {attributes: false,childList: true,subtree: false});

async function LoadIRLPrices(element) {
    if (element.tagName != "DIV" || element.querySelector('small.text-primary')) {return}
    const Parent = element.getElementsByTagName('small')[1]
    if (Parent.innerText !== "") {
        const Span = document.createElement('span')
        Span.classList = 'text-muted polyplus-price-tag'
        Span.style = 'font-size: 0.7rem; font-weight: lighter;'
        const Price = Parent.innerText.split(' ')[1]
        const IRLResult = await Utilities.CalculateIRL(Price, Settings.IRLPriceWithCurrency.Currency)
        Span.innerText = "($" + IRLResult.result + " " + IRLResult.display + ")"
        Parent.appendChild(Span)
    }
}

function LoadOwnedTags(element) {
    let Item = CheckInventory(parseInt(element.querySelector('[href^="/store/"]').getAttribute('href').split('/')[2]))
    if (Item !== null) {
        const Tag = document.createElement('span')
        Tag.classList = `badge ${ (Item.asset.isLimited === false) ? 'bg-primary' : 'bg-warning' } polyplus-own-tag`
        Tag.style = 'position: absolute;font-size: 0.9rem;top: 0px;left: 0px;padding: 5.5px;border-top-left-radius: var(--bs-border-radius-lg)!important;border-top-right-radius: 0px;border-bottom-left-radius: 0px;font-size: 0.65rem;'
        Tag.innerHTML = "<i class='fas fa-star'></i>"
        element.getElementsByTagName('img')[0].parentElement.appendChild(Tag)
        if (Item.asset.isLimited === true) {
            Tag.setAttribute('data-bs-toggle', 'tooltip')
            Tag.setAttribute('data-bs-title', '#' + Item.serial)

            Utilities.InjectResource('registerTooltips')
        }
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

    let EventData = null
    let Events = []
    let Groups = []
    let Page = 0

    Selector.children[0].addEventListener('click', async function() {
        Array.from(Categories.children).forEach(selector => {
            selector.classList.remove('active')
        })
        Selector.classList.add('active')
        if (EventData === null) {
            EventData = await (await fetch('https://polyplus.vercel.app/data/eventItems.json')).json()

            Object.values(EventData.eventDetails).forEach((x, index) => {Events.push({
                ...x,
                items: EventData.items.filter((x) => x.event === Object.keys(EventData.eventDetails)[index]).sort((a, b) => a.id - b.id)
            })})
            while (Events.length > 0) {
                Groups.push(Events.splice(0, 5))
            }
        }

        ItemGrid.classList.remove('itemgrid')
        ItemGrid.innerHTML = `
        <div id="p+ei">
            ${
                Groups[Page].map((x, index) => `
                <div class="row px-2 px-lg-0" style="animation-delay: 0.24s;">
                    <div class="col">
                        <h6 class="dash-ctitle2">${x.date}</h6>
                        <h5 class="dash-ctitle">${x.name}</h5>
                    </div>
                    ${ (x.link !== undefined) ? `
                    <div class="col-auto d-flex align-items-center">
						<a class="text-muted" href="${x.link}">
							<span class="d-none d-lg-inline">${ (x.link.startsWith('https://polytoria.com/places/')) ? 'Event Place' : 'Blog Post' }</span>
							<i class="fas fa-angle-right ms-2"></i>
						</a>
					</div>
                    ` : '' }
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
                `).join('')
            }
        </div>

        <div class="d-flex justify-content-center mt-3">
            <nav id="event-items-pagination">
                <ul class="pagination">
                    <li class="page-item disabled">
                        <a class="page-link" href="#!" id="p+ei-pagination-first">«</a>
                    </li>
                    <li class="page-item disabled">
                        <a class="page-link" href="#!" id="p+ei-pagination-prev">‹</a>
                    </li>
                    <li class="page-item active">
                        <a class="page-link">
                            <span class="visually-hidden">Page</span>
                            <span id="p+ei-pagination-current">1</span>
                        </a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#!" id="p+ei-pagination-next">›</a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#!" id="p+ei-pagination-last">»</a>
                    </li>
                </ul>
            </nav>
        </div>
        `

        const Container = document.getElementById('p+ei')
        const Pagination = document.getElementById('event-items-pagination')
        const First = document.getElementById('p+ei-pagination-first')
        const Prev = document.getElementById('p+ei-pagination-prev')
        const Current = document.getElementById('p+ei-pagination-current')
        const Next = document.getElementById('p+ei-pagination-next')
        const Last = document.getElementById('p+ei-pagination-last')

        if (Page > 0) {
            Prev.parentElement.classList.remove('disabled')
            First.parentElement.classList.remove('disabled')
        } else {
            Prev.parentElement.classList.add('disabled')
            First.parentElement.classList.add('disabled')
        }
        if (Page < Groups.length-1) {
            Next.parentElement.classList.remove('disabled')
            Last.parentElement.classList.remove('disabled')
        } else {
            Next.parentElement.classList.add('disabled')
            Last.parentElement.classList.add('disabled')
        }

        First.addEventListener('click', function() {
            if (Page > 0) {
                Page = 0
                UpdateEventItems()
            }
        })
      
        Prev.addEventListener('click', function() {
            if (Page > 0) {
                Page--
                UpdateEventItems()
            }
        })
    
        Next.addEventListener('click', function() {
            if (Page < Groups.length-1) {
                Page++
                UpdateEventItems()
            }
        })

        Last.addEventListener('click', function() {
            if (Page < Groups.length-1) {
                Page = Groups.length-1
                UpdateEventItems()
            }
        })

        const UpdateEventItems = function() {
            Current.innerText = Page+1
            Container.innerHTML = Groups[Page].map((x, index) => `
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
    
            if (Page > 0) {
                Prev.parentElement.classList.remove('disabled')
                First.parentElement.classList.remove('disabled')
            } else {
                Prev.parentElement.classList.add('disabled')
                First.parentElement.classList.add('disabled')
            }
            if (Page < Groups.length-1) {
                Next.parentElement.classList.remove('disabled')
                Last.parentElement.classList.remove('disabled')
            } else {
                Next.parentElement.classList.add('disabled')
                Last.parentElement.classList.add('disabled')
            }
        }
    })
}