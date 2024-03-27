const PlaceID = window.location.pathname.split('/')[2]
const UserID = JSON.parse(window.localStorage.getItem('account_info')).ID
const GameCreator = document.querySelector('#main-content .card-body .col div.text-muted a[href^="/users/"]').getAttribute('href').split('/')[2]

let Utilities;

var Settings;
var PinnedGamesData = []
let GamePinned;

let InfoColumns = document.querySelectorAll('#main-content .col:has(#likes-data-container) .card:last-child ul')
let CalculateRevenueButton;

!(() => {
    if (PlaceID === undefined) { return }

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
    
    if (!isNaN(RatingsData.Percentage)) {
        PercentageLabel.innerText = RatingsData.Percentage + '%'
    } else {
        PercentageLabel.innerText = 'N/A'
    }

    RatingsContainer.children[0].appendChild(PercentageLabel)

    chrome.storage.sync.get(['PolyPlus_Settings'], async function(result) {
        Settings = result.PolyPlus_Settings || {}
    
        if (Settings.PinnedGamesOn === true) {
            PinnedGames()
        }

        // Work in Progress
        if (Settings.InlineEditingOn === true) {
            InlineEditing()
        }

        // Work in Progress
        /*
        if (Settings.GameProfilesOn === true) {
            GameProfiles()
        }
        */

        if (Settings.IRLPriceWithCurrencyOn === true) {
            (async () => {
                Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'));
                Utilities = Utilities.default

                IRLPrice()
            })();
        }

        if (Settings.StoreOwnTagsOn === true) {
            OwnedTags()
        }

        if (Settings.ShowPlaceRevenueOn === true) {
            const NameRow = document.createElement('li')
            NameRow.innerText = 'Revenue:'

            CalculateRevenueButton = document.createElement('li')
            CalculateRevenueButton.classList = 'fw-normal text-success'
            CalculateRevenueButton.style.letterSpacing = '0px'
            CalculateRevenueButton.innerHTML = `
            <a class="text-decoration-underline text-success" style="text-decoration-color: rgb(15, 132, 79) !important;">$ Calculate</a>
            `

            InfoColumns[0].appendChild(NameRow)
            InfoColumns[1].appendChild(CalculateRevenueButton)

            let Calculating = false
            CalculateRevenueButton.addEventListener('click', function() {
                if (Calculating === false) {
                    Calculating = true
                    CalculateRevenueButton.innerText = '$ Calculating...'
                    PlaceRevenue()
                }
            })
        }

        AchievementProgressBar()
    });
})()

async function PinnedGames() {
    chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result){
        PinnedGamesData = result.PolyPlus_PinnedGames || [];
        /*
        const PinBtn = document.createElement('button');
        PinBtn.classList = 'btn btn-warning btn-sm';
        PinBtn.style = 'position: absolute; right: 0; margin-right: 7px;'
        
        if (PinnedGamesData[PlaceID]) {
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
        
        if (PinnedGamesData.includes(parseInt(PlaceID))) {
            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin';
        } else {
            if (PinnedGamesData.length !== 5) {
                PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin'
            } else {
                PinBtn.setAttribute('disabled', true)
                PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin (max 5/5)'
            }
        }

        PinBtn.addEventListener('click', function() {
            PinBtn.setAttribute('disabled', 'true')

            chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
                PinnedGamesData = result.PolyPlus_PinnedGames || [];
                /*
                const Index = PinnedGames.indexOf(parseInt(PlaceID))
                if (Index !== -1) {
                    //delete PinnedGames[PlaceID]
                    PinnedGames.splice(Index, 1)
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Pin'
                } else {
                    //PinnedGames[PlaceID] = {lastVisited: new Date()}
                    PinnedGames.push(parseInt(PlaceID))
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                }
                */
                const Index = PinnedGamesData.indexOf(parseInt(PlaceID));
                if (Index !== -1) {
                    PinnedGamesData.splice(Index, 1);
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Pin'
                } else {
                    PinnedGamesData.push(parseInt(PlaceID));
                    PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                }
                
                chrome.storage.sync.set({ 'PolyPlus_PinnedGames': PinnedGamesData, arrayOrder: true }, function() {
                    setTimeout(function() {
                        PinBtn.removeAttribute('disabled')
                        console.log(PinnedGamesData)
                    }, 1250)
                });
            });
        });

        document.getElementsByClassName('card-header')[2].appendChild(PinBtn);

        chrome.storage.onChanged.addListener(function(changes, namespace) {
            if ('PolyPlus_PinnedGames' in changes) {
                chrome.storage.sync.get(['PolyPlus_PinnedGames'], function(result) {
                    PinnedGamesData = result.PolyPlus_PinnedGames || [];
        
                    /*
                    if (PinnedGamesData[PlaceID]) {
                        PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                    } else {
                        if (PinnedGamesData.length !== 5) {
                            PinBtn.removeAttribute('disabled')
                            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin'
                        } else {
                            PinBtn.setAttribute('disabled', true)
                            PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i>  Pin (max 5/5)'
                        }
                    }
                    */
                    if (PinnedGamesData.includes(parseInt(PlaceID))) {
                        PinBtn.innerHTML = '<i class="fa-duotone fa-star"></i> Un-pin'
                    } else {
                        if (PinnedGamesData.length !== 5) {
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

async function InlineEditing() {
    // Fix description editing
    // Make it possible to edit description even if the game doesn't initially have a description
    // Add the ability to edit the game's genre
    // Improve editing visuals overall

    if (GameCreator !== UserID) {
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
            Send.append("id", PlaceID)
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
            Send.append("id", PlaceID)
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

//const Data = JSON.parse('{"gameTitle": "Hyper[Fart]","bg": "#000","accent": "#007bff","secondary": "#","cardBg": "#313131","font": "","text": "#fff"}')
const Data = JSON.parse('{"gameTitle":"Isolation: Brix High School","bg":"#0148af","accent":"#986c6a","secondary":"#b7d3f2","cardBg":"#313131","text":"#fff"}')
async function GameProfiles(data) {
    return
    data = Data
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

async function IRLPrice() {
    const Gamepasses = document.querySelector('#gamepasses-tabpane .row.flex-row').children
    for (let gamepass of Gamepasses) {
        const Price = gamepass.getElementsByClassName('text-success')[0]
        const IRLResult = await Utilities.CalculateIRL(Price.innerText, Settings.IRLPriceWithCurrencyCurrency)

        let Span = document.createElement('span')
        Span.classList = 'text-muted polyplus-price-tag'
        Span.style.fontSize = '0.7rem'
        Span.innerText = "($" + IRLResult.result + " " + IRLResult.display + ")"
        Price.appendChild(Span)
    }
}

async function OwnedTags() {
    /*
    This feature is disabled due to Polytoria website now having this without the use of an extension - items are now grayed out if they are owned
    */
    return
    const Response = await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory/')
    const Gamepasses = document.querySelector('#gamepasses-tabpane .row.flex-row').children
    for (let gamepass of Gamepasses) {
        const GamePassID = gamepass.getElementsByTagName('a')[0].getAttribute('href').split('/')
        console.log(GamePassID)
    }

    const Achievements = document.querySelector('#achievements-tabpane .row.flex-row').children
    for (let gamepass of Achievements) {
        const GamePassID = gamepass.getElementsByTagName('a')[0].getAttribute('href').split('/')
        console.log(GamePassID)
    }
}

async function PlaceRevenue() {
    const Visits = parseInt(document.querySelector('li:has(i.fad.fa-users.text-muted[style])').innerText)
    const BricksPerView = 5
    let Revenue = (round5(Visits) / 5)

    let CreatorDetails = await fetch('https://api.polytoria.com/v1/users/' + GameCreator)
    CreatorDetails = await CreatorDetails.json()

    let CreatorTax = 0.35
    switch (CreatorDetails.membershipType) {
        case 'plus':
            CreatorTax = 0.25
            break
        case 'plusDeluxe':
            CreatorTax = 0.15
            break
    }

    fetch(`https://api.polytoria.com/v1/places/${PlaceID}/gamepasses`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.json()
        })
        .then(data => {
            for (let gamepass of data.gamepasses) {
                const PriceAfterTax = Math.floor(gamepass.asset.price - (gamepass.asset.price * CreatorTax))
                Revenue += (PriceAfterTax * gamepass.asset.sales)
            }

            const ResultText = document.createElement('li')
            ResultText.classList = 'fw-normal text-success'
            ResultText.style.letterSpacing = '0px'
            ResultText.innerHTML = `<i class="pi pi-brick mx-1"></i> ~` + Revenue.toLocaleString()
    
            CalculateRevenueButton.remove()
            InfoColumns[1].appendChild(ResultText)
        })
        .catch(error => {
            console.log(error)
        })
}

function round5(number) { const remainder = number % 5; if (remainder < 2.5) { return number - remainder; } else { return number + (5 - remainder); } }

function AchievementProgressBar() {
    const Achievements = document.getElementById('achievements-tabpane')

    const AchievementCount = Achievements.children.length
    let AchievementsEarned = 0

    for (let achievement of Array.from(Achievements.children)) {
        const Achieved = (achievement.getElementsByClassName('fad fa-calendar')[0] !== undefined)

        if (Achieved === true) {
            AchievementsEarned++
        }
    }

    const PercentageEarned = ((AchievementsEarned*100)/AchievementCount).toFixed(0)

    const ProgressBar = document.createElement('div')
    ProgressBar.role = 'progressbar'
    ProgressBar.classList = 'progress'
    ProgressBar.style.background = '#000'
    ProgressBar.ariaValueNow = PercentageEarned
    ProgressBar.ariaValueMin = "0"
    ProgressBar.ariaValueMax = "100"
    ProgressBar.innerHTML = `<div class="progress-bar progress-bar-striped text-bg-warning" style="width: ${PercentageEarned}%">${PercentageEarned}%</div>`

    Achievements.prepend(document.createElement('hr'))
    Achievements.prepend(ProgressBar)
}