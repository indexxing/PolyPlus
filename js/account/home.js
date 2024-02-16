/*
this file needs a rewrite by me lol
*/

var Settings;
var PinnedGamesData
var BestFriendsData

chrome.storage.sync.get(['PolyPlus_Settings'], async function(result) {
    Settings = result.PolyPlus_Settings || {}

    if (Settings.IRLPriceWithCurrencyOn === true) {
        IRLPrice()
    }

    if (Settings.PinnedGamesOn === true || Settings.BestFriendsOn === true) {
        Update()
    }
});

let ContainerElement = `
<div class="card-body p-0 m-1 scrollFadeContainer d-flex"></div>`;
let GameContainerElement = `
<div class="scrollFade card me-2 place-card force-desktop text-center mb-2" style="opacity: 1;">
    <div class="card-body">
        <div class="ratings-header">
            <img src=":Thumbnail" class="place-card-image" style="position: relative;">
            <div style="position: absolute;background: linear-gradient(to bottom, black, transparent, transparent, transparent);width: 100%;height: 100%;top: 0;left: 0;border-radius: 10px;padding-top: 5px;color: gray;font-size: 0.8rem;">
                <span>
                    <i id="thumbup-icn" class="thumb-icon far fa-thumbs-up"></i>
                    :Likes
                </span>
                |
                <span>
                    <i id="thumbdown-icn" class="thumb-icon far fa-thumbs-down"></i>
                    :Dislikes
                </span>
            </div>
        </div>
        <div>
            <div class="mt-2 mb-1 place-card-title">
                :GameName
            </div>
        </div>
    </div>
</div>
`;
let TitleElement = `
<div class="col">
    <h6 class="dash-ctitle2">Jump right back into your favorite games</h6>
    <h5 class="dash-ctitle">Pinned Games</h5>
</div>`;
var FriendContainer = document.querySelector('.card:has(.friendsPopup) .card-body')

let NewContainer = document.createElement('div');
NewContainer.style.display = 'none'
NewContainer.classList = 'card card-dash mcard';
NewContainer.style.animationDelay = '0.18s';
NewContainer.innerHTML = ContainerElement;

let NewTitle = document.createElement('div');
NewTitle.style.display = 'none'
NewTitle.classList = 'row reqFadeAnim px-2 px-lg-0';
NewTitle.innerHTML = TitleElement;

let BestFriendsContainer = document.createElement('div')
BestFriendsContainer.classList = 'd-flex'
BestFriendsContainer.style = 'display: none; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; width: 100%;'

let Spacer = document.createElement('div')
Spacer.innerHTML = ' '
Spacer.style.width = '50px'
Spacer.prepend(BestFriendsContainer)

FriendContainer.prepend(BestFriendsContainer)

async function Update() {
    chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
        PinnedGamesData = result.PolyPlus_PinnedGames || [];

        if (Settings.PinnedGamesOn === true) {
            PinnedGames()
        } else {
            NewContainer.style.display = 'none'
            NewTitle.style.display = 'none'
        }
    });

    chrome.storage.sync.get(['PolyPlus_BestFriends'], function(result) {
        BestFriendsData = result.PolyPlus_BestFriends || [];

        if (Settings.BestFriendsOn === true) {
            BestFriends();
        } else {
            BestFriendsContainer.style.display = 'none'
            Spacer.style.display = 'none'
        }
    });
}

function PinnedGames() {
    var Existing = NewContainer.children[0].children
    Array.from(Existing).forEach(element => {
        element.remove();
    });

    if (PinnedGamesData.length === 0) {
        NewContainer.style.display = 'none'
        NewTitle.style.display = 'none'
    } else {
        NewContainer.style.display = ''
        NewTitle.style.display = ''
    }

    PinnedGamesData.forEach(element => {
        fetch('https://api.polytoria.com/v1/places/' + element)
            .then(response => response.json())
            .then(data => {
                let GameName = data.name;
                let GameThumbnail = data.thumbnail;

                var NewGameContainer = document.createElement('a');
                NewGameContainer.innerHTML = GameContainerElement.replace(':GameName',GameName).replace(':Thumbnail',GameThumbnail).replace(':Likes', data.rating.likes).replace(':Dislikes', data.rating.dislikes);
                NewGameContainer.href = '/places/' + element

                /*
                if (new Date().getDate() >= new Date(data.updatedAt).getDate()) {
                    console.log('Game has updated')
                }
                */

                NewContainer.children[0].appendChild(NewGameContainer);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

function BestFriends() {
    Array.from(document.querySelectorAll('[bestFriend]')).forEach(element => {
        element.removeAttribute('bestFriend')
        element.getElementsByClassName('friend-name')[0].style.color = 'initial';
        FriendContainer.appendChild(element)
    });

    if (BestFriendsData.length === 0) {
        BestFriendsContainer.style.visibility = 'hidden'
        BestFriendsContainer.style.padding = '0px !important'
        BestFriendsContainer.style.margin = '0px !important'
    } else {
        BestFriendsContainer.style.visibility = 'visible'
        BestFriendsContainer.style.padding = ''
        BestFriendsContainer.style.margin = ''
    }

    BestFriendsData.forEach(element => {
        let ExistingFriend = document.getElementById('friend-' + element)
        if (ExistingFriend) {
            ExistingFriend.setAttribute('bestFriend', 'true')
            ExistingFriend.getElementsByClassName('friend-name')[0].style.color = 'yellow';
            BestFriendsContainer.prepend(ExistingFriend)
        }
    });
}

var SecondaryColumn = document.getElementsByClassName('col-lg-8')[0]
SecondaryColumn.insertBefore(NewContainer, SecondaryColumn.children[0]);
SecondaryColumn.insertBefore(NewTitle, SecondaryColumn.children[0]);

async function IRLPrice() {
    (async () => {
        let Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
        Utilities = Utilities.default

        const TrendingItems = document.getElementById('home-trendingItems')
        console.log(TrendingItems.children[1].getElementsByClassName('d-flex')[0].children)
        for (let item of TrendingItems.children[1].getElementsByClassName('d-flex')[0].children) {
            const Price = item.getElementsByClassName('text-success')[0]
            console.log(item, Price)
            const Result = await Utilities.CalculateIRL(Price.innerText, Settings.IRLPriceWithCurrencyCurrency)
            
            let Span = document.createElement('span')
            Span.classList = 'text-muted polyplus-price-tag'
            Span.style.fontSize = '0.7rem'
            Span.innerText = "($" + Result.bricks + " " + Result.display + ")"
            Price.appendChild(Span)
        }
    })();
}