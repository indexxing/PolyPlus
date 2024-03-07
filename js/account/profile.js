const UserID = window.location.pathname.split('/')[2];
const AvatarRow = document.getElementsByClassName('d-flex flex-row flex-nowrap overflow-x-scroll px-3 px-lg-0 mb-2 mb-lg-0')[0]

var Settings;
var BestFriends;
let FavoriteBtn;
let CalculateButton;

let Utilities;

if (UserID && !isNaN(UserID)) {
    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        Settings = result.PolyPlus_Settings || {}

        if (Settings.IRLPriceWithCurrencyOn === true) {
            (async () => {
                Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
                Utilities = Utilities.default

                IRLPrice()
            })();
        }
    
        if (Settings.BestFriendsOn === true) {
            BestFriends()
        }

        if (Settings.OutfitCostOn === true) {
            CalculateButton = document.createElement('button')
            CalculateButton.classList = 'btn btn-warning btn-sm'
            CalculateButton.innerText = 'Calculate Avatar Cost'
            AvatarRow.parentElement.parentElement.prepend(CalculateButton)
            AvatarRow.parentElement.style.marginTop = '10px'
            
            CalculateButton.addEventListener('click', function(){
                OutfitCost()
            });
        }
    });

    const AvatarIFrame = document.querySelector('[src^="/ptstatic"]')
    const DropdownMenu = document.getElementsByClassName('dropdown-menu dropdown-menu-right')[0]

    const CopyItem = document.createElement('a')
    CopyItem.classList = 'dropdown-item text-primary'
    CopyItem.href = '#'
    CopyItem.innerHTML = `
    <i class="fa-duotone fa-book"></i>
    Copy 3D Avatar URL 
    `
    DropdownMenu.appendChild(CopyItem)

    CopyItem.addEventListener('click', function(){
        navigator.clipboard.writeText(AvatarIFrame.src)
            .then(() => {
                alert('Successfully copied 3D avatar URL!')
            })
            .catch(() => {
                alert('Failure to copy 3D avatar URL.')
            });
    });

    const ShareItem = document.createElement('a')
    ShareItem.classList = 'dropdown-item text-warning'
    ShareItem.href = '#'
    ShareItem.innerHTML = `
    <i class="fa-duotone fa-book"></i>
    Share your 3D Avatar URL!
    `
    DropdownMenu.appendChild(ShareItem)

    ShareItem.addEventListener('click', function(){
        navigator.clipboard.writeText("Hey! Look at my Polytoria avatar in 3D [here](" + AvatarIFrame.src + ")!")
            .then(() => {
                alert('Successfully copied sharable 3D avatar URL!')
            })
            .catch(() => {
                alert('Failure to copy sharable 3D avatar URL.')
            });
    });
} else if (UserID && UserID[0] === "@") {
    const Username = window.location.pathname.split('/')[2].substring(1)

    let Reference = new URLSearchParams(new URL(window.location.href).search).get('ref')
    if (Reference === null) {
        Reference = ""
    }

    fetch("https://api.polytoria.com/v1/users/find?username=" + Username)
        .then(response => {
            if (!response.ok) {
                window.location.href = window.location.origin + decodeURIComponent(Reference)
            } else {
                return response.json()
            }
        })
        .then(data => {
            window.location.href = "https://polytoria.com/users/" + data.id
        })
        .catch(error => {
            console.log("An error occurred:", error);
        });
}

async function IRLPrice() {
    const NetWorthElement = document.getElementsByClassName('float-end text-success')[0];
    //const NetWorth = parseInt(NetWorthElement.innerText.replace(/,/g, ''));
    const IRLResult = await Utilities.CalculateIRL(NetWorthElement.innerText, Settings.IRLPriceWithCurrencyCurrency)
    NetWorthElement.innerText = NetWorthElement.innerText + " ($" + IRLResult.result + " " + IRLResult.display + ")"
}

