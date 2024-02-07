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
    "items": [],
    "shirt": null,
    "pants": null,
    "tool": {ID: -1, URL: null},
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

    LoadFile(chrome.runtime.getURL('js/resources/avatar-sandbox.html'), function(html){
        PageContainer.innerHTML = html
        ItemGrid = document.getElementById('inventory')
        Wearing = document.getElementById('wearing')
        Tabs = document.getElementById('tabs')
        IFrame = document.getElementById('viewFrame')

        Search = document.getElementById('item-search')
        Search.addEventListener('change', function(){
            RefreshItems()
        });

        UpdateAvatar()
        RefreshItems()

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
                "items": [],
                "shirt": {ID: -1, URL: null},
                "pants": {ID: -1, URL: null},
                "tool": {ID: -1, URL: null},
                "headColor": "#e0e0e0",
                "torsoColor": "#e0e0e0",
                "leftArmColor": "#e0e0e0",
                "rightArmColor": "#e0e0e0",
                "leftLegColor": "#e0e0e0",
                "rightLegColor": "#e0e0e0"
            }
            UpdateAvatar()
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
            FormatAvatar().then(FormattedAvatar => {
                let Download = document.createElement('a')
                Download.href = URL.createObjectURL(new Blob([JSON.stringify(FormattedAvatar)], {
                    type: "application/json"
                }));
                Download.setAttribute('download', 'AvatarSandbox.json')
                document.body.appendChild(Download)
                Download.click()
                document.body.removeChild(Download)
            });
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

async function GenerateHash() {
    let FormattedAvatar = await FormatAvatar()
    for (let i = 0; i < FormattedAvatar.items.length; i++) {
        FormattedAvatar.items[i] = FormattedAvatar.items[i].URL
    }
    if (FormattedAvatar.shirt) {
        FormattedAvatar.shirt = FormattedAvatar.shirt.URL
    }
    if (FormattedAvatar.pants) {
        FormattedAvatar.pants = FormattedAvatar.pants.URL
    }
    FormattedAvatar.face = FormattedAvatar.face.URL
    if (FormattedAvatar.tool) {
        FormattedAvatar.tool = FormattedAvatar.tool.URL
    }
    console.log('Formatted Avatar: ', FormattedAvatar)
    console.log('Real Avatar: ', Avatar)
    return btoa(encodeURIComponent(JSON.stringify(FormattedAvatar)))
}

async function FormatAvatar() {
    let LocalAvatar = structuredClone(Avatar)

    if (!LocalAvatar.face) {
        LocalAvatar.face = {ID: -1, URL: "https://c0.ptacdn.com/static/3dview/DefaultFace.png"}
    }

    for (let i = 0; i < LocalAvatar.items.length; i++) {
        if (LocalAvatar.items[i].URL === null) {
            await fetch("https://api.polytoria.com/v1/assets/serve-mesh/:id".replace(':id', LocalAvatar.items[i].ID))
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    Avatar.items[i].URL = data.url
                    LocalAvatar.items[i].URL = data.url
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        }
    }

    if (LocalAvatar.tool && LocalAvatar.tool.ID !== -1 && LocalAvatar.tool.URL === null) {
        await fetch("https://api.polytoria.com/v1/assets/serve-mesh/:id".replace(':id', LocalAvatar.tool.ID))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                Avatar.tool.URL = data.url
                LocalAvatar.tool.URL = data.url
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    if (LocalAvatar.face.ID !== -1 && LocalAvatar.face.URL === null) {
        await fetch("https://api.polytoria.com/v1/assets/serve/:id/Asset".replace(':id', LocalAvatar.face.ID))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                Avatar.face.URL = data.url
                LocalAvatar.face.URL = data.url
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    if (LocalAvatar.shirt && LocalAvatar.shirt.ID !== -1 && LocalAvatar.shirt.URL === null) {
        await fetch("https://api.polytoria.com/v1/assets/serve/:id/Asset".replace(':id', LocalAvatar.shirt.ID))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                Avatar.shirt.URL = data.url
                LocalAvatar.shirt.URL = data.url
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    if (LocalAvatar.pants && LocalAvatar.pants.ID !== -1 && LocalAvatar.pants.URL === null) {
        await fetch("https://api.polytoria.com/v1/assets/serve/:id/Asset".replace(':id', LocalAvatar.pants.ID))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                Avatar.pants.URL = data.url
                LocalAvatar.pants.URL = data.url
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    return LocalAvatar
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
                NewItemCard.innerHTML = ItemCardContents.replace(':ItemName', item.name).replace().replace(':ItemID', item.id).replace(':ItemType', item.type.replace(item.type.charAt(0), item.type.charAt(0).toUpperCase())).replace(':CreatorName', item.creator.name).replace(':CreatorID', item.creator.id).replace(':ItemThumbnail', item.thumbnail)
                NewItemCard.getElementsByClassName('p-2')[0].addEventListener('click', function(){
                    WearAsset(NewItemCard, item.name, {Name: item.creator.name, ID: item.creator.id}, item.id, item.type, item.thumbnail)
                });

                ItemGrid.appendChild(NewItemCard)
            });
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function WearAsset(element, name, creator, id, type, thumbnail) {
    switch (type) {
        case 'hat':
            let Index = CheckItemID(Avatar.items, id)
            if (Index === -1) {
                if (Avatar.items.length !== 3) {
                    Avatar.items.push({Name: name, Creator: creator, ID: id, URL: null, Thumbnail: thumbnail})
                    Wearing.prepend(ItemGrid.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                } else {
                    Avatar.items.splice(0, 1)
                    Avatar.items.push({Name: name, Creator: creator, ID: id, URL: null, Thumbnail: thumbnail})
                    if (TabSelected === type) {
                        console.log('tab is', TabSelected, type)
                        ItemGrid.prepend(Wearing.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                    }
                }
            } else {
                console.log('remove')
                Avatar.items.splice(Index, 1)
                if (TabSelected === type) {
                    console.log('tab is', TabSelected, type)
                    ItemGrid.prepend(Wearing.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                }
            }
            break
        case 'face':
            if (Avatar.face && Avatar.face.ID !== id) {
                Avatar.face = {Name: name, Creator: creator, ID: id, URL: null, Thumbnail: thumbnail}
                Wearing.prepend(ItemGrid.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
            } else {
                Avatar.face = {Name: "Default Face", Creator: {Name: "Polytoria", ID: 1}, ID: -1, URL: "https://c0.ptacdn.com/static/3dview/DefaultFace.png", Thumbnail: "https://c0.ptacdn.com/static/3dview/DefaultFace.png"}
                if (TabSelected === type) {
                    console.log('tab is', TabSelected, type)
                    ItemGrid.prepend(Wearing.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                }
            }
            break
        case 'tool':
            if (Avatar.tool && Avatar.tool.ID !== id) {
                Avatar.tool = {Name: name, Creator: creator, ID: id, URL: null, Thumbnail: thumbnail}
                Wearing.prepend(ItemGrid.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
            } else {
                Avatar.tool = null
                if (TabSelected === type) {
                    console.log('tab is', TabSelected, type)
                    ItemGrid.prepend(Wearing.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                }
            }
            break
        case 'shirt':
            if (Avatar.shirt.ID !== id) {
                Avatar.shirt = {Name: name, Creator: creator, ID: id, URL: null, Thumbnail: thumbnail}
                Wearing.prepend(ItemGrid.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
            } else {
                Avatar.shirt = null
                if (TabSelected === type) {
                    console.log('tab is', TabSelected, type)
                    ItemGrid.prepend(Wearing.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                }
            }
            break
        case 'pants':
            if (Avatar.pants.ID !== id) {
                Avatar.pants = {Name: name, Creator: creator, ID: id, URL: null, Thumbnail: thumbnail}
                Wearing.prepend(ItemGrid.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
            } else {
                Avatar.pants = null
                if (TabSelected === type) {
                    console.log('tab is', TabSelected, type)
                    ItemGrid.prepend(Wearing.querySelector(`.col-auto:has(a[href="/store/${id}"])`))
                }
            }
            break
    }

    UpdateAvatar()
}

function CheckItemID(object, id) {
    for (let i = 0; i < object.length; i++) {
        if (object[i] === id || object[i].ID === id) {
            console.log('Index: ' + i)
            return i
        }
    }
    return -1
}