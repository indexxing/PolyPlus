let GameID = window.location.pathname.split('/')[2]

var Settings;
let PinnedGames;
let GamePinned;

!(() => {
    if (GameID === undefined) {return}

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

    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        Settings = result.PolyPlus_Settings || {
            PinnedGamesOn: true,
            InlineEditingOn: false,
            GameProfilesOn: false
        };
    
        if (Settings.PinnedGamesOn === true) {
            HandlePinnedGames()
        }

        // Work in Progress
        if (Settings.InlineEditingOn === true) {
            HandleInlineEditing()
        }

        // Work in Progress
        if (Settings.GameProfilesOn === true) {
            HandleGameProfiles()
        }
    });
})()

async function HandlePinnedGames() {
    chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result){
        PinnedGames = result.PolyPlus_PinnedGames || {};
        /*
        const PinBtn = document.createElement('button');
        PinBtn.classList = 'btn btn-warning btn-sm';
        PinBtn.style = 'position: absolute; right: 0; margin-right: 7px;'
        
        if (PinnedGames[GameID]) {
            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin';
        } else {
            if (PinnedGames.length !== 5) {
                PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin'
            } else {
                PinBtn.setAttribute('disabled', true)
                PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin (max 5/5)'
            }
        }
        */
        const PinBtn = document.createElement('button');
        PinBtn.classList = 'btn btn-warning btn-sm';
        PinBtn.style = 'position: absolute; right: 0; margin-right: 7px;'
        
        if (PinnedGames.includes(parseInt(GameID))) {
            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin';
        } else {
            if (PinnedGames.length !== 5) {
                PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin'
            } else {
                PinBtn.setAttribute('disabled', true)
                PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin (max 5/5)'
            }
        }

        PinBtn.addEventListener('click', function() {
            PinBtn.setAttribute('disabled', 'true')

            chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
                PinnedGames = result.PolyPlus_PinnedGames || [];
                /*
                const Index = PinnedGames.indexOf(parseInt(GameID))
                if (Index !== -1) {
                    //delete PinnedGames[GameID]
                    PinnedGames.splice(Index, 1)
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Pin'
                } else {
                    //PinnedGames[GameID] = {lastVisited: new Date()}
                    PinnedGames.push(parseInt(GameID))
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                }
                */
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
                        console.log(PinnedGames)
                    }, 1250)
                });
            });
        });

        document.getElementsByClassName('card-header')[2].appendChild(PinBtn);

        chrome.storage.onChanged.addListener(function(changes, namespace) {
            if ('PolyPlus_PinnedGames' in changes) {
                chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
                    PinnedGames = result.PolyPlus_PinnedGames || [];
        
                    /*
                    if (PinnedGames[GameID]) {
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
                    */
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
    });
}

async function HandleInlineEditing() {
    // Fix description editing
    // Make it possible to edit description even if the game doesn't initially have a description
    // Add the ability to edit the game's genre
    // Improve editing visuals overall

    const GameCreator = document.querySelector('#main-content .card-body .col div.text-muted a[href^="/users/"]').getAttribute('href').split('/')[2]
    console.log(GameCreator)
    console.log(JSON.parse(window.localStorage.getItem('account_info')).ID)
    if (GameCreator !== JSON.parse(window.localStorage.getItem('account_info')).ID) {
        return
    }

    let Editing = false

    const Style = document.createElement('style')
    Style.innerHTML = `
    body[data-polyplus-inlineEditing="true"] .polyplus-inlineEditing-visible {display: block !important;}
    .polyplus-inlineEditing-visible {display: none;}

    body[data-polyplus-inlineEditing="true"] .polyplus-inlineEditing-hidden {display: none !important;}
    .polyplus-inlineEditing-hidden {display: block;}
    `
    document.body.prepend(Style)

    const Inputs = [
        {
            name: "name",
            element: null,
            reference: '.card-header h1[style="font-weight:800;font-size:1.6em"]',
            placeholder: "Place Title..",
            required: true,
            isTextarea: false,
            styles: 'font-weight:800;font-size:1.6em'
        },
        {
            name: "description",
            element: null,
            reference: '.col:has(#likes-data-container) .card.mcard.mb-2 .card-body.p-3.small',
            placeholder: "Place Description..",
            required: false,
            isTextarea: true,
            styles: 'height:300px; overflow-y:auto;'
        }
    ]
    console.log(Inputs)
    for (let input of Inputs) {
        let Input = (input.isTextarea === true) ? document.createElement('textarea') : document.createElement('input')
        input.element = Input

        const Reference = document.querySelector(input.reference)

        Input.classList = 'polyplus-inlineEditing-visible form-control'
        Input.placeholder = input.placeholder
        Input.value = Reference.innerText
        Input.style = input.styles

        Reference.classList.add('polyplus-inlineEditing-hidden')
        Reference.parentElement.appendChild(Input)
    }

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
    EditBtn.innerHTML = '<i class="fa-duotone fa-hammer"></i> <span>Edit Details</span>'
    document.getElementsByClassName('card-header')[3].appendChild(EditBtn);

    EditBtn.addEventListener('click', function(){
        Editing = !Editing

        EditBtn.children[0].classList.toggle('fa-hammer')
        EditBtn.children[0].classList.toggle('fa-check-double')
        EditBtn.children[0].classList.toggle('fa-fade')

        document.body.setAttribute('data-polyplus-inlineEditing', Editing)

        if (Editing === false) {
            const Send = new FormData()
            Send.append("_csrf", document.querySelector('input[name="_csrf"]').value)
            Send.append("id", GameID)
            for (let input of Inputs) {
                console.log('start of loop')
                Send.append(input.name, input.element.value)
            }
            
            console.log('after')
            fetch('/create/place/update', {method:"POST",body:Send})
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network not ok')
                    }
                    return response.text()
                })
                .then(data => {
                    console.log('Successfully edited game')
                    for (let input of Inputs) { 
                        const Reference = document.querySelector(input.reference)
                        Reference.innerText = input.element.value
                    }
                })
                .catch(error => {
                    alert('Error while saving changes')
                    console.log('Error while editing game')
                });
        }

        /*
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
        */
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