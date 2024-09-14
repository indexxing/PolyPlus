chrome.storage.sync.get(['PolyPlus_Settings', 'PolyPlus_PinnedGames'], async function(result){
    Settings = result.PolyPlus_Settings || {
        PinnedGamesOn: true
    }

    if (Settings.PinnedGamesOn === true) {
        const PlaceIDs = result.PolyPlus_PinnedGames || [];

        const PinnedGamesContainer = document.createElement('div')
        PinnedGamesContainer.innerHTML = `
        <div class="row reqFadeAnim px-2 px-lg-0">
            <div class="col">
                <h6 class="dash-ctitle2">Jump right back into your favorite games</h6>
                <h5 class="dash-ctitle">Pinned Games</h5>
            </div>
        </div>
        <div class="card card-dash mcard mb-3">
            <div class="card-body p-0 m-1 scrollFadeContainer" id="p+pinned_games_card">
                <div class="text-center p-5">
                    <div class="spinner-border text-muted" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
        `

        const RightSideColumn = document.getElementsByClassName('col-lg-8')[0];
        if (document.getElementsByClassName('home-event-container')[0] === undefined) {
            RightSideColumn.insertBefore(PinnedGamesContainer, RightSideColumn.children[0]);
        } else {
            RightSideColumn.insertBefore(PinnedGamesContainer, RightSideColumn.children[1]);
        }

        const PinnedGamesCard = document.getElementById('p+pinned_games_card')
        for (let i = 0; i < PlaceIDs.length; i++) {
            const PlaceID = PlaceIDs.toSorted((a, b) => b - a)[i]
            const PlaceDetails = (await (await fetch('https://api.polytoria.com/v1/places/' + PlaceID)).json())

            const PlaceCard = document.createElement('a')
            PlaceCard.classList = 'd-none'
            PlaceCard.href = '/places/' + PlaceID
            PlaceCard.innerHTML = `
            <div class="scrollFade card me-2 place-card force-desktop text-center mb-2" style="opacity: 1;">
                <div class="card-body">
                    <div class="ratings-header">
                        <img src="${PlaceDetails.thumbnail}" class="place-card-image" style="position: relative;">
                        <div class="p+pinned_games_playing" style="position: absolute;background: linear-gradient(to bottom, #000000f7, transparent, transparent, transparent);width: 100%;height: 100%;top: 0;left: 0;border-radius: 15px;padding-top: 12px;color: gray;font-size: 0.8rem;">
                            <i class="fa-duotone fa-users"></i>
                            <span>
                                ${PlaceDetails.playing}
                                Playing
                            </span>
                        </div>
                    </div>
                    <div>
                        <div class="mt-2 mb-1 place-card-title">
                            ${PlaceDetails.name}
                        </div>
                    </div>
                </div>
            </div>
            `

            if (!PlaceDetails.isActive) {
                const PlayerCountText = PlaceCard.getElementsByClassName('p+pinned_games_playing')[0]
                PlayerCountText.children[0].classList = 'text-warning fa-duotone fa-lock'
                PlayerCountText.children[1].remove()
            }

            PinnedGamesCard.appendChild(PlaceCard)
        }
        PinnedGamesCard.children[0].remove()
        PinnedGamesCard.classList.add('d-flex')
        Array.from(PinnedGamesCard.children).forEach((place) => {place.classList.remove('d-none')})
    }

    if (Settings.IRLPriceWithCurrency && Settings.IRLPriceWithCurrency.Enabled === true) {
        (async () => {
            Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
            Utilities = Utilities.default;
    
            const TrendingItems = document.getElementById('home-trendingItems');
            for (let item of TrendingItems.children[1].getElementsByClassName('d-flex')[0].children) {
                const Price = item.getElementsByClassName('text-success')[0];
                if (Price !== undefined) {
                    const IRLResult = await Utilities.CalculateIRL(Price.innerText, Settings.IRLPriceWithCurrency.Currency);
    
                    let Span = document.createElement('span');
                    Span.classList = 'text-muted polyplus-price-tag';
                    Span.style = 'font-size: 0.7rem; font-weight: lighter;';
                    Span.innerText = '($' + IRLResult.result + ' ' + IRLResult.display + ')';
                    Price.appendChild(Span);
                }
            }
        })();
    }

    if (Settings.HomeFriendCountOn === true) {
        chrome.storage.local.get(['PolyPlus_FriendCount'], async function(result){
			let FriendCount = result['PolyPlus_FriendCount'].count;

			// cache for 5 minutes
			if (FriendCount === undefined || (new Date().getTime() - FriendCount.requested > 300000)) {
				FriendCount = (await (await fetch('https://polytoria.com/api/friends?page=1')).json()).meta.total;

				chrome.storage.local.set({['PolyPlus_FriendCount']: {
                    count: FriendCount,
                    requested: new Date().getTime()
                }}, function(){});
			}

            const CountText = document.createElement('small');
            CountText.classList = 'text-muted fw-lighter';
            CountText.style.fontSize = '0.8rem';
            CountText.innerText = ' (' + FriendCount + ')';
            document.querySelector('#home-friendsOnline h5').appendChild(CountText);
        });
    }

    if (Settings.HomeJoinFriendsButtonOn === true) {
        const FriendsPopup = document.getElementById('friend-name')
        const ChangeMutator = new MutationObserver(async function (list) {
            for (let record of list) {
                for (let node of record.addedNodes) {
                    if (node.tagName === 'A') {
                        const JoinButton = document.createElement('button')
                        JoinButton.classList = 'btn btn-success btn-sm'
                        JoinButton.style = 'position: absolute; top: 0; right: 0; z-index: 2000; font-size: 1.2rem;'
                        JoinButton.innerHTML = '<i class="fas fa-play"></i>'
                        node.parentElement.appendChild(JoinButton)

                        JoinButton.addEventListener('click', async function(){
                            const PlayingStatus = (await (await fetch('https://api.polytoria.com/v1/users/' + document.getElementById('friendsProfileLink').getAttribute('href').split('/')[2])).json()).playing;
                            
                            const Token = (await (await fetch('https://polytoria.com/api/places/join', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    placeID: parseInt(node.getAttribute('href').split('/')[2]),
                                    serverID: PlayingStatus.serverID
                                })
                            })).json())

                            if (!Token.success) {
                                alert(Token.message);
                                return
                            }

                            window.location.href = 'polytoria://client/' + Token.token
                        })
                    }
                }
            }
        })

        ChangeMutator.observe(FriendsPopup, {childList: true})
    }
})