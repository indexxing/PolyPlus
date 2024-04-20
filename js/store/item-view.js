const ItemID = window.location.pathname.split('/')[2]
const ItemType = document.querySelector('.col-12 .badge').innerHTML
const MeshTypes = [
  "hat",
  "hair",
  "head attachment",
  "face accessory",
  "neck accessory",
  "head cover",
  "back accessory",
  "shoulder accessory",
  "tool"
]

var Utilities;

var Settings;
var ItemWishlist;
var PurchaseBtn;
var WishlistBtn;
var ItemOwned;

(async () => {
  if (!(window.location.href.split('/')[4]) || ItemType === "achievement") {return}

  Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
  Utilities = Utilities.default

  chrome.storage.sync.get(['PolyPlus_Settings'], async function(result){
    Settings = result.PolyPlus_Settings || {}

    PurchaseBtn = document.querySelector('.btn[onclick^="buy"]')
    if (PurchaseBtn === null) {
      PurchaseBtn = document.querySelector('.btn#purchase-button')
    }
    ItemOwned = (PurchaseBtn.innerText === ' Item owned' || document.querySelector('.btn[onclick="sellItem()"]') !== null)

    if (Settings.IRLPriceWithCurrencyOn === true && ItemOwned === false) {
      IRLPrice()
    }

    if (Settings.ItemWishlistOn === true) {
      HandleItemWishlist()
    }

    if (Settings.TryOnItemsOn === true) {
      TryOnItems()
    }

    if (Settings.ReplaceItemSalesOn === true) {
      const Sales = document.querySelectorAll('.col:has(h6):has(h3.small)')[2]
      if (Sales.children[1].innerText === '0') {
        const Owners = (await (await fetch('https://api.polytoria.com/v1/store/' + ItemID + '/owners?limit=1')).json()).total

        Sales.children[0].innerText = 'Owners'
        Sales.children[1].innerText = Owners.toLocaleString()
      }
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
  const Price = PurchaseBtn.getAttribute('data-price')
  const Span = document.createElement('span')
  Span.classList = 'text-muted polyplus-own-tag'
  Span.style.fontSize = '0.7rem'
  Span.style.fontWeight = 'normal'
  const IRLResult = await Utilities.CalculateIRL(Price, Settings.IRLPriceWithCurrencyCurrency)
  Span.innerText = "($" + IRLResult.result + " " + IRLResult.display + ")"
  PurchaseBtn.appendChild(Span)
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

function TryOnItems() {
  const Avatar = {
    "useCharacter": true,
    "items": [],
    "shirt": "https://c0.ptacdn.com/assets/uWrrnFGwgNN5W171vqYTWY7E639rKiXK.png",
    "pants": "https://c0.ptacdn.com/assets/HD6TFdXD8CaflRNmd84VCNyNsmTB0SH3.png",
    "headColor": "#e0e0e0",
    "torsoColor": "#e0e0e0",
    "leftArmColor": "#e0e0e0",
    "rightArmColor": "#e0e0e0",
    "leftLegColor": "#e0e0e0",
    "rightLegColor": "#e0e0e0"
  }
  
  let AssetType = document.querySelector('.px-4.px-lg-0.text-muted.text-uppercase.mb-3 .badge').innerHTML
  console.log(AssetType, MeshTypes[AssetType], MeshTypes[AssetType.toLowerCase()])
  /*
  if (HatTypes[AssetType.toLowerCase()] !== undefined) {
    AssetType = "hat"
  }
  */
  
  const ItemThumbnail = document.getElementsByClassName('store-thumbnail')[0]
  const IFrame = document.getElementsByClassName('store-thumbnail-3d')[0]
  const TryIFrame = document.createElement('iframe')
  TryIFrame.style = 'width: 100%; height: auto; aspect-ratio: 1; border-radius: 20px;'
  
  const TryOnBtn = document.createElement('button')
  TryOnBtn.classList = 'btn btn-outline-warning'
  TryOnBtn.style = 'position: absolute; bottom: 60px; right: 10px;'
  TryOnBtn.innerHTML = '<i class="fa-duotone fa-vial"></i>'
  TryOnBtn.addEventListener('click', function (){
    TryOnModal.showModal()
  });
  
  let TryOnModal = document.createElement('dialog')
  TryOnModal.classList = 'polyplus-modal'
  TryOnModal.setAttribute('style', 'width: 450px; border: 1px solid #484848; background-color: #181818; border-radius: 20px; overflow: hidden;')
  TryOnModal.innerHTML = `
  <div class="text-muted mb-2" style="font-size: 0.8rem;">
    <h5 class="mb-0" style="color: #fff;">Preview</h5>
    Try on this item!
  </div>
  <div class="modal-body">
    <button class="btn btn-primary w-100 mx-auto" onclick="this.parentElement.parentElement.close();">Close</button>
  </div>
  `
  
  document.body.prepend(TryOnModal)
  ItemThumbnail.parentElement.appendChild(TryOnBtn)
  TryOnModal.children[1].prepend(TryIFrame)
  
  fetch("https://api.polytoria.com/v1/users/:id/avatar".replace(':id', JSON.parse(window.localStorage.getItem('account_info')).ID))
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      data.assets.forEach(item => {
        switch (item.type) {
          case 'hat':
            Avatar.items[Avatar.items.length] = item.path || ''
            break
          case 'face':
            Avatar.face = item.path || ''
            break
          case 'tool':
            Avatar.tool = item.path || ''
            break
          case 'shirt':
            Avatar.shirt = item.path || ''
            break
          case 'pants':
            Avatar.pants = item.path || ''
            break
        }
      });

      Avatar.headColor = "#" + data.colors.head
      Avatar.torsoColor = "#" + data.colors.torso
      Avatar.leftArmColor = "#" + data.colors.leftArm
      Avatar.rightArmColor = "#" + data.colors.rightArm
      Avatar.leftLegColor = "#" + data.colors.leftLeg
      Avatar.rightLegColor = "#" + data.colors.rightLeg

      if (MeshTypes.indexOf(AssetType.toLowerCase()) !== -1) {
        fetch("https://api.polytoria.com/v1/assets/serve-mesh/:id".replace(':id', window.location.pathname.split('/')[2]))
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (AssetType === 'tool') {
              Avatar.tool = data.url
            } else {
              Avatar.items.push(data.url)
            }

            console.log(Avatar)
            TryIFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)))
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
      } else {
        fetch("https://api.polytoria.com/v1/assets/serve/:id/Asset".replace(':id', window.location.pathname.split('/')[2]))
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            switch (AssetType) {
                case 'shirt':
                    Avatar.shirt = data.url
                    break
                case 'pants':
                    Avatar.pants = data.url
                    break
                case 'face':
                    Avatar.face = data.url
                    break
            }

            TryIFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)))
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}