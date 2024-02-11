const ItemID = window.location.pathname.split('/')[2]

var Utilities;

var Settings;
var ItemWishlist;
var PurchaseBtn;
var WishlistBtn;
var ItemOwned;

(async () => {
  if (!(window.location.href.split('/')[4])) {return}

  Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
  Utilities = Utilities.default

  chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
    Settings = result.PolyPlus_Settings || {}
    PurchaseBtn = document.querySelector('.btn#purchase-button')
    ItemOwned = (PurchaseBtn.innerText === ' Item owned' || document.querySelector('.btn[onclick="sellItem()"]') !== null)

    if (Settings.IRLPriceWithCurrencyOn === true){ IRLPrice() }

    if (Settings.ItemWishlistOn === true) {
      HandleItemWishlist()
    }
  })
})();

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if ('PolyPlus_ItemWishlist' in changes) {
    chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function(result) {
      ItemWishlist = result.PolyPlus_ItemWishlist || [];

      if (Array.isArray(ItemWishlist) && ItemWishlist.includes(parseInt(ItemID))) {
        WishlistBtn.classList = 'btn btn-danger btn-sm'
        WishlistBtn.innerHTML = `
        <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Un-Wishlist Item
        `
      } else {
        if (!(ItemWishlist.length === 25)) {
          WishlistBtn.removeAttribute('disabled')
          WishlistBtn.classList = 'btn btn-primary btn-sm'
          WishlistBtn.innerHTML = `
          <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Wishlist Item
          `
        } else {
          WishlistBtn.setAttribute('disabled', true)
          WishlistBtn.classList = 'btn btn-primary btn-sm'
          WishlistBtn.innerHTML = `
          <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Wishlist Item
          `
        }
      }
    });
  }
});

async function IRLPrice() {
  if (!(PurchaseBtn.getAttribute('disabled'))) {
    const Price = PurchaseBtn.getAttribute('data-price')
    const Span = document.createElement('span')
    Span.classList = 'text-muted polyplus-own-tag'
    Span.style.fontSize = '0.7rem'
    Span.style.fontWeight = 'normal'
    const Result = await Utilities.CalculateIRL(Price, Settings.IRLPriceWithCurrencyCurrency)
    Span.innerText = "($" + Result.bricks + " " + Result.display + ")"
    PurchaseBtn.appendChild(Span)
  }
}

function HandleItemWishlist() {
  const DescriptionText = document.querySelector('.mcard .card-body:has(p)')
  WishlistBtn = document.createElement('button')
  chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function(result){
    ItemWishlist = result.PolyPlus_ItemWishlist || [];

    if (ItemOwned === true) {
      if (ItemWishlist.includes(parseInt(ItemID))) {
        ItemWishlist.splice(ItemWishlist.indexOf(parseInt(ItemID)), 1)
        chrome.storage.sync.set({'PolyPlus_ItemWishlist': ItemWishlist, arrayOrder: true});
      }
      return
    }
    if (ItemOwned === true) {
      return
    } else if (ItemOwned === true && ItemWishlist.includes(parseInt(ItemID))) {
      ItemWishlist.splice(ItemWishlist.indexOf(parseInt(ItemID)), 1)
      return
    }

    if (ItemWishlist.includes(parseInt(ItemID))) {
      WishlistBtn.classList = 'btn btn-danger btn-sm'
      WishlistBtn.innerHTML = `
      <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Un-Wishlist Item
      `
    } else {
      WishlistBtn.classList = 'btn btn-primary btn-sm'
      WishlistBtn.innerHTML = `
      <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Wishlist Item
      `
    }

    WishlistBtn.addEventListener('click', function(){
      WishlistBtn.setAttribute('disabled', true)
      chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function(result){
        ItemWishlist = result.PolyPlus_ItemWishlist || [];

        let i = ItemWishlist.indexOf(parseInt(ItemID))
        if (i !== -1) {
          ItemWishlist.splice(i, 1)
          WishlistBtn.classList = 'btn btn-primary btn-sm'
          WishlistBtn.innerHTML = `
          <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Wishlist Item
          `
        } else {
          ItemWishlist.push(parseInt(ItemID))
          WishlistBtn.classList = 'btn btn-danger btn-sm'
          WishlistBtn.innerHTML = `
          <i class="fa fa-star" style="margin-right: 2.5px;"></i>  Un-Wishlist Item
          `
        }

        chrome.storage.sync.set({'PolyPlus_ItemWishlist': ItemWishlist, arrayOrder: true}, function() {
          setTimeout(function() {
            WishlistBtn.removeAttribute('disabled')
          }, 1250)
        });
      });
    });

    DescriptionText.appendChild(document.createElement('br'))
    DescriptionText.appendChild(WishlistBtn)
  });
}