setTimeout(function () {}, 100)
const UserID = JSON.parse(window.localStorage.getItem('account_info')).ID

let PageContainer = document.querySelector('.container.p-0.p-lg-5')
let ItemGrid;
let Wearing;
let Tabs;
let IFrame;
let TabSelected = 'hat'
let Search;
let Page = 1
let Avatar = {
    "useCharacter": true,
    "items": [
        24122
    ],
    "shirt": 24118,
    "pants": 24123,
    "headColor": "#e0e0e0",
    "torsoColor": "#e0e0e0",
    "leftArmColor": "#e0e0e0",
    "rightArmColor": "#e0e0e0",
    "leftLegColor": "#e0e0e0",
    "rightLegColor": "#e0e0e0"
}
let ItemCardContents = `
<div style="max-width: 150px;">
    <div class="card mb-2 avatar-item-container">
        <div class="p-2">
            <img src=":ItemThumbnail" class="img-fluid">
            <span class="position-absolute" style="top: 5px; left: 5px; z-index: 1;">
                <span class="badge bg-secondary">:ItemType</span>
            </span>
            <button class="avatarAction btn btn-success btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-plus"></i></button>
        </div>
    </div>
    <a href="/store/:ItemID" class="text-reset">
        <h6 class="text-truncate mb-0"> :ItemName</h6>
    </a>
    <small class="text-muted d-block text-truncate">
        by <a href="/users/:CreatorID" class="text-reset">:CreatorName</a>
    </small>
</div>
`

if (new URLSearchParams(new URL(window.location).search).get('sandbox') === 'true') {
    console.log('Avatar Sandbox!')

    LoadFile(chrome.runtime.getURL('js/account/avatar-sandbox.html'), function(html){
        PageContainer.innerHTML = html
        ItemGrid = document.getElementById('inventory')
        Wearing = document.getElementById('wearing')
        Tabs = document.getElementById('tabs')
        IFrame = document.getElementById('viewFrame')

        Search = document.getElementById('item-search')
        Search.addEventListener('onchange', function(){
            RefreshItems()
        });

        UpdateAvatar()
        RefreshItems()
        LoadWearing()

        Array.from(Tabs.children).forEach(element => {
            element.addEventListener('click', function(){
                let Link = element.getElementsByTagName('a')[0]
                if (!(Link.classList.contains('active'))) {
                    Link.classList.add('active')
                    Tabs.querySelector(`[data-tab="${TabSelected}"]`).classList.remove('active')
                    TabSelected = Link.getAttribute('data-tab')
                    Page = 1
                    RefreshItems()
                }
            });
        });

        let Clear = document.getElementById('clear')
        Clear.addEventListener('click', function(){
            Avatar = {
                "useCharacter": true,
                "items": [
                    24122
                ],
                "shirt": 24118,
                "pants": 24123,
                "headColor": "#e0e0e0",
                "torsoColor": "#e0e0e0",
                "leftArmColor": "#e0e0e0",
                "rightArmColor": "#e0e0e0",
                "leftLegColor": "#e0e0e0",
                "rightLegColor": "#e0e0e0"
            }
            UpdateAvatar()
        });

        let Myself = document.getElementById('myself')
        Myself.addEventListener('click', function(){
            LoadMyself()
        });

        let JSONUpload = document.getElementById('jsonUpload')
        JSONUpload.addEventListener('change', function(){
            let Reader = new FileReader()
            Reader.addEventListener('loadend', function(){
                Avatar = JSON.parse(Reader.result)
                UpdateAvatar()

                JSONUpload.value = ""
            });

            Reader.readAsText(JSONUpload.files[0])
        });

        let JSONSave = document.getElementById('jsonSave')
        JSONSave.addEventListener('click', function(){
            let Download = document.createElement('a')
            Download.href = URL.createObjectURL(new Blob([JSON.stringify(Avatar)], {
                type: "application/json"
            }));
            Download.setAttribute('download', 'AvatarSandbox.json')
            document.body.appendChild(Download)
            Download.click()
            document.body.removeChild(Download)
        });

        let OpenInNewTab = document.getElementById('openNewTab')
        OpenInNewTab.addEventListener('click', function(){
            UpdateAvatar()
        });
    });
}

function UpdateAvatar() {
    GenerateHash()
        .then(hash => {
            IFrame.addEventListener('load', function () {
                IFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + hash;
            });
            IFrame.src = 'about:blank';
        });
}

function LoadFile(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { return callback(this.responseText); }
    xhr.open("GET", path, true);
    xhr.send();
}

async function GenerateHash(data) {
    if (!data) {
        console.log('Data not provided')
        let FormattedAvatar = await FormatAvatar()
        return btoa(encodeURIComponent(JSON.stringify(FormattedAvatar)))
    } else {
        console.log('Data provided')
        return btoa(encodeURIComponent(JSON.stringify(data)))
    }
}

function RefreshItems() {
    fetch(`https://api.polytoria.com/v1/store?search=${Search.value}&types%5B%5D=${TabSelected}&sort=createdAt&order=desc&page=${Page}&limit=12`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            Array.from(ItemGrid.children).forEach(element => {element.remove()});
            data = data.assets
            data.forEach(item => {
                let NewItemCard = document.createElement('div')
                NewItemCard.classList = 'col-auto'
                NewItemCard.innerHTML = ItemCardContents
                    .replace(':ItemName', item.name)
                    .replace(':ItemID', item.id)
                    .replace(':ItemType', item.type)
                    .replace(item.type.charAt(0), item.type.charAt(0).toUpperCase())
                    .replace(':CreatorName', item.creator.name)
                    .replace(':CreatorID', item.creator.id)
                    .replace(':ItemThumbnail', item.thumbnail)
                NewItemCard.getElementsByClassName('p-2')[0].addEventListener('click', function(){
                    WearAsset(NewItemCard, item)
                });

                ItemGrid.appendChild(NewItemCard)
            });
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

async function FormatAvatar() {
    const FormattedAvatar = structuredClone(Avatar)

    // Hats, Tools: https://api.polytoria.com/v1/assets/serve-mesh/:id
    // or: https://api.polytoria.com/v1/assets/serve/:id/Asset

    Avatar.items.forEach(async (item, index) => {
        if (typeof(item) === 'number') {
            console.log(item)
            await FetchMesh(item)
                .then(URL => {
                    console.log('URL: ' + URL)
                    FormattedAvatar.items[index] = URL
                })
                .catch(error => {
                    throw new Error(error)
                });
            console.log('after url')
            //Avatar.items[index] = URL
        }
    });

    if (typeof(FormattedAvatar.tool) === 'number') {console.log(FormattedAvatar.tool); FormattedAvatar.tool = await FetchMesh(FormattedAvatar.tool)}

    if (FormattedAvatar.face && typeof(FormattedAvatar.face) === 'number') {
        FormattedAvatar.face = await FetchAsset(FormattedAvatar.face)
    } else {
        FormattedAvatar.face = "https://c0.ptacdn.com/static/3dview/DefaultFace.png"
    }

    if (typeof(FormattedAvatar.shirt) === 'number') {FormattedAvatar.shirt = await FetchAsset(FormattedAvatar.shirt)}
    if (typeof(FormattedAvatar.pants) === 'number') {FormattedAvatar.pants = await FetchAsset(FormattedAvatar.pants)}

    console.log('Real Avatar: ', Avatar, 'Formatted: ', FormattedAvatar)
    return FormattedAvatar
}

function LoadMyself() {
    fetch('https://api.polytoria.com/v1/users/:id/avatar'.replace(':id', UserID))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.json()
        })
        .then(data => {
            Avatar.items = []

            data.assets.forEach(item => {
                switch(item.type) {
                    case 'hat':
                        Avatar.items.push(item.id)
                        break
                    default:
                        Avatar[item.type] = item.id
                        break
                }
            });

            Avatar.headColor = '#' + data.colors.head || '#cdcdcd'
            Avatar.torsoColor = '#' + data.colors.torso || '#cdcdcd'
            Avatar.leftArmColor = '#' + data.colors.leftArm || '#cdcdcd'
            Avatar.rightArmColor = '#' + data.colors.rightArm || '#cdcdcd'
            Avatar.leftLegColor = '#' + data.colors.leftLeg || '#cdcdcd'
            Avatar.rightLegColor = '#' + data.colors.rightLeg || '#cdcdcd'

            UpdateAvatar()
        })
        .catch(error => {
            console.log(error)
        });
}

function WearAsset(element, info) {
    if (Avatar.items.indexOf(info.id) === -1 && Avatar[info.type] !== info.id) {
        console.log('Equip')
        switch(info.type) {
            case 'hat':
                Avatar.items.push(info.id)
                break
            default:
                Avatar[info.type] = info.id
                break
        }
    } else {
        console.log('unequip')
        switch(info.type) {
            case 'hat':
                Avatar.items.splice(Avatar.items.indexOf(info.id), 1)
                break
            case 'face':
                Avatar.face = "https://c0.ptacdn.com/static/3dview/DefaultFace.png"
                break
            default:
                Avatar[info.type] = undefined
                break
        }
    }

    LoadWearing()
    UpdateAvatar()
}

async function FetchMesh(id) {
    if (id === null) {return null}
    console.log('https://api.polytoria.com/v1/assets/serve-mesh/:id'.replace(':id', id))
    return fetch('https://api.polytoria.com/v1/assets/serve-mesh/:id'.replace(':id', id))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.json()
        })
        .then(data => {
            console.log(data, 'finished', data.url)
            return data.url
        })
        .catch(error => {
            console.log('Fetch error: ' + error)
        });
}

async function FetchAsset(id) {
    if (id === null) {return null}
    return fetch('https://api.polytoria.com/v1/assets/serve/:id/Asset'.replace(':id', id))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.json()
        })
        .then(data => {
            return data.url
        })
        .catch(error => {
            console.log('Fetch error: ' + error)
        });
}

function LoadWearing() {
    const WearingItems = [
        ...Avatar.items,
        Avatar.shirt,
        Avatar.pants,
        Avatar.face
    ].filter(item => item !== null && item !== undefined);

    Array.from(Wearing.children).forEach(element => {
        const ItemID = element.getElementsByTagName('a')[0].href.split('/')[2]
        if (!WearingItems.includes(ItemID)) {
            element.remove();
        }
    });

    WearingItems.forEach(item => {

        const ExistingElement = Wearing.querySelector(`[data-itemid="${item}"]`);
        if (!ExistingElement) {
            fetch(`https://api.polytoria.com/v1/store/${item}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network not ok');
                    }
                    return response.json();
                })
                .then(item => {
                    if (Wearing.innerHTML === 'No items to show.') {
                        Wearing.innerHTML = ''
                    }
                    let NewItemCard = document.createElement('div');
                    NewItemCard.classList = 'col-auto';
                    NewItemCard.innerHTML = ItemCardContents
                        .replace(':ItemName', item.name)
                        .replace(':ItemID', item.id)
                        .replace(':ItemType', item.type.charAt(0).toUpperCase() + item.type.substring(1))
                        .replace(':CreatorName', item.creator.name)
                        .replace(':CreatorID', item.creator.id)
                        .replace(':ItemThumbnail', item.thumbnail);
                    Wearing.appendChild(NewItemCard);
                    NewItemCard.getElementsByClassName('p-2')[0].addEventListener('click', function () {
                        WearAsset(NewItemCard, item);
                    });
                })
                .catch(error => {
                    console.log('Fetch error: ' + error);
                });
        }
    });

    if (Array.from(Wearing.children).length === 0) {
        Wearing.innerHTML = 'No items to show.'
    }
}


/*
function LoadWearing() {
    const WearingItems = [
        ...Avatar.items,
        Avatar.shirt,
        Avatar.pants,
        Avatar.face
    ].filter(item => item !== null)

    Array.from(Wearing.children).forEach(element => {
        console.log('AAAAAAAAAAAA', element)
    })
}
*/

/*
function LoadWearing() {
    const AllItems = structuredClone(Avatar.items)
    AllItems.push(Avatar.shirt)
    AllItems.push(Avatar.pants)
    AllItems.push(Avatar.face)
    AllItems.forEach(item => {
        if (item !== null) {
            let Element = document.querySelector(`a[href="/store/${item}"]`)
            if (Element !== null) {
                console.log('exists - load wearing')
                Element = Element.parentElement.parentElement
                Wearing.appendChild(Element)
            } else if (Element === null) {
                console.log('doesn\' exist - load wearing')
                fetch('https://api.polytoria.com/v1/store/:id'.replace(':id', item))
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network not ok')
                        }
                        return response.json()
                    })
                    .then(item => {
                        let NewItemCard = document.createElement('div')
                        NewItemCard.classList = 'col-auto'
                        NewItemCard.innerHTML = ItemCardContents
                            .replace(':ItemName', item.name)
                            .replace(':ItemID', item.id)
                            .replace(':ItemType', item.type.charAt(0).toUpperCase() + item.type.substring(1))
                            .replace(':CreatorName', item.creator.name)
                            .replace(':CreatorID', item.creator.id)
                            .replace(':ItemThumbnail', item.thumbnail)
                        Wearing.appendChild(NewItemCard)
                        NewItemCard.getElementsByClassName('p-2')[0].addEventListener('click', function(){
                            WearAsset(NewItemCard, item)
                        });
                    })
                    .catch(error => {
                        console.log('Fetch error: ' + error)
                    });
            } else if (item.type === TabSelected) {
                console.log('item type is selected tab - load wearing')
                ItemGrid.appendChild(Element)
            } else {
                console.log('remove item - load wearing')
                Element.remove()
            }
        }
    });
}
*/