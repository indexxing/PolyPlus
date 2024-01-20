setTimeout(function () {}, 100)
var Settings = {IRLPriceWithCurrencyOn: true, IRLPriceWithCurrencyCurrency: 0, StoreOwnTagOn: true};
var UserID = JSON.parse(window.localStorage.getItem('account_info')).ID
var ItemGrid = document.getElementById('assets')
var Inventory = [];
chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
    Settings = result.PolyPlus_Settings;
});

function Update() {
    if (Settings.IRLPriceWithCurrencyOn === true) {
        Array.from(ItemGrid.children).forEach(element => {LoadIRLPrices(element)});
    }
}

const observer = new MutationObserver(async function (list){
    for (const record of list) {
        console.log('record')
        for (const element of record.addedNodes) {
            console.log('element', element.tagName, element.classList)
            if (element.tagName === "DIV" && element.classList.value === 'mb-3 itemCardCont') {
                if (Settings.IRLPriceWithCurrencyOn === true) {LoadIRLPrices(element)}
                if (Settings.StoreOwnTagOn === true) {
                    if (Inventory.length === 0) {
                        await fetch("https://api.polytoria.com/v1/users/:id/inventory".replace(':id', UserID))
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network not ok')
                                }
                                return response.json()
                            })
                            .then(data => {
                                Inventory = data.data;
                                LoadOwnedTags(element)
                                return
                            })
                            .catch(error => {
                                console.log(error)
                            });
                    } else {
                        LoadOwnedTags(element)
                    }
                }
            }
        }
        observer.observe(ItemGrid, {attributes: false,childList: true,subtree: false});
    }
});

observer.observe(ItemGrid, {attributes: false,childList: true,subtree: false});

function LoadIRLPrices(element) {
    if (element.tagName != "DIV") {return}
    if (element.querySelector('small.text-primary')) {return}
    let Parent = element.getElementsByTagName('small')[1]
    if (Parent.innerText === "") {
        return
    }
    let Span = document.createElement('span')
    Span.classList = 'text-muted polyplus-price-tag'
    Span.style.fontSize = '0.7rem'
    let Price = parseInt(Parent.innerText.replace(/,/g, ''))
    var IRL;
    var DISPLAY;
    switch (Settings.IRLPriceWithCurrencyCurrency) {
        case 0:
          IRL = (Price * 0.0099).toFixed(2)
          DISPLAY = 'USD'
          break
        case 1:
          IRL = (Price * 0.009).toFixed(2)
          DISPLAY = 'EUR'
          break
        case 2:
          IRL = (Price * 0.0131).toFixed(2)
          DISPLAY = 'CAD'
          break
        case 3:
          IRL = (Price * 0.0077).toFixed(2)
          DISPLAY = 'GBP'
          break
        case 4:
          IRL = (Price * 0.1691).toFixed(2)
          DISPLAY = 'MXN'
          break
        case 5:
          IRL = (Price * 0.0144).toFixed(2)
          DISPLAY = 'AUD'
          break
        case 6:
          IRL = (Price *  0.2338).toFixed(2)
          DISPLAY = 'TRY'
          break
    }
    Span.innerText = "($" + IRL + " " + DISPLAY + ")"
    Parent.appendChild(Span)
}

function LoadOwnedTags(element) {
    let Item = CheckInventory(parseInt(element.querySelector('[href^="/store/"]').getAttribute('href').split('/')[2]))
    console.log(Item, Item.id)
    if (Item.id) {
        var Tag = document.createElement('span')
        Tag.classList = 'badge bg-primary polyplus-own-tag'
        Tag.setAttribute('style', 'position: absolute;font-size: 0.7rem;top: 0px;left: 0px;padding: 5.5px;border-top-left-radius: var(--bs-border-radius-lg)!important;border-top-right-radius: 0px;border-bottom-left-radius: 0px;font-size: 0.65rem;')
        if (Item.asset.isLimited === false) {
            Tag.innerText = "owned"
        } else {
            Tag.innerHTML = 'owned<br><span class="text-muted" style="font-size: 0.65rem;">#' + Item.serial
        }
        element.querySelector('img').parentElement.appendChild(Tag)
    }
}

function CheckInventory(id) {
    let Item = {}
    Inventory.forEach(element => {
        if (element.asset.id === id) {
            Item = element
        }
    })
    return Item
}