function BestFriends() {
    chrome.storage.sync.get(['PolyPlus_BestFriends'], function(result){
        BestFriends = result.PolyPlus_BestFriends || [];
    
        FavoriteBtn = document.createElement('button');
        FavoriteBtn.classList = 'btn btn-warning btn-sm ml-2';
        if (!(BestFriends.length === 7)) {
            if (Array.isArray(BestFriends) && BestFriends.includes(parseInt(UserID))) {
                FavoriteBtn.innerText = 'Remove Best Friend Status';
            } else {
                FavoriteBtn.innerText = 'Best Friend';
            }
        } else {
            FavoriteBtn.innerText = 'Remove Best Friend Status (max 7/7)'
        }
        if (UserID !== JSON.parse(window.localStorage.getItem('account_info')).ID && document.getElementById('add-friend-button').classList.contains('btn-success') === false) {
            FavoriteBtn.addEventListener('click', function() {
                Fav(UserID, FavoriteBtn);
            });
        } else {
            FavoriteBtn.style.display = 'none'
        }
        document.querySelectorAll('.section-title.px-3.px-lg-0.mt-3')[0].appendChild(FavoriteBtn);

        function Fav(UserID, btn) {
            if (UserID === JSON.parse(window.localStorage.getItem('account_info')).ID) { return }
            btn.setAttribute('disabled', 'true')

            chrome.storage.sync.get(['PolyPlus_BestFriends'], function(result) {
                const BestFriends = result.PolyPlus_BestFriends || [];
                const index = BestFriends.indexOf(parseInt(UserID));

                if (index !== -1) {
                    // Number exists, remove it
                    BestFriends.splice(index, 1);
                    btn.innerText = "Best Friend"
                    console.log('Number', parseInt(UserID), 'removed from BestFriends');
                } else {
                    // Number doesn't exist, add it
                    BestFriends.push(parseInt(UserID));
                    btn.innerText = "Remove Best Friend Status"
                    console.log('Number', parseInt(UserID), 'added to BestFriends');
                }
                
                chrome.storage.sync.set({ 'PolyPlus_BestFriends': BestFriends, arrayOrder: true }, function() {
                    console.log('BestFriends saved successfully!');
                    setTimeout(function() {
                        btn.removeAttribute('disabled')
                    }, 1500)
                });
            });
        }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if ('PolyPlus_BestFriends' in changes) {
            chrome.storage.sync.get(['PolyPlus_BestFriends'], function(result) {
                BestFriends = result.PolyPlus_BestFriends || [];
    
                if (!(BestFriends.length === 7)) {
                    if (Array.isArray(BestFriends) && BestFriends.includes(parseInt(UserID))) {
                        FavoriteBtn.innerText = 'Remove Best Friend Status'
                    } else {
                        FavoriteBtn.innerText = 'Best Friend'
                    }
                } else {
                    FavoriteBtn.innerText = 'Remove Best Friend Status (max 7/7)'
                }
            });
        }
    });
    
    function ClearBestFriends(){
        chrome.storage.sync.set({ 'PolyPlus_BestFriends': {"BestFriends": []}, arrayOrder: true }, function() {
            console.log('BestFriends saved successfully!');
            setTimeout(function() {
                btn.removeAttribute('disabled')
            }, 1500)
        });
    }
}

async function OutfitCost() {
    const AvatarCost = {
        Total: 0,
        Limiteds: 0,
        Exclusives: 0
    }
    for (let item of AvatarRow.children) {
        const ItemID = item.getElementsByTagName('a')[0].href.split('/')[4]
        await fetch('https://api.polytoria.com/v1/store/'+ItemID)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network not ok')
                }
                return response.json()
            })
            .then(data => {
                let Price = data.price
                if (data.isLimited === true) {
                    AvatarCost.Limiteds += 1
                    Price = data.averagePrice
                } else if (data.sales === 0) {
                    AvatarCost.Exclusives += 1
                    Price = 0
                }

                AvatarCost.Total += Price
            })
            .catch(error => {console.log(error)});
    }

    const TotalCostText = document.createElement('small')
    TotalCostText.classList = 'text-muted'
    TotalCostText.style.padding = '20px'
    TotalCostText.innerHTML = `${ (AvatarCost.Limiteds > 0 || AvatarCost.Exclusives > 0) ? '~' : '' }<i class="pi pi-brick me-2"></i> ${AvatarCost.Total.toLocaleString()}${ (AvatarCost.Limiteds > 0) ? ` (has ${AvatarCost.Limiteds} limiteds)` : '' }${ (AvatarCost.Exclusives > 0) ? ` (has ${AvatarCost.Exclusives} exclusives)` : '' }`
    AvatarRow.parentElement.parentElement.prepend(TotalCostText)
    AvatarRow.parentElement.style.marginTop = '10px'
    CalculateButton.remove();
}