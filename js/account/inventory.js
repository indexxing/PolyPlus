if (window.location.pathname.split('/')[3] === "inventory") {
    let UserID = window.location.pathname.split('/')[2]
    if (UserID === JSON.parse(window.localStorage.getItem('account_info')).ID) {
        let Nav = document.getElementsByClassName('nav-pills')[0]
        let WishlistNav = document.createElement('li')
        WishlistNav.classList.add('nav-item')
        WishlistNav.innerHTML = `
        <a href="wishlist/" class="nav-link">
            <i class="fa-regular fa-sparkles me-1"></i>
            <span class="pilltitle">Item Wishlist</span>
        </a>
        `
        Nav.appendChild(WishlistNav)

        if (window.location.pathname.split('/')[4] === "wishlist") {
            let ItemGrid = document.getElementsByClassName('itemgrid')[0]
            let ItemCardContents = `
            <a href="/store/:ItemID" class="text-reset">
                <div class="card mb-2">
                    :LimitedTag
                    <div class="card-body">
                        <img src=":ItemThumbnail" class="img-fluid rounded">
                    </div>
                </div>
                <h6 class="text-truncate mb-0">
                    :ItemName
                </h6>
            </a>
            <small class="text-muted d-block mb-1">
                by <a href="/users/:CreatorID" class="text-muted">:CreatorName</a>
            </small>
            <button class="polyplus-itemwish-removebtn btn btn-danger btn-sm" style="width: 100%;">X</button>
            `

            Array.from(ItemGrid.children).forEach(element => {
                element.remove();
            });
            Array.from(Nav.children).forEach(element => {
                element = element.children[0]
                if (!(element === WishlistNav)) {
                    if (element.classList.contains('active')) {
                        element.classList.remove('active')
                    }
                }
            });
            WishlistNav.children[0].classList.add('active')
            let Search = document.createElement('div')
            Search.classList = 'row'
            Search.innerHTML = `
            <div class="col-auto">
                <select class="form-select" id="polyplus-itemwish-type" style="width: 150px;">
                    <option value="any">Any</option>
                    <option value="hat">Hat</option>
                    <option value="face">Faces</option>
                    <option value="tool">Tools</option>
                    <option value="shirt">Shirt</option>
                    <option value="pants">Pants</option>
                </select>
            </div>
            <div class="col">
                <input id="polyplus-itemwish-searchbar" type="text" class="form-control bg-dark" placeholder="Search...">
            </div>
            <div class="col-auto">
                <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="polyplus-itemwish-isLimited">
                <label class="form-check-label" for="polyplus-itemwish-isLimited">
                    Is Limited?
                    <span class="text-muted" style="font-size: 0.65rem; display: block;">Items that are limited</span>
                </label>
                </div>
            </div>
            <div class="col-auto">
                <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="polyplus-itemwish-isAvailable">
                <label class="form-check-label" for="polyplus-itemwish-isAvailable">
                    Is Available?
                    <span class="text-muted" style="font-size: 0.65rem; display: block; width: 170px;">Items that are equal to or less than the budget (excluding limiteds)</span>
                </label>
                </div>
            </div>
            `
            ItemGrid.parentElement.prepend(document.createElement('br'), ItemGrid.parentElement.children[0])
            ItemGrid.parentElement.prepend(Search, ItemGrid.parentElement.children[0])

            let Type = document.getElementById('polyplus-itemwish-type')
            let SearchBar = document.getElementById('polyplus-itemwish-searchbar')
            let IsLimited = document.getElementById('polyplus-itemwish-isLimited')
            let IsAvailable = document.getElementById('polyplus-itemwish-isAvailable')

            Type.addEventListener('change', function(){
                Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked)
            });

            SearchBar.addEventListener('change', function(){
                Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked)
            });

            IsLimited.addEventListener('change', function(){
                Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked)
            });

            IsAvailable.addEventListener('change', function(){
                Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked)
            });
            
            chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function(result){
                let Wishlist = result.PolyPlus_ItemWishlist || [];
                console.log('wishlist: ', Wishlist)
                Wishlist.forEach(element => {
                    let NewItemCard = document.createElement('div')
                    NewItemCard.classList = 'px-0'
                    fetch('https://api.polytoria.com/v1/store/:id'.replace(':id', element))
                        .then(response => response.json())
                        .then(data => {
                            NewItemCard.innerHTML = ItemCardContents.replace(':ItemID', data.id).replace(':ItemThumbnail', data.thumbnail).replace(':ItemName', data.name).replace(':CreatorID', data.creator.id).replace(':CreatorName', data.creator.name)
                            if (data.isLimited === true) {
                                NewItemCard.innerHTML = NewItemCard.innerHTML.replace(':LimitedTag', '<div class="ribbon ribbon-limited ribbon-top-right"><span>Limited</span></div>')
                            } else {
                                NewItemCard.innerHTML = NewItemCard.innerHTML.replace(':LimitedTag', '')
                            }
                            NewItemCard.setAttribute('data-id', data.id)
                            NewItemCard.setAttribute('data-name', data.name)
                            NewItemCard.setAttribute('data-type', data.type)
                            NewItemCard.setAttribute('data-creator', data.creator.name)
                            NewItemCard.setAttribute('data-limited', data.isLimited)
                            if (data.isLimited === false) {
                                NewItemCard.setAttribute('data-price', data.price)
                            }

                            ItemGrid.appendChild(NewItemCard)

                            NewItemCard.getElementsByClassName('polyplus-itemwish-removebtn')[0].addEventListener('click', function(){
                                let Index = Wishlist.indexOf(parseInt(NewItemCard.getAttribute('data-id')))
                                if (Index === -1) {
                                    NewItemCard.remove();
                                    return
                                } else {
                                    Wishlist.splice(Index, 1)
                                    console.log(Wishlist)
                                    NewItemCard.remove();
                                }
                                chrome.storage.sync.set({'PolyPlus_ItemWishlist': Wishlist, arrayOrder: true}, function() {
                                    console.log('ItemWishlist successfully saved: ' + ItemWishlist)
                                });
                            });
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                });
            });
        }
    }
}

function Update(type, query, isLimited, isAvailable) {
    let ItemGrid = document.getElementsByClassName('itemgrid')[0]
    let BrickBalance = parseInt(JSON.parse(window.localStorage.getItem('account_info')).Bricks)
    query = query.toLowerCase();
    let Results = Array.from(ItemGrid.children)
    for (let i = 0; i < Results.length; i++) {
        let Show = true

        console.log('type: ', type)
        if (!(type === 'any')) {
            console.log('isn\'t any')
            if (!(Results[i].getAttribute('data-type') === type)) {Show = false}
        }

        if (!(Results[i].getAttribute('data-name').toLowerCase().startsWith(query))) {Show = false}

        if (isLimited === true) {
            if (!(Results[i].getAttribute('data-limited') === 'true')) {Show = false}
        }

        if (isAvailable === true) {
            if (!(parseInt(Results[i].getAttribute('data-price')) <= BrickBalance)) {Show = false}
        }

        if (Show === true) {
            Results[i].style.display = 'block'
        } else {
            Results[i].style.display = 'none'
        }
    }
}