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
    }
    /*
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
        */
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
let RetroItems = null
let Outfits = null

/* Customization */
let SelectedBodyPart

!(async () => {
    Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
    Utilities = Utilities.default;

    chrome.storage.sync.get(['PolyPlus_Settings', 'PolyPlus_AvatarSandboxOutfits'], function(result){
        Settings = result.PolyPlus_Settings || Utilities.DefaultSettings;
        Outfits = result.PolyPlus_AvatarSandboxOutfits || [];

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
                ItemSearch.previousElementSibling.value = ''
                Page = 1;
                Search = ""
                LoadItems();
            }
        });
    });

    const BodyColorsModal = document.getElementById('p+body_colors')
    const BodyParts = Array.from(document.getElementsByClassName('bodypart'))
    BodyParts.forEach(part => {
        part.addEventListener('click', function(){
            SelectedBodyPart = part.id
            BodyColorsModal.showModal()
        })
    })

    const BodyColors = Array.from(document.getElementsByClassName('colorpicker-color'))
    BodyColors.forEach(color => {
        color.addEventListener('click', function(){
            Avatar[SelectedBodyPart+'Color'] = color.style.backgroundColor
            BodyColorsModal.close()
            UpdateAvatar()
        })
    })

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

    const LoadAsset = document.getElementById('load-asset')
    const LoadAssetType = document.getElementById('load-asset-type')
    LoadAsset.addEventListener('click', function(){
        const SelectedType = LoadAssetType.options[LoadAssetType.selectedIndex].value

        if (LoadAsset.previousElementSibling.value === "trofie") {
            LoadAsset.previousElementSibling.value = 31501
        }
        
        if (SelectedType !== 'user') {
            if (SelectedType === 'hat') {
                Avatar.items.push(LoadAsset.previousElementSibling.value);
            } else {
                if (!isNaN(LoadAsset.previousElementSibling.value)) {
                    Avatar[SelectedType] = parseInt(LoadAsset.previousElementSibling.value)
                } else {
                    Avatar[SelectedType] = LoadAsset.previousElementSibling.value
                }
            }
            UpdateAvatar();
        } else {
            LoadUser(LoadAsset.previousElementSibling.value)
        }

        LoadAsset.previousElementSibling.value = ""
    })

    const SaveButton = document.getElementById('saveOutfit')
    const OutfitCreateModal = document.getElementById('p+outfit_create')
    const OutfitCreateButton = document.getElementById('p+save_outfit_confirm')
    const OutfitCreateError = document.getElementById('p+outfit_create_error')
    SaveButton.addEventListener('click', function(){
        console.log(Outfits)
        OutfitCreateModal.showModal()
    })

    OutfitCreateButton.addEventListener('click', function(){
        let OutfitName = OutfitCreateButton.previousElementSibling.value.trim()
        OutfitCreateButton.previousElementSibling.value = ''
        if (OutfitName === '') {
            OutfitCreateError.classList = 'text-danger';
            OutfitCreateError.innerHTML = '<i class="fa-duotone fa-circle-exclamation mr-1"></i> You cannot name an outfit nothing.';
            return
        } else if (OutfitName.length > 25) {
            OutfitName = OutfitName.substring(0, 25)
        } else if (Outfits.findIndex((x) => x.name.trim() === OutfitName) !== -1) {
            OutfitCreateError.classList = 'text-danger';
            OutfitCreateError.innerHTML = '<i class="fa-duotone fa-circle-exclamation mr-1"></i> You already have an outfit with the name "' + OutfitName + '".';
            return
        }
        OutfitCreateModal.close()
        Outfits.push({
            name: OutfitName,
            createdAt: new Date().getTime(),
            data: Avatar
        })
        if (TabSelected === 'outfit') {
            LoadItems()
        }

        chrome.storage.sync.set({'PolyPlus_AvatarSandboxOutfits': Outfits}, function(){
            console.log('Saved outfits!')
        })
    })

    document.getElementById('view-cache').addEventListener('click', function(){
        console.log('Cache: ', ItemCache)
    })
}

async function UpdateAvatar() {
    // Hats, Tools: https://api.polytoria.com/v1/assets/serve-mesh/ID
	// or: https://api.polytoria.com/v1/assets/serve/ID/Asset

    const FormattedAvatar = structuredClone(Avatar)

    const AccessoryPromise = [...Avatar.items, Avatar.tool].filter((x) => x !== undefined && !x.toString().startsWith('http') && !x.toString().startsWith('data:')).map(async (x, index) => {
        if (ItemCache[x] === undefined) {
            try {
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
            } catch(error) {
                ItemCache[x] = {
                    type: "unknown",
                    name: "#" + x,
                    price: null,
                    creator: null,
                    thumbnail: "https://c0.ptacdn.com/static/images/broken.136e44ee.png",
                    asset: undefined,
                    ribbon: "unknown"
                }
            }

            if (["mesh", "decal", "audio"].indexOf(ItemCache[x].type) !== -1) {
                ItemCache[x].type = document.getElementById('load-asset-type').options[document.getElementById('load-asset-type').selectedIndex].value
                ItemCache[x].ribbon = 'custom'
            }
        }
        
        if (ItemCache[x].asset === undefined) {
            const MeshURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + x)).json())
            if (MeshURL.success) {
                ItemCache[x].asset = MeshURL.url

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

    const TexturePromise = [Avatar.shirt, Avatar.pants, Avatar.face, Avatar.torso].filter((x) => x !== undefined && !x.toString().startsWith('http') && !x.toString().startsWith('data:') && x !== undefined).map(async (x, index) => {
        if (ItemCache[x] === undefined) {
            try {
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
            } catch(error) {
                ItemCache[x] = {
                    type: "unknown",
                    name: "#" + x,
                    price: null,
                    creator: null,
                    thumbnail: "https://c0.ptacdn.com/static/images/broken.136e44ee.png",
                    asset: undefined,
                    ribbon: "unknown"
                }
            }

            if (["mesh", "decal", "audio"].indexOf(ItemCache[x].type) !== -1) {
                ItemCache[x].ribbon = 'custom'
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
                } else if (x === Avatar.torso) {
                    FormattedAvatar.torso = TextureURL.url
                }
            }
        } else {
            if (x === Avatar.shirt) {
                FormattedAvatar.shirt = ItemCache[x].asset
            } else if (x === Avatar.pants) {
                FormattedAvatar.pants = ItemCache[x].asset
            } else if (x === Avatar.face) {
                FormattedAvatar.face = ItemCache[x].asset
            } else if (x === Avatar.torso) {
                FormattedAvatar.torso = ItemCache[x].asset
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
			Avatar = {
                useCharacter: true,
                items: [],
                headColor: '#' + data.colors.head || '#cdcdcd',
                torsoColor: '#' + data.colors.torso || '#cdcdcd',
                leftArmColor: '#' + data.colors.leftArm || '#cdcdcd',
                rightArmColor: '#' + data.colors.rightArm || '#cdcdcd',
                leftLegColor: '#' + data.colors.leftLeg || '#cdcdcd',
                rightLegColor: '#' + data.colors.rightLeg || '#cdcdcd'
            };

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

			UpdateAvatar();
		})
		.catch((error) => {
			console.log(error);
		});
}

async function LoadItems() {
    document.getElementById('inventory').innerHTML = ''

    let Items;
    if (['retro', 'outfit'].indexOf(TabSelected) === -1) {
        Items = (await (await fetch('https://api.polytoria.com/v1/store?limit=12&order=' + Order + '&sort=' + Sort + '&showOffsale=' + ShowOffsale + '&types[]='+ TabSelected +'&search=' + Search + '&page=' + Page)).json())
    } else if (TabSelected === 'outfit') {
        const OutfitsClone = structuredClone(Outfits)
        let Groups = []
        while (OutfitsClone.length > 0) {
            Groups.push(OutfitsClone.splice(0, 12));
        }

        console.log(Groups, OutfitsClone)
        Items = {
            assets: Groups[Page - 1],
            pages: Groups.length
        }
    } else if (TabSelected === 'retro') {
        if (RetroItems === null) {
            Items = (await (await fetch('https://poly-upd-archival.pages.dev/data.json')).json())
            Object.values(Items).forEach((item, index) => {
                item.id = parseInt(Object.keys(Items)[index])
                item.thumbnail = 'https://poly-archive.pages.dev/assets/thumbnails/' + item.id + '.png'
                item.creator = {
                    id: 1,
                    name: "Polytoria"
                }
                if (item.asset === undefined) {
                    item.asset = 'https://poly-upd-archival.pages.dev/glb/' + item.id + '.glb'
                }
                item.id = item.id*-1
                item.ribbon = 'retro'
                ItemCache[item.id] = item
            })

            const PaginationItems = Object.values(Items)
            let Groups = []
            while (PaginationItems.length > 0) {
                Groups.push(PaginationItems.splice(0, 12));
            }

            Items = {
                assets: Groups[Page - 1],
                pages: Groups.length
            }

            RetroItems = Groups
        } else {
            Items = {
                assets: RetroItems[Page - 1],
                pages: RetroItems.length
            }
        }
    }
    PageCount = Items.pages
    if (Page < PageCount) {
        document.getElementById('pagination-next').classList.remove('disabled');
        document.getElementById('pagination-last').classList.remove('disabled');
    } else {
        document.getElementById('pagination-next').classList.add('disabled');
        document.getElementById('pagination-last').classList.add('disabled');
    }
    if (Page > 1 && PageCount > 1) {
        document.getElementById('pagination-prev').classList.remove('disabled');
        document.getElementById('pagination-first').classList.remove('disabled');
    } else {
        document.getElementById('pagination-prev').classList.add('disabled');
        document.getElementById('pagination-first').classList.add('disabled');
    }
    document.getElementById('pagination-current').innerText = Page

    if (Items.assets === undefined) { Items.assets = [] }
    if (Items.assets.length > 0) {
        document.getElementById('inventory').classList.add('itemgrid')
        if (TabSelected !== 'outfit') {
            Items.assets.forEach(item => {
                if (TabSelected !== "retro" && item.price === null) {
                    item.price = false
                }

                const Ribbon = ChooseRibbon(item, false)

                const ItemColumn = document.createElement('div')
                ItemColumn.classList = 'col-auto'
                ItemColumn.innerHTML = `
                <div style="max-width: 150px;">
                    <div class="card mb-2 avatar-item-container">
                        ${ (Ribbon !== null) ? Ribbon : '' }
                        <div class="p-2">
                            <img src="${item.thumbnail}" class="img-fluid" style="border-radius: 10px;">
                            <button class="avatarAction btn btn-success btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <a href="${ (Math.abs(item.id) === item.id) ? '/store/' + item.id : 'https://poly-archive.vercel.app/archive/' + Math.abs(item.id) }" class="text-reset">
                        <h6 class="text-truncate mb-0">${item.name}</h6>
                    </a>
                    <small class="text-muted d-block text-truncate">
                        ${FormatTypeDisplay(item)}
                    </small>
                    <small style="font-size: 0.8rem;" class="d-block text-truncate mb-2
                       ${FormatPrice(item.price)}
                    </small>
                </div>
                `
                document.getElementById('inventory').appendChild(ItemColumn)
        
                if (ItemCache[item.id] === undefined && TabSelected !== "retro") {
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
            
                    if (item.type === 'hat') {
                        ItemCache[item.id].accessoryType = item.accessoryType
                    }

                    if (item.isLimited) {
                        ItemCache[item.id].ribbon = 'limited'
                    }
                }
        
                ItemColumn.getElementsByClassName('p-2')[0].addEventListener('click', function(){
                    WearAsset(item, item.id)
                })
                if (Ribbon !== null) {
                    ItemColumn.getElementsByClassName('ribbon')[0].addEventListener('click', function(){
                        WearAsset(item, item.id)
                    })
                }
            })
        } else {
            Items.assets.forEach((outfit, index) => {
                const ItemColumn = document.createElement('div')
                ItemColumn.classList = 'col-auto'
                ItemColumn.innerHTML = `
                <div style="max-width: 150px;">
                    <div class="card mb-2">
                        <div class="p-2 text-center">
                            <div class="mb-1">
                                <button style="border: 0; border-radius: 5px; cursor: default; background-color: ${outfit.data.headColor}; padding: 15px;"></button>
                            </div>
                            <div class="mb-1">
                                <button style="border: 0; border-radius: 5px; cursor: default; background-color: ${outfit.data.leftArmColor}; padding: 10px; padding-top: 20px; padding-bottom: 20px;"></button>
                                <button style="border: 0; border-radius: 5px; cursor: default; background-color: ${outfit.data.torsoColor}; padding: 20px;"></button>
                                <button style="border: 0; border-radius: 5px; cursor: default; background-color: ${outfit.data.rightArmColor}; padding: 20px; padding: 10px; padding-top: 20px; padding-bottom: 20px;"></button>
                            </div>
                            <button style="border: 0; border-radius: 5px; cursor: default; background-color: ${outfit.data.leftLegColor}; padding: 10px; padding-top: 20px; padding-bottom: 20px;"></button>
                            <button style="border: 0; border-radius: 5px; cursor: default; background-color: ${outfit.data.rightLegColor}; padding: 10px; padding-top: 20px; padding-bottom: 20px;"></button>
                        </div>
                    </div>
                    <h6 class="text-truncate mb-0 text-reset text-center mb-2">${outfit.name}</h6>
                    <div class="btn-group w-100">
                        <button class="btn btn-primary btn-sm p+outfit_wear_button">Wear</button>
                        <div class="btn-group">
                            <button type="button" class="btn btn-warning dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fa-duotone fa-wrench"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item text-primary p+outfit_rename_button" href="#">
                                        <i class="fa-solid fa-signature"></i>
                                        Rename
                                    </a>
                                </li>
                                <li>
                                    <span class="p+outfit_overwrite_button dropdown-item text-warning">
                                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                                        <span>Overwrite</span>
                                    </span>
                                </li>
                                <li>
                                    <hr class="dropdown-divider">
                                </li>
                                <li>
                                    <span class="p+outfit_delete_button dropdown-item text-danger">
                                        <i class="fa-duotone fa-trash"></i>
                                        <span>Delete</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                `
                document.getElementById('inventory').appendChild(ItemColumn)
                Utilities.InjectResource("registerTooltips")
    
                ItemColumn.getElementsByClassName('p+outfit_wear_button')[0].addEventListener('click', async function(){
                    if (Avatar === outfit.data) {
                        return
                    }
                    console.log('Equipped Outfit: ', outfit)
                    if (RetroItems === null) {
                        Items = (await (await fetch('https://poly-upd-archival.pages.dev/data.json')).json())
                        Object.values(Items).forEach((item, index) => {
                            item.id = parseInt(Object.keys(Items)[index])
                            item.thumbnail = 'https://poly-archive.pages.dev/assets/thumbnails/' + item.id + '.png'
                            item.creator = {
                                id: 1,
                                name: "Polytoria"
                            }
                            if (item.asset === undefined) {
                                item.asset = 'https://poly-upd-archival.pages.dev/glb/' + item.id + '.glb'
                            }
                            item.id = item.id*-1
                            item.ribbon = 'retro'
                            ItemCache[item.id] = item
                        })
            
                        const PaginationItems = Object.values(Items)
                        let Groups = []
                        while (PaginationItems.length > 0) {
                            Groups.push(PaginationItems.splice(0, 12));
                        }
            
                        Items = {
                            assets: Groups[Page - 1],
                            pages: Groups.length
                        }
            
                        RetroItems = Groups
                    }
                    Avatar = outfit.data
                    UpdateAvatar()
                })
    
                const OutfitRenameModal = document.getElementById('p+outfit_rename')
                const OutfitRenameButton = document.getElementById('p+rename_outfit_confirm')
                const OutfitRenameError = document.getElementById('p+outfit_rename_error')
                ItemColumn.getElementsByClassName('p+outfit_rename_button')[0].addEventListener('click', function(){
                    OutfitRenameModal.showModal()
                    document.getElementById('p+outfit_rename_name').innerText = outfit.name
                    OutfitRenameButton.previousElementSibling.value = outfit.name
                })
    
                OutfitRenameButton.addEventListener('click', function(){
                    let OutfitName = OutfitRenameButton.previousElementSibling.value.trim()
                    OutfitRenameButton.previousElementSibling.value = ''
                    if (OutfitName === '') {
                        OutfitRenameError.classList = 'text-danger';
                        OutfitRenameError.innerHTML = '<i class="fa-duotone fa-circle-exclamation mr-1"></i> You cannot name an outfit nothing.';
                        return
                    } else if (OutfitName.length > 25) {
                        OutfitName = OutfitName.substring(0, 25)
                    } else if (Outfits.findIndex((x) => x.name.trim() === OutfitName) !== -1) {
                        OutfitRenameError.classList = 'text-danger';
                        OutfitRenameError.innerHTML = '<i class="fa-duotone fa-circle-exclamation mr-1"></i> You already have an outfit with the name "' + OutfitName + '".';
                        return
                    }
                    OutfitRenameModal.close()
                    Outfits[index].name = OutfitName
                    if (TabSelected === 'outfit') {
                        LoadItems()
                    }
    
                    chrome.storage.sync.set({'PolyPlus_AvatarSandboxOutfits': Outfits}, function(){
                        console.log('Saved outfits!')
                    })
                })
    
                let OverwritePending = false
                const OutfitOverwriteButton = ItemColumn.getElementsByClassName('p+outfit_overwrite_button')[0]
                OutfitOverwriteButton.addEventListener('click', function(e){
                    e.stopPropagation()
                    if (OverwritePending === false) {
                        OverwritePending = true
                        OutfitOverwriteButton.children[1].innerText = 'Are you sure?'
                        setTimeout(function (){
                            if (OverwritePending === true) {
                                OutfitOverwriteButton.children[1].innerText = 'Overwrite'
                                OverwritePending = false
                            }
                        }, 3000)
                    } else {
                        OverwritePending = false
                        console.log('Overwrite Outfit (outfit, avatar): ', outfit, Avatar)
    
                        Outfits[index].data = Avatar
                        if (TabSelected === 'outfit') {
                            LoadItems()
                        }
    
                        chrome.storage.sync.set({'PolyPlus_AvatarSandboxOutfits': Outfits}, function(){
                            console.log('Saved outfits!')
                        })
                    }
                })
    
                let DeletePending = false
                const OutfitDeleteButton = ItemColumn.getElementsByClassName('p+outfit_delete_button')[0]
                OutfitDeleteButton.addEventListener('click', function(e){
                    e.stopPropagation()
                    if (DeletePending === false) {
                        DeletePending = true
                        OutfitDeleteButton.children[1].innerText = 'Are you sure?'
                        setTimeout(function (){
                            if (DeletePending === true) {
                                OutfitDeleteButton.children[1].innerText = 'Delete'
                                DeletePending = false
                            }
                        }, 3000)
                    } else {
                        DeletePending = false
                        console.log('Deleted Outfit: ', outfit)
    
                        Outfits.splice(index, 1)
                        if (TabSelected === 'outfit') {
                            LoadItems()
                        }
    
                        chrome.storage.sync.set({'PolyPlus_AvatarSandboxOutfits': Outfits}, function(){
                            console.log('Saved outfits!')
                        })
                    }
                })
            })
        }
    } else {
        document.getElementById('inventory').classList.remove('itemgrid')
        document.getElementById('inventory').innerHTML = `
        <div class="text-muted" style="padding: 37px 30px;">
			<h1 class="display-3">
				<i class="fas fa-box-open"></i>
			</h1>
			<h6 class="mb-0">
				You do not have any items matching this	type or search query. Find new items in the <a href="/store">store</a>!
			</h6>
		</div>
        `
    }
}

function LoadWearing() {
    document.getElementById('wearing').innerHTML = '';
    [...Avatar.items, Avatar.face, Avatar.shirt, Avatar.pants, Avatar.tool, Avatar.torso].filter((x) => x !== undefined).forEach(id => {
        const Cached = Object.values(ItemCache)[Object.keys(ItemCache).indexOf(id.toString())]
        if (Cached !== undefined) {
            if (Cached.creator === undefined || Cached.creator === null) {
                Cached.creator = {
                    id: 1,
                    name: "-"
                }
            }

            if (Cached.price === undefined || Cached.price === null) { Cached.price = "???" }

            const Ribbon = ChooseRibbon(Cached, true)

            const ItemColumn = document.createElement('div')
            ItemColumn.classList = 'col-auto'
            ItemColumn.innerHTML = `
            <div style="max-width: 150px;">
                <div class="card mb-2 avatar-item-container">
                    ${ (Ribbon !== null) ? Ribbon : '' }
                    <div class="p-2">
                        <img src="${Cached.thumbnail}" class="img-fluid" style="border-radius: 10px;">
                        <button class="avatarAction btn btn-danger btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <a href="${ (Math.abs(id) === id) ? '/store/' + id : 'https://poly-archive.vercel.app/archive/' + Math.abs(id) }" class="text-reset">
                    <h6 class="text-truncate mb-0">${Cached.name}</h6>
                </a>
                <small class="text-muted d-block text-truncate">
                    ${FormatTypeDisplay(Cached)}
                </small>
                <small style="font-size: 0.8rem;" class="d-block text-truncate mb-2
                    ${FormatPrice(Cached.price)}
                </small>
            </div>
            `
            document.getElementById('wearing').appendChild(ItemColumn)

            ItemColumn.getElementsByClassName('p-2')[0].addEventListener('click', function(){
                WearAsset(Cached, id)
            })
            if (Ribbon !== null) {
                ItemColumn.getElementsByClassName('ribbon')[0].addEventListener('click', function(){
                    WearAsset(Cached, id)
                })
            }
        }
    })
}

function WearAsset(details, id) {
    if (Avatar[details.type] !== id && Avatar.items.indexOf(id) === -1) {
        // Equip
        if (details.type === 'hat') {
            Avatar.items.push(id)
        } else {
            Avatar[details.type] = id
        }
    } else {
        // Unequip
        if (details.type === 'hat') {
            Avatar.items.splice(Avatar.items.indexOf(parseInt(id)), 1);
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
        headAccessory: "Head Accessory",
        frontAccessory: "Front Accessory"
    }
    return Object.values(CleanAccessoryTypes)[Object.keys(CleanAccessoryTypes).indexOf(type)] || type
}

function FormatPrice(price) {
    if (price === 0) {
        return 'text-primary fw-bold">Free</small>'
    } else if (price === false) {
        return 'text-muted fw-bold">Offsale</small>'
    } else if (price === null) {
        return 'text-muted">???</small>'
    } else if (price !== "???") {
        return 'text-success"><i class="pi mr-1">$</i> ' + price + '</small>'
    } else {
        return 'text-muted">???</small>'
    }
    return '">how did this happen</small>'
}

function ChooseRibbon(item, wearing) {
    const NewDateAgo = new Date();
    NewDateAgo.setDate(NewDateAgo.getDate() - 3);

    if (item.ribbon === 'custom') {
        return '<div class="ribbon ribbon-polyplus-custom ribbon-top-right"><span>Custom</span></div>';
    } else if (item.ribbon === 'unknown') {
        return '<div class="ribbon ribbon-polyplus-unknown ribbon-top-right"><span><i>?</i></span></div>';
    } else if (item.ribbon === 'retro' && wearing === true) {
        return '<div class="ribbon ribbon-polyplus-retro ribbon-top-right"><span>Retro</span></div>';
    } else if (item.isLimited) {
        return '<div class="ribbon ribbon-limited ribbon-top-right"><span><i class="fas fa-star"></i></span></div>';
    } else if (new Date(item.createdAt) > NewDateAgo) {
        return '<div class="ribbon ribbon-new ribbon-top-right"><span>New</span></div>';
    } else {
        return null
    }
}

function FormatTypeDisplay(item) {
    if (["hat", "tool", "face", "torso"].indexOf(item.type) !== -1) {
        if (item.type === "hat") {
            return CleanAccessoryType(item.accessoryType)
        } else if (item.type === "torso") {
            return "Body Part"
        } else {
            return item.type.substring(0, 1).toUpperCase() + item.type.substring(1)
        }
    } else {
        return 'by <a class="text-muted" href="/u/' + item.creator.name + '">' + item.creator.name + '</a>'
    }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if ('PolyPlus_AvatarSandboxOutfits' in changes) {
        chrome.storage.sync.get(['PolyPlus_AvatarSandboxOutfits'], function (result) {
            Outfits = result.PolyPlus_AvatarSandboxOutfits || [];
        });
    }
})