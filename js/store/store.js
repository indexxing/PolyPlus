const UserID = JSON.parse(window.localStorage.getItem('account_info')).ID

var Settings;

var Utilities;
(async () => {
    Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
    Utilities = Utilities.default

    Update()
})();

const ItemGrid = document.getElementById('assets')
var Inventory = null;

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

}    })