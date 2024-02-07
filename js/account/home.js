var Settings;
var PinnedGames;
var BestFriends;

let ContainerElement = `
<div class="card-body p-0 m-1 scrollFadeContainer d-flex"></div>`;
let GameContainerElement = `
<div class="scrollFade card me-2 place-card force-desktop text-center mb-2" style="opacity: 1;">
    <div class="card-body">
        <img src=":Thumbnail" class="place-card-image">
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
/*
BestFriendsContainer.style.display = 'none'
BestFriendsContainer.style.borderBottom = '1px solid #000'
BestFriendsContainer.style.paddingBottom = '10px'
BestFriendsContainer.style.marginBottom = '10px'
BestFriendsContainer.style.width = '100%'
*/

let Spacer = document.createElement('div')
Spacer.innerHTML = ' '
Spacer.style.width = '50px'
Spacer.prepend(BestFriendsContainer)

FriendContainer.prepend(BestFriendsContainer)
UpdateLocalData();

function UpdateLocalData() {
    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        Settings = result.PolyPlus_Settings || {PinnedGamesOn: false}
    });

    chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
        PinnedGames = result.PolyPlus_PinnedGames || [];
        chrome.storage.sync.get(['PolyPlus_BestFriends'], function(result) {
            BestFriends = result.PolyPlus_BestFriends || [];
            if (Settings.PinnedGamesOn === true) {
                LoadPinnedGames();
            } else {
                NewContainer.style.display = 'none'
                NewTitle.style.display = 'none'
            }
            if (Settings.BestFriendsOn === true) {
                LoadBestFriends();
            } else {
                BestFriendsContainer.style.display = 'none'
                Spacer.style.display = 'none'
            }
        });
    });
}

function LoadPinnedGames() {
    var Existing = NewContainer.children[0].children
    Array.from(Existing).forEach(element => {
        element.remove();
    });

    if (PinnedGames.length === 0) {
        NewContainer.style.display = 'none'
        NewTitle.style.display = 'none'
    } else {
        NewContainer.style.display = ''
        NewTitle.style.display = ''
    }

    PinnedGames.forEach(element => {
        fetch('https://api.polytoria.com/v1/places/' + element)
            .then(response => response.json())
            .then(data => {
                let GameName = data.name;
                let GameThumbnail = data.thumbnail;

                var NewGameContainer = document.createElement('a');
                NewGameContainer.innerHTML = GameContainerElement.replace(':GameName',GameName).replace(':Thumbnail',GameThumbnail);
                NewGameContainer.setAttribute('href', '/places/' + element);

                if (new Date().getDate() >= new Date(data.updatedAt).getDate()) {
                    console.log('Game has updated')
                }

                NewContainer.children[0].appendChild(NewGameContainer);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

function LoadBestFriends() {
    Array.from(document.querySelectorAll('[bestFriend]')).forEach(element => {
        element.removeAttribute('bestFriend')
        element.getElementsByClassName('friend-name')[0].style.color = 'initial';
        FriendContainer.appendChild(element)
    });

    if (BestFriends.length === 0) {
        BestFriendsContainer.style.visibility = 'hidden'
        BestFriendsContainer.style.padding = '0px !important'
        BestFriendsContainer.style.margin = '0px !important'
    } else {
        BestFriendsContainer.style.visibility = 'visible'
        BestFriendsContainer.style.padding = ''
        BestFriendsContainer.style.margin = ''
    }

    BestFriends.forEach(element => {
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