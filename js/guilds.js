const StoreItems = document.getElementById('store-items')

var Settings;
let Utilities;

chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
    Settings = result.PolyPlus_Settings

    if (Settings.IRLPriceWithCurrencyOn === true) {
        (async () => {
            Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
            Utilities = Utilities.default

            for (let item of Array.from(StoreItems.children)) {
                IRLPrice(item)
            }

            const PreviousPage = document.querySelector('#store-prev a')
            const NextPage = document.querySelector('#store-next a')
            //PreviousPage.addEventListener('click', IRLPrice)
            //NextPage.addEventListener('click', IRLPrice)
        })();
    }
});

/*
async function IRLPrice() {
    Array.from(document.getElementsByClassName('polyplus-price-tag')).forEach(tag => {tag.remove()})
    for (let item of Array.from(StoreItems.children)) {
        const Price = item.getElementsByClassName('text-success')[0]
        if (Price !== undefined && Price.innerText !== "Free") {
            const IRLResult = await Utilities.CalculateIRL(Price.innerText, Settings.IRLPriceWithCurrencyCurrency)
        
            let Span = document.createElement('span')
            Span.classList = 'text-muted polyplus-price-tag'
            Span.style.fontSize = '0.7rem'
            Span.innerText = " ($" + IRLResult.result + " " + IRLResult.display + ")"
            Price.appendChild(Span)
        }
    }
}
*/

async function IRLPrice(item) {
    const Price = item.getElementsByClassName('text-success')[0]
    if (Price !== undefined && Price.innerText !== "Free") {
        const IRLResult = await Utilities.CalculateIRL(Price.innerText, Settings.IRLPriceWithCurrencyCurrency)
    
        let Span = document.createElement('span')
        Span.classList = 'text-muted polyplus-price-tag'
        Span.style.fontSize = '0.7rem'
        Span.innerText = " ($" + IRLResult.result + " " + IRLResult.display + ")"
        Price.appendChild(Span)
    }
}

const observer = new MutationObserver(async function (list){
    for (const record of list) {
        for (const element of record.addedNodes) {
            if (element.tagName === "DIV" && element.classList.value === 'col-auto mb-3') {
                if (Settings.IRLPriceWithCurrencyOn === true) {
                    IRLPrice(element)
                }
            }
        }
        observer.observe(StoreItems, {attributes: false,childList: true,subtree: false});
    }
});

observer.observe(StoreItems, {attributes: false,childList: true,subtree: false});