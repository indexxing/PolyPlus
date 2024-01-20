var ItemID = window.location.pathname.split('/')[2]
var ItemWishlist;
var WishlistBtn;

setTimeout(function () {
    if (!(window.location.href.split('/')[4])) {return}
    chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
      var Settings = result.PolyPlus_Settings;
      let PurchaseBtn = document.querySelector('.btn.btn-outline-success')
      if (Settings.IRLPriceWithCurrencyOn === true){
        if (!(PurchaseBtn.getAttribute('disabled'))) {
          let Price = PurchaseBtn.getAttribute('data-price').replace(/,/g, '')
          let Span = document.createElement('span')
          Span.classList = 'text-muted polyplus-own-tag'
          Span.style.fontSize = '0.7rem'
          Span.style.fontWeight = 'normal'
          let IRL;
          let DISPLAY;
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
          PurchaseBtn.appendChild(Span)
        }
      }

      if (Settings.ItemWishlistOn === true && !(PurchaseBtn.getAttribute('disabled'))) {
        let DescriptionText = document.querySelector('.card-text')
        WishlistBtn = document.createElement('button')
        chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function(result){
          ItemWishlist = result.PolyPlus_ItemWishlist || [];

          if (Array.isArray(ItemWishlist) && ItemWishlist.includes(parseInt(ItemID))) {
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
            Wishlist()
          });

          DescriptionText.appendChild(document.createElement('br'))
          DescriptionText.appendChild(WishlistBtn)

          function Wishlist() {
            WishlistBtn.setAttribute('disabled', true)
            chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function(result){
              ItemWishlist = result.PolyPlus_ItemWishlist || [];

              let i = ItemWishlist.indexOf(parseInt(ItemID))
              console.log(i)
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
          }
        });
      }
    })
}, 100)

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