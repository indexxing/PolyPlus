let URLSplit = window.location.pathname.split('/');
let GameID = URLSplit[2];

var Settings;
let PinnedGames;

!(() => {
    if (GameID === undefined) {return}

    /*
    const DataContainer = document.getElementById('likes-data-container')
    const RatingsData = {
        Likes: parseInt(DataContainer.getAttribute('data-like-count')),
        Dislikes: parseInt(DataContainer.getAttribute('data-dislike-count')),
        Percentage: null
    }
    RatingsData.Percentage = Math.floor((RatingsData.Likes / (RatingsData.Likes + RatingsData.Dislikes)) * 100)
    const RatingsContainer = document.getElementById('thumbup-btn').parentElement.parentElement

    const PercentageLabel = document.createElement('small')
    PercentageLabel.classList = 'text-muted'
    PercentageLabel.style.fontSize = '0.8rem'
    PercentageLabel.style.marginLeft = '10px'
    PercentageLabel.style.marginRight = '10px'
    PercentageLabel.innerText = RatingsData.Percentage + '%'

    RatingsContainer.children[0].appendChild(PercentageLabel)
    */

    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        Settings = result.PolyPlus_Settings;
    
        if (Settings.PinnedGamesOn === true) {
            HandlePinnedGames()
        }

        // Disabled settings
        if (Settings.InlineEditingOn === true || 1 === 2) {
            HandleInlineEditing()
        }

        if (Settings.GameProfilesOn === true && 1 === 2) {
            HandleGameProfiles()
        }
    });
    
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if ('PolyPlus_PinnedGames' in changes) {
            chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
                PinnedGames = result.PolyPlus_PinnedGames || [];
    
                if (PinnedGames.includes(parseInt(GameID))) {
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                } else {
                    if (PinnedGames.length !== 5) {
                        PinBtn.removeAttribute('disabled')
                        PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin'
                    } else {
                        PinBtn.setAttribute('disabled', true)
                        PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin (max 5/5)'
                    }
                }
            });
        }
    });
})()

async function HandlePinnedGames() {
    chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result){
        PinnedGames = result.PolyPlus_PinnedGames || [];
        const PinBtn = document.createElement('button');
        PinBtn.classList = 'btn btn-warning btn-sm';
        PinBtn.style = 'position: absolute; right: 0; margin-right: 7px;'
        
        if (PinnedGames.includes(parseInt(GameID))) {
            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin';
        } else {
            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Pin';
        }

        PinBtn.addEventListener('click', function() {
            PinBtn.setAttribute('disabled', 'true')

            chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
                PinnedGames = result.PolyPlus_PinnedGames || [];
                const Index = PinnedGames.indexOf(parseInt(GameID));
                if (Index !== -1) {
                    PinnedGames.splice(Index, 1);
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Pin'
                } else {
                    PinnedGames.push(parseInt(GameID));
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                }
                
                chrome.storage.sync.set({ 'PolyPlus_PinnedGames': PinnedGames, arrayOrder: true }, function() {
                    setTimeout(function() {
                        PinBtn.removeAttribute('disabled')
                    }, 1250)
                });
            });
        });

        document.querySelectorAll('.card-header')[2].appendChild(PinBtn);
    });
}

async function HandleInlineEditing() {
    // Fix description editing
    // Make it possible to edit description even if the game doesn't initially have a description
    // Add the ability to edit the game's genre
    // Improve editing visuals overall

    let Editing = false

    const PlaceTitle = document.querySelector('.card-header h1[style="font-weight:800;font-size:1.6em"]')
    const PlaceTitleSpan = document.createElement('span')
    PlaceTitleSpan.innerText = PlaceTitle.innerText
    PlaceTitle.innerHTML = ''
    PlaceTitle.appendChild(PlaceTitleSpan)

    const PlaceDesc = document.querySelector('.card.m-card.mb-2 card-body.p-3.small')
    const PlaceGenre = document.getElementsByClassName('list-unstyled m-0 col')[0].children[3]

    const Genres = [
        "other",
        "adventure",
        "building",
        "competitive",
        "creative",
        "fighting",
        "funny",
        "hangout",
        "medieval",
        "parkour",
        "puzzle",
        "racing",
        "roleplay",
        "sandbox",
        "showcase",
        "simulator",
        "sports",
        "strategy",
        "survival",
        "techdemo",
        "trading",
        "tycoon",
        "western"
    ]

    const EditBtn = document.createElement('button');
    EditBtn.classList = 'btn btn-primary btn-sm';
    EditBtn.style = 'position: absolute; right: 0; margin-right: 7px;'
    EditBtn.innerHTML = '<i class="fa-duotone fa-hammer"></i> <span>Edit</span>'
    document.querySelectorAll('.card-header')[3].appendChild(EditBtn);
    /*
    const EditBtn = document.createElement('button')
    EditBtn.classList = 'text-muted'
    EditBtn.innerHTML = `
    <i class="fa-duotone fa-hammer"></i>
    `
    EditBtn.setAttribute('style', 'background: transparent; border: none; font-size: 1rem; vertical-align: middle;')
    PlaceTitle.appendChild(EditBtn)
    */

    EditBtn.addEventListener('click', function(){
        Editing = (Editing === true) ? false : true

        EditBtn.children[0].classList.toggle('fa-hammer')
        EditBtn.children[0].classList.toggle('fa-check-double')
        EditBtn.children[0].classList.toggle('fa-fade')

        PlaceTitleSpan.setAttribute('contenteditable', Editing.toString())
        if (PlaceDesc !== null) {
            console.log('Description exists')
            PlaceDesc.setAttribute('contenteditable', Editing.toString())
        }
        if (Editing === false) {
            const Send = new FormData()
            Send.append("_csrf", document.querySelector('input[name="_csrf"]').value)
            Send.append("id", GameID)
            Send.append("name", PlaceTitle.innerText || '')
            
            fetch('/create/place/update', {method:"POST",body:Send})
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network not ok')
                    }
                    return response.text()
                })
                .then(data => {
                    console.log('Successfully edited game')
                })
                .catch(error => {
                    console.log('Error while editing game')
                });
        }
    });
}

const Data = JSON.parse('{"gameTitle": "Hyper[Fart]","bg": "#000","accent": "#007bff","secondary": "#","cardBg": "#313131","font": "","text": "#fff"}')

async function HandleGameProfiles(Data) {
    document.querySelector('h1.my-0')
        .setAttribute('game-key', 'true');
    document.querySelector('div[style="min-height: 60vh;"]')
        .id = 'gameprofile';

    const Style = document.createElement('style')

    Style.innerHTML = `
    div#app {
        background: ${Data.bg} !important;
    }

    #gameprofile {
        /*font-family: ${Data.font} !important;*/
        color: ${Data.text} !important;
    }

    #gameprofile .card {
        --bs-card-bg: ${Data.cardBg};
    }

    /*
    #gameprofile .card.mcard[game-key] .card-header {
        background: transparent;
        border: none;
    }
    */

    #gameprofile .card.mcard [game-key] {
        background: linear-gradient(to bottom, ${Data.accent}, ${Data.secondary});
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    `
    document.body.appendChild(Style)
}