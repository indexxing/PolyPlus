setTimeout(function() {}, 100);
let URLSplit = window.location.pathname.split('/');
let UserID = URLSplit[2];
var Settings;
var BestFriends;
var FavoriteBtn;
if (UserID) {
    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        Settings = result.PolyPlus_Settings;

        if (Settings.IRLPriceWithCurrencyOn === true) {
            HandleIRLPrice()
        }
    
        if (Settings.BestFriendsOn === true) {
            HandleBestFriends()
        }

        if (1 === 1) {
            HandleOufitCost()
        }
    });
    
    // Update the local pinned games whenever the 'PinnedGames' array is updated
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

    const UserID = window.location.pathname.split('/')[2]
    const DefaultAvatar = {
        "useCharacter": true,
        "items": [],
        "shirt": null,
        "pants": null,
        "tool": null,
        "headColor": "#111111",
        "torsoColor": "#111111",
        "leftArmColor": "#111111",
        "rightArmColor": "#111111",
        "leftLegColor": "#111111",
        "rightLegColor": "#111111",
        "face": "https://c0.ptacdn.com/static/3dview/DefaultFace.png"
    }
    const Avatar = structuredClone(DefaultAvatar)

    const Original = document.querySelector('.container .dropdown-item:nth-child(2)')
    const Clone = Original.cloneNode(true)
    Clone.classList.remove('text-danger')
    Clone.classList.add('text-primary')
    Clone.href = '#'
    Clone.innerHTML = `
    <i class="fa-duotone fa-book"></i>
    Copy 3D Avatar URL 
    `
    Clone.addEventListener('click', function(){
        fetch('https://api.polytoria.com/v1/users/:id/avatar'.replace(':id', UserID))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network not ok')
                }
                return response.json()
            })
            .then(data => {
                data.assets.forEach(item => {
                    switch(item.type) {
                        case 'hat':
                            Avatar.items.push(item.path)
                            break
                        case 'tool':
                            Avatar.tool = item.path
                            break
                        case 'face':
                            Avatar.face = item.path
                            break
                        case 'shirt':
                            Avatar.shirt = item.path
                            break
                        case 'pants':
                            Avatar.pants = item.path
                            break
                    }
                });

                Avatar.headColor = '#' + data.colors.head || '#cdcdcd'
                Avatar.torsoColor = '#' + data.colors.torso || '#cdcdcd'
                Avatar.leftArmColor = '#' + data.colors.leftArm || '#cdcdcd'
                Avatar.rightArmColor = '#' + data.colors.rightArm || '#cdcdcd'
                Avatar.leftLegColor = '#' + data.colors.leftLeg || '#cdcdcd'
                Avatar.rightLegColor = '#' + data.colors.rightLeg || '#cdcdcd'
                
                const URL = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)))
                console.log('URL: ', URL)
                navigator.clipboard.writeText(URL)
                const SwalCopied = document.createElement('script')
                SwalCopied.innerHTML = `
                window.Swal.fire({title: "Copied", icon: "success", html: "The 3D avatar URL has been copied to clipboard!<br><a href='${URL}' target='_blank'>Preview it here!</a>"})
                `
                document.body.prepend(SwalCopied)
                SwalCopied.remove()
            })
            .catch(error => {
                console.log(error)
            });
    });

    Original.parentElement.appendChild(Clone)
}

function HandleIRLPrice() {
    const NetWorthElement = document.getElementsByClassName('float-end text-success')[0];
    const NetWorth = parseInt(NetWorthElement.innerText.replace(/,/g, ''));
    let IRL;
    let DISPLAY;
    switch (Settings.IRLPriceWithCurrencyCurrency) {
        case 0:
            IRL = (NetWorth * 0.0099).toFixed(2)
            DISPLAY = 'USD'
            break
        case 1:
            IRL = (NetWorth * 0.009).toFixed(2)
            DISPLAY = 'EUR'
            break
        case 2:
            IRL = (NetWorth * 0.0131).toFixed(2)
            DISPLAY = 'CAD'
            break
        case 3:
            IRL = (NetWorth * 0.0077).toFixed(2)
            DISPLAY = 'GBP'
            break
        case 4:
            IRL = (NetWorth * 0.1691).toFixed(2)
            DISPLAY = 'MXN'
            break
        case 5:
            IRL = (NetWorth * 0.0144).toFixed(2)
            DISPLAY = 'AUD'
            break
        case 6:
            IRL = (NetWorth *  0.2338).toFixed(2)
            DISPLAY = 'TRY'
            break
    }
    NetWorthElement.innerText = NetWorthElement.innerText + " ($" + IRL + " " + DISPLAY + ")"
}

function HandleBestFriends() {
    chrome.storage.sync.get(['PolyPlus_BestFriends'], function(result){
        BestFriends = result.PolyPlus_BestFriends || [];
    
        console.log('Best friends is enabled!')
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
            if (UserID === JSON.parse(window.localStorage.getItem('account_info')).ID) {
                return
            }
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

        function ClearFavs(){
            chrome.storage.sync.set({ 'PolyPlus': {"PinnedGames": pinnedGames, "BestFriends": []}, arrayOrder: true }, function() {
                console.log('BestFriends saved successfully!');
                setTimeout(function() {
                    btn.removeAttribute('disabled')
                }, 1500)
            });
        }

        function ClearFavsOld(){
            chrome.storage.sync.set({ 'PolyPlus': {"PinnedGames": pinnedGames, "BestFriends": []}, arrayOrder: true }, function() {
                console.log('BestFriends saved successfully!');
                setTimeout(function() {
                    btn.removeAttribute('disabled')
                }, 1500)
            });
        }
    });
}

async function HandleOufitCost() {
    const AvatarRow = document.getElementsByClassName('d-flex flex-row flex-nowrap overflow-x-scroll px-3 px-lg-0 mb-2 mb-lg-0')[0]

    let TotalCost = 0
    let Limiteds = 0
    let Exclusives = 0
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
                    Limiteds += 1
                    Price = data.averagePrice
                } else if (data.sales === 0) {
                    Exclusives += 1
                    Price = 0
                }

                TotalCost += Price
            })
            .catch(error => {console.log(error)});
    }

    const TotalCostText = document.createElement('small')
    TotalCostText.classList = 'text-muted'
    TotalCostText.style.padding = '20px'
    TotalCostText.innerHTML = `${ (Limiteds > 0 || Exclusives > 0) ? '~' : '' }<i class="pi pi-brick me-2"></i> ${TotalCost.toLocaleString()}${ (Limiteds > 0) ? ` (has ${Limiteds} limiteds)` : '' }${ (Exclusives > 0) ? ` (has ${Exclusives} exclusives)` : '' }`
    AvatarRow.parentElement.parentElement.prepend(TotalCostText)
    AvatarRow.parentElement.style.marginTop = '10px'
    console.log(TotalCostText)
}