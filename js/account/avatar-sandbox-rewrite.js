let Utilities;

const Container = document.querySelector('.container.p-0.p-lg-5')
const ItemCache = {
    24122: {
        type: "hat",
        accessoryType: "hat",
        name: "Polytoria Cap",
        price: 0,
        creator: {
            name: "Polytoria",
            id: 1
        },
        thumbnail: "https://c0.ptacdn.com/thumbnails/assets/RR0VPd5hX30Fx5APwRBGObotf1xD1DRT.png",
        asset: "https://c0.ptacdn.com/assets/InBsL5bpJdp84ZPZGQMeHuyCBlo-uOv7.glb"
    },
    24118: {
        type: "shirt",
        name: "Green Polytoria Flannel",
        price: 0,
        creator: {
            name: "Polytoria",
            id: 1
        },
        thumbnail: "https://c0.ptacdn.com/thumbnails/assets/s7l57JugjbZfWTKAQ0cqTohOBraRbX5E.png",
        asset: "https://c0.ptacdn.com/assets/uWrrnFGwgNN5W171vqYTWY7E639rKiXK.png"
    },
    24123: {
        type: "pants",
        name: "Jeans",
        price: 0,
        creator: {
            name: "Polytoria",
            id: 1
        },
        thumbnail: "https://c0.ptacdn.com/thumbnails/assets/anebTuFMLg8NKhRL3ab7hbzCfmcsFqGO.png",
        asset: "https://c0.ptacdn.com/assets/HD6TFdXD8CaflRNmd84VCNyNsmTB0SH3.png"
    },
    37582: {
        type: "torso",
        name: "Slim Body",
        price: 0,
        creator: {
            name: "Polytoria",
            id: 1
        },
        thumbnail: "https://c0.ptacdn.com/thumbnails/assets/f_k-ZN_xmA_ALZiJQanOKT-Y4qq5kI1b.png",
        asset: "https://c0.ptacdn.com/assets/qoqZ2qPyaGvB3MLGgJZ6oLWTz-xxGo-8.glb"
    }
}
let Avatar = {
	useCharacter: true,
	items: [24122],
	shirt: 24118,
	pants: 24123,
	headColor: '#e0e0e0',
	torsoColor: '#e0e0e0',
	leftArmColor: '#e0e0e0',
	rightArmColor: '#e0e0e0',
	leftLegColor: '#e0e0e0',
	rightLegColor: '#e0e0e0'
};

/* Discovery */
let Page = 1
let PageCount = 1
let Search =  ""
let Sort = "createdAt"
let Order = "desc"
let ShowOffsale = true
let TabSelected = "hat"

!(async () => {
    Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
    Utilities = Utilities.default;

    chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
        Settings = result.PolyPlus_Settings || Utilities.DefaultSettings;

        if (Settings.AvatarSandboxOn || 1 === 1) {
            if (new URLSearchParams(window.location.search).has('sandbox')) {
                document.title = 'Poly+ Avatar Sandbox'
                PageLoad()
            } else {
                const SandboxButton = document.createElement('a');
                SandboxButton.classList = 'btn btn-outline-success w-100 mt-3';
                SandboxButton.href = '?sandbox=true';
                SandboxButton.innerHTML = '<i class="fas fa-shirt"></i> Avatar Sandbox';
                document.getElementById('cont-move').parentElement.appendChild(SandboxButton);
            }
        }
    })
})();

async function PageLoad() {
    const PageContents = (await ((await fetch(chrome.runtime.getURL('resources/avatar-sandbox.html'))).text()))
    Container.innerHTML = PageContents
    Utilities.InjectResource("registerTooltips")

    IFrame = document.getElementById('viewFrame')

    UpdateAvatar()
    LoadItems()

    const Tabs = document.getElementById('tabs')
    Array.from(Tabs.children).forEach((element) => {
        element.addEventListener('click', function () {
            let Link = element.getElementsByTagName('a')[0];
            if (!Link.classList.contains('active')) {
                Link.classList.add('active');
                Tabs.querySelector(`[data-tab="${TabSelected}"]`).classList.remove('active');
                TabSelected = Link.getAttribute('data-tab');
                Page = 1;
                LoadItems();
            }
        });
    });

    const ItemSearch = document.getElementById('search-btn')
    ItemSearch.addEventListener('click', function(){
        Search = ItemSearch.previousElementSibling.value
        Page = 1
        LoadItems()
    })

    const ItemSort = document.getElementById('item-sort')
    ItemSort.addEventListener('change', function(){
        Sort = ItemSort.options[ItemSort.selectedIndex].value
        Page = 1
        LoadItems()
    })

    const ItemOrder = document.getElementById('item-order')
    ItemOrder.addEventListener('change', function(){
        Order = ItemOrder.options[ItemOrder.selectedIndex].value
        Page = 1
        LoadItems()
    })

    /*
    Public API does not have an offsale parameter
    
    document.getElementById('show-offsale').addEventListener('change', function(){
        ShowOffsale = !ShowOffsale
        console.log(ShowOffsale)
        Page = 1
        LoadItems()
    })
    */

    // Pagination is annoying
    const First = document.getElementById('pagination-first');
    const Prev = document.getElementById('pagination-prev');
    const Next = document.getElementById('pagination-next');
    const Last = document.getElementById('pagination-last');

    if (Page > 0) {
        Prev.parentElement.classList.remove('disabled');
        First.parentElement.classList.remove('disabled');
    } else {
        Prev.parentElement.classList.add('disabled');
        First.parentElement.classList.add('disabled');
    }

    First.addEventListener('click', function () {
        if (Page > 1) {
            Page = 1;
            LoadItems();
        }
    });

    Prev.addEventListener('click', function () {
        if (Page > 1) {
            Page--;
            LoadItems();
        }
    });

    Next.addEventListener('click', function () {
        if (Page < PageCount) {
            Page++;
            LoadItems();
        }
    });

    Last.addEventListener('click', function () {
        if (Page < PageCount) {
            Page = PageCount;
            LoadItems();
        }
    });

    const ClearButton = document.getElementById('clear');
    ClearButton.addEventListener('click', function () {
        Avatar = {
            useCharacter: true,
            items: [24122],
            shirt: 24118,
            pants: 24123,
            headColor: '#e0e0e0',
            torsoColor: '#e0e0e0',
            leftArmColor: '#e0e0e0',
            rightArmColor: '#e0e0e0',
            leftLegColor: '#e0e0e0',
            rightLegColor: '#e0e0e0'
        };
        UpdateAvatar();
    });

    const LoadMyselfButton = document.getElementById('myself');
    LoadMyselfButton.addEventListener('click', function () {
        LoadUser(JSON.parse(window.localStorage.getItem('p+account_info')).ID);
    });

    const JSONUploadButton = document.getElementById('jsonUpload');
    JSONUploadButton.addEventListener('change', function () {
        const Reader = new FileReader();
        Reader.addEventListener('loadend', function () {
            Avatar = JSON.parse(Reader.result);
            UpdateAvatar();

            JSONUploadButton.value = '';
        });

        Reader.readAsText(JSONUploadButton.files[0]);
    });

    const JSONSaveButton = document.getElementById('jsonSave');
    JSONSaveButton.addEventListener('click', function () {
        const Download = document.createElement('a');
        Download.href = URL.createObjectURL(
            new Blob([JSON.stringify(Avatar)], {
                type: 'application/json'
            })
        );
        Download.setAttribute('download', 'AvatarSandbox.json');
        document.body.appendChild(Download);
        Download.click();
        document.body.removeChild(Download);
    });

    const OpenInNewTabButton = document.getElementById('openNewTab');
    OpenInNewTabButton.addEventListener('click', function () {
        window.open(IFrame, "_blank")
    });

    const LoadAsset = document.getElementById('load-asset')
    const LoadAssetType = document.getElementById('load-asset-type')
    LoadAsset.addEventListener('click', function(){
        const SelectedType = LoadAssetType.options[LoadAssetType.selectedIndex].value
        
        if (SelectedType !== 'user') {
            if (SelectedType === 'hat') {
                Avatar.items.push(LoadAsset.previousElementSibling.value);
            } else {
                Avatar[SelectedType] = parseInt(LoadAsset.previousElementSibling.value)
            }
            UpdateAvatar();
        } else {
            LoadUser(LoadAsset.previousElementSibling.value)
        }
    })
}

async function UpdateAvatar() {
    // Hats, Tools: https://api.polytoria.com/v1/assets/serve-mesh/ID
	// or: https://api.polytoria.com/v1/assets/serve/ID/Asset

    const FormattedAvatar = structuredClone(Avatar)

    const AccessoryPromise = [...Avatar.items, Avatar.tool, Avatar.torso].filter((x) => x !== undefined && !x.toString().startsWith('http') && !x.toString().startsWith('data:')).map(async (x, index) => {
        if (ItemCache[x] === undefined) {
            const ItemDetails = (await (await fetch('https://api.polytoria.com/v1/store/' + x)).json())
            ItemCache[x] = {
                type: ItemDetails.type,
                name: ItemDetails.name,
                price: ItemDetails.price,
                creator: {
                    name: ItemDetails.creator.name,
                    id: ItemDetails.creator.id
                },
                thumbnail: ItemDetails.thumbnail,
                asset: undefined
            }

            if (ItemDetails.type === 'hat') {
                ItemCache[x].accessoryType = ItemDetails.accessoryType
            }
        }
        
        if (ItemCache[x].asset === undefined) {
            const MeshURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + x)).json())
            if (MeshURL.success) {
                ItemCache[x].asset = MeshURL.url

                if (["mesh", "decal", "audio"].indexOf(ItemCache[x].type) !== -1) {
                    ItemCache[x].type = document.getElementById('load-asset-type').options[document.getElementById('load-asset-type').selectedIndex].value
                }

                if (ItemCache[x].type === 'hat') {
                    FormattedAvatar.items[index] = MeshURL.url
                } else {
                    FormattedAvatar[ItemCache[x].type] = MeshURL.url
                }
            }
        } else {
            if (ItemCache[x].type === 'hat') {
                FormattedAvatar.items[index] = ItemCache[x].asset
            } else {
                FormattedAvatar[ItemCache[x].type] = ItemCache[x].asset
            }
        }
    })

    const TexturePromise = [Avatar.shirt, Avatar.pants, Avatar.face].filter((x) => x !== undefined && !x.toString().startsWith('http') && !x.toString().startsWith('data:') && x !== undefined).map(async (x, index) => {
        if (ItemCache[x] === undefined) {
            const ItemDetails = (await (await fetch('https://api.polytoria.com/v1/store/' + x)).json())
            ItemCache[x] = {
                type: ItemDetails.type,
                name: ItemDetails.name,
                price: ItemDetails.price,
                creator: {
                    name: ItemDetails.creator.name,
                    id: ItemDetails.creator.id
                },
                thumbnail: ItemDetails.thumbnail,
                asset: undefined
            }

            if (ItemDetails.price === 0) {
                if (ItemDetails.sales === 0) {
                    ItemCache[x].price = null
                } else {
                    ItemCache[x].price = 0
                }
            }
        }
        
        if (ItemCache[x].asset === undefined) {
            const TextureURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve/' + x + '/Asset')).json())
            if (TextureURL.success) {
                ItemCache[x].asset = TextureURL.url
                if (x === Avatar.shirt) {
                    FormattedAvatar.shirt = TextureURL.url
                } else if (x === Avatar.pants) {
                    FormattedAvatar.pants = TextureURL.url
                } else if (x === Avatar.face) {
                    FormattedAvatar.face = TextureURL.url
                }
            }
        } else {
            if (x === Avatar.shirt) {
                FormattedAvatar.shirt = ItemCache[x].asset
            } else if (x === Avatar.pants) {
                FormattedAvatar.pants = ItemCache[x].asset
            } else if (x === Avatar.face) {
                FormattedAvatar.face = ItemCache[x].asset
            }
        }
    })

    if (Avatar.face === undefined) {
        FormattedAvatar.face = "https://c0.ptacdn.com/static/3dview/DefaultFace.png"
    }

    await Promise.all(AccessoryPromise)
    await Promise.all(TexturePromise)

    console.log('Real Avatar: ', Avatar)
	console.log('Formatted: ', FormattedAvatar)
    IFrame.addEventListener('load', function(){
        IFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(FormattedAvatar)))
    })
    IFrame.src = 'about:blank'

    UpdateBodyColors()
    LoadWearing()
}

async function LoadUser(id) {
	fetch('https://api.polytoria.com/v1/users/' + id + '/avatar')
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network not ok');
			}
			return response.json();
		})
		.then((data) => {
			Avatar.items = [];

			data.assets.forEach((item) => {
                if (ItemCache[item.id] === undefined) {
                    ItemCache[item.id] = {
                        type: item.type,
                        name: item.name,
                        price: null,
                        creator: null,
                        thumbnail: item.thumbnail,
                        asset: item.path
                    }
    
                    if (item.type === 'hat' || item.type === 'tool' || item.type === 'torso') {
                        ItemCache[item.id].creator = {
                            id: 1,
                            name: "Polytoria"
                        }
                    }
                }

                if (item.type === 'hat') {
                    ItemCache[item.id].accessoryType = item.accessoryType
                    Avatar.items.push(item.id)
                } else {
                    Avatar[item.type] = item.id
                }
			});

			Avatar.headColor = '#' + data.colors.head || '#cdcdcd';
			Avatar.torsoColor = '#' + data.colors.torso || '#cdcdcd';
			Avatar.leftArmColor = '#' + data.colors.leftArm || '#cdcdcd';
			Avatar.rightArmColor = '#' + data.colors.rightArm || '#cdcdcd';
			Avatar.leftLegColor = '#' + data.colors.leftLeg || '#cdcdcd';
			Avatar.rightLegColor = '#' + data.colors.rightLeg || '#cdcdcd';

			UpdateAvatar();
		})
		.catch((error) => {
			console.log(error);
		});
}

async function LoadItems() {
    document.getElementById('inventory').innerHTML = ''

    const Items = (await (await fetch('https://api.polytoria.com/v1/store?limit=12&order=' + Order + '&sort=' + Sort + '&showOffsale=' + ShowOffsale + '&types[]='+ TabSelected +'&search=' + Search + '&page=' + Page)).json())
    PageCount = Items.pages
    if (Page < PageCount) {
        document.getElementById('pagination-next').classList.remove('disabled');
        document.getElementById('pagination-last').classList.remove('disabled');
    } else {
        document.getElementById('pagination-next').classList.add('disabled');
        document.getElementById('pagination-last').classList.add('disabled');
    }
    if (Page > 1 && PageCount > 1) {
        console.log('aaa')
        console.log(Page > 1, PageCount > 1)
        document.getElementById('pagination-prev').classList.remove('disabled');
        document.getElementById('pagination-first').classList.remove('disabled');
    } else {
        document.getElementById('pagination-prev').classList.add('disabled');
        document.getElementById('pagination-first').classList.add('disabled');
    }
    document.getElementById('pagination-current').innerText = Page
    Items.assets.forEach(item => {
        const ItemColumn = document.createElement('div')
        ItemColumn.classList = 'col-auto'
        ItemColumn.innerHTML = `
        <div style="max-width: 150px;">
            <div class="card mb-2 avatar-item-container">
                <div class="p-2">
                    <img src="${item.thumbnail}" class="img-fluid">
                    ${ (item.type === 'hat') ? `
                    <span class="position-absolute" style="top: 5px; left: 5px; z-index: 1;">
                        <span class="badge bg-secondary">${CleanAccessoryType(item.accessoryType)}</span>
                    </span>
                    ` : ''}
                    <button class="avatarAction btn btn-success btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <a href="/store/${item.id}" class="text-reset">
                <h6 class="text-truncate mb-0">${item.name}</h6>
            </a>
            <small class="text-muted d-block text-truncate">
                by <a href="/users/${ (["hat", "tool", "face", "torso"].indexOf(item.type) !== -1) ? '1' : item.creator.id }" class="text-reset">${ (["hat", "tool", "face", "torso"].indexOf(item.type) !== -1) ? 'Polytoria' : item.creator.name }</a>
            </small>
            <small style="font-size: 0.8rem;" class="d-block text-truncate mb-2
                ${ (item.price === 0) ? 'text-primary fw-bold">Free' : (item.price !== "???") ? 'text-success"><i class="pi mr-1">$</i> ' + item.price : 'text-muted">???</small>' }
            </small>
        </div>
        `
        document.getElementById('inventory').appendChild(ItemColumn)

        ItemCache[item.id] = {
            type: item.type,
            name: item.name,
            price: item.price,
            creator: {
                name: item.creator.name,
                id: item.creator.id
            },
            thumbnail: item.thumbnail,
            asset: undefined
        }

        if (item.price === 0) {
            if (item.sales === 0) {
                console.log("ITEM IS AWARD-ONLY!!! ", item)
                ItemCache[item.id].price = null
            } else {
                ItemCache[item.id].price = 0
            }
        }

        if (item.type === 'hat') {
            ItemCache[item.id].accessoryType = item.accessoryType
        }

        ItemColumn.getElementsByClassName('p-2')[0].addEventListener('click', function(){
            WearAsset(item)
        })
    })
}

function LoadWearing() {
    document.getElementById('wearing').innerHTML = '';
    [...Avatar.items, Avatar.shirt, Avatar.pants, Avatar.torso].filter((x) => x !== undefined).forEach(id => {
        const Cached = Object.values(ItemCache)[Object.keys(ItemCache).indexOf(id.toString())]
        if (Cached !== undefined) {
            if (Cached.creator === undefined || Cached.creator === null) {
                Cached.creator = {
                    id: 1,
                    name: "-"
                }
            }

            if (Cached.price === undefined || Cached.price === null) { Cached.price = "???" }

            const ItemColumn = document.createElement('div')
            ItemColumn.classList = 'col-auto'
            ItemColumn.innerHTML = `
            <div style="max-width: 150px;">
                <div class="card mb-2 avatar-item-container">
                    <div class="p-2">
                        <img src="${Cached.thumbnail}" class="img-fluid">
                        ${ (Cached.type === 'hat') ? `
                        <span class="position-absolute" style="top: 5px; left: 5px; z-index: 1;">
                            <span class="badge bg-secondary">${CleanAccessoryType(Cached.accessoryType)}</span>
                        </span>
                        ` : ''}
                        <button class="avatarAction btn btn-danger btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <a href="/store/${id}" class="text-reset">
                    <h6 class="text-truncate mb-0">${Cached.name}</h6>
                </a>
                <small class="text-muted d-block text-truncate">
                    by <a href="/users/${Cached.creator.id || "1"}" class="text-reset">${Cached.creator.name || "-"}</a>
                </small>
                <small style="font-size: 0.8rem;" class="d-block text-truncate mb-2
                    ${ (Cached.price === 0) ? 'text-primary fw-bold">Free' : (Cached.price !== "???") ? 'text-success"><i class="pi mr-1">$</i> ' + Cached.price : 'text-muted">???</small>' }
                </small>
            </div>
            `
            document.getElementById('wearing').appendChild(ItemColumn)

            ItemColumn.getElementsByClassName('p-2')[0].addEventListener('click', function(){
                WearAsset(Cached)
            })
        }
    })
}

function WearAsset(details) {
    const ItemID = Object.keys(ItemCache)[Object.values(ItemCache).indexOf(details)]
    if (Avatar[details.type] !== details.id && Avatar.items.indexOf(details.id) === -1) {
        // Equip
        if (details.type === 'hat') {
            Avatar.items.push(details.id)
        } else {
            Avatar[details.type] = details.id
        }
    } else {
        // Unequip
        if (details.type === 'hat') {
            Avatar.items.splice(Avatar.items.indexOf(ItemID), 1);
        } else {
            Avatar[details.type] = undefined
        }
    }

    UpdateAvatar()
    LoadWearing()
}

function UpdateBodyColors() {
    const BodyColors = {
        head: Avatar.headColor,
        torso: Avatar.torsoColor,
        leftArm: Avatar.leftArmColor,
        rightArm: Avatar.rightArmColor,
        leftLeg: Avatar.leftLegColor,
        rightLeg: Avatar.rightLegColor
    }

    Object.keys(BodyColors).forEach((elementID, i) => {
        document.getElementById(elementID).style.backgroundColor = Object.values(BodyColors)[i]
    })
}

function CleanAccessoryType(type) {
    const CleanAccessoryTypes = {
        hat: "Hat",
        backAccessory: "Back Accessory",
        faceAccessory: "Face Accessory",
        headAttachment: "Head Attachment",
        hair: "Hair",
        neckAccessory: "Neck Accessory",
        headCover: "Head Cover",
        headAccessory: "Head Accessory"
    }
    return Object.values(CleanAccessoryTypes)[Object.keys(CleanAccessoryTypes).indexOf(type)] || "!!!"+type
}