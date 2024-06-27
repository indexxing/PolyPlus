/*
	Proper pagination will be added in v1.2.3
*/

Username = window.location.pathname.split('/')[2];
let UserID;
let ItemGrid;

if (window.location.pathname.split('/')[3] === 'inventory') {
	!(async () => {
		UserID = (await (await fetch('https://api.polytoria.com/v1/users/find?username=' + Username )).json()).id;
		ItemGrid = document.getElementsByClassName('itemgrid')[0];

		/*
			Rewritten item wishlist function will take in the data with a parameter instead
		*/
		chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
			Settings = result.PolyPlus_Settings

			const Nav = document.getElementsByClassName('nav-pills')[0];

			if (Settings.ItemWishlistOn && Username === JSON.parse(window.localStorage.getItem('p+account_info')).Username) {
				let WishlistNav = document.createElement('li');
				WishlistNav.classList.add('nav-item');
				WishlistNav.innerHTML = `
				<a href="${ (window.location.pathname.split('/')[4] !== '') ? '../wishlist/' : 'wishlist/' }" class="nav-link">
					<i class="fa-regular fa-list me-1"></i>
					<span class="pilltitle">Item Wishlist</span>
				</a>
				`;
				Nav.appendChild(WishlistNav);
	
				if (window.location.pathname.split('/')[4] === 'wishlist') {
					Array.from(Nav.children).forEach((element) => {
						element = element.children[0];
						if (!(element === WishlistNav)) {
							if (element.classList.contains('active')) {
								element.classList.remove('active');
							}
						}
					});
					WishlistNav.children[0].classList.add('active');

					ItemWishlist()
				}
			}

			if (Settings.CollectibleInventoryCatOn) {
				let CollectibleNav = document.createElement('li');
				CollectibleNav.classList.add('nav-item');
				CollectibleNav.innerHTML = `
				<a href="${ (window.location.pathname.split('/')[4] !== '') ? '../collectibles/' : 'collectibles/' }" class="nav-link">
					<i class="fa-regular fa-sparkles me-1"></i>
					<span class="pilltitle">Collectibles</span>
				</a>
				`;
				Nav.appendChild(CollectibleNav);
				
				if (window.location.pathname.split('/')[4] === 'collectibles') {
					Array.from(Nav.children).forEach((element) => {
						element = element.children[0];
						if (!(element === CollectibleNav)) {
							if (element.classList.contains('active')) {
								element.classList.remove('active');
							}
						}
					});
					CollectibleNav.children[0].classList.add('active');

					CollectibleCategory()
				}
			}
		});
	})();
}

/*
	Item Wishlist will be rewritten in v1.2.3
*/
function ItemWishlist() {
	const ItemGrid = document.getElementsByClassName('itemgrid')[0];
	const ItemCardContents = `
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
	`;

	ItemGrid.innerHTML = ''
	document.getElementsByClassName('pagination')[0].remove()
	const Search = document.createElement('div');
	Search.classList = 'row';
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
			Is Collectible?
			<span class="text-muted" style="font-size: 0.65rem; display: block;">Items that are collectible</span>
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
	`;
	ItemGrid.parentElement.prepend(document.createElement('br'), ItemGrid.parentElement.children[0]);
	ItemGrid.parentElement.prepend(Search, ItemGrid.parentElement.children[0]);

	let Type = document.getElementById('polyplus-itemwish-type');
	let SearchBar = document.getElementById('polyplus-itemwish-searchbar');
	let IsLimited = document.getElementById('polyplus-itemwish-isLimited');
	let IsAvailable = document.getElementById('polyplus-itemwish-isAvailable');

	Type.addEventListener('change', function () {
		Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked);
	});

	SearchBar.addEventListener('change', function () {
		Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked);
	});

	IsLimited.addEventListener('change', function () {
		Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked);
	});

	IsAvailable.addEventListener('change', function () {
		Update(Type.options[Type.selectedIndex].value, SearchBar.value, IsLimited.checked, IsAvailable.checked);
	});

	chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function (result) {
		let Wishlist = result.PolyPlus_ItemWishlist || [];
		console.log('wishlist: ', Wishlist);
		Wishlist.forEach((element) => {
			let NewItemCard = document.createElement('div');
			NewItemCard.classList = 'px-0';
			fetch('https://api.polytoria.com/v1/store/' + element)
				.then((response) => response.json())
				.then((data) => {
					NewItemCard.innerHTML = ItemCardContents.replace(':ItemID', data.id)
						.replace(':ItemThumbnail', data.thumbnail)
						.replace(':ItemName', data.name)
						.replace(':CreatorID', data.creator.id)
						.replace(':CreatorName', data.creator.name);
					if (data.isLimited === true) {
						NewItemCard.innerHTML = NewItemCard.innerHTML.replace(':LimitedTag', '<div class="ribbon ribbon-limited ribbon-top-right"><span>Limited</span></div>');
					} else {
						NewItemCard.innerHTML = NewItemCard.innerHTML.replace(':LimitedTag', '');
					}
					NewItemCard.setAttribute('data-id', data.id);
					NewItemCard.setAttribute('data-name', data.name);
					NewItemCard.setAttribute('data-type', data.type);
					NewItemCard.setAttribute('data-creator', data.creator.name);
					NewItemCard.setAttribute('data-limited', data.isLimited);
					if (data.isLimited === false) {
						NewItemCard.setAttribute('data-price', data.price);
					}

					ItemGrid.appendChild(NewItemCard);

					NewItemCard.getElementsByClassName('polyplus-itemwish-removebtn')[0].addEventListener('click', function () {
						let Index = Wishlist.indexOf(parseInt(NewItemCard.getAttribute('data-id')));
						if (Index === -1) {
							NewItemCard.remove();
							return;
						} else {
							Wishlist.splice(Index, 1);
							console.log(Wishlist);
							NewItemCard.remove();
						}
						chrome.storage.sync.set({PolyPlus_ItemWishlist: Wishlist, arrayOrder: true}, function () {
							console.log('ItemWishlist successfully saved: ' + ItemWishlist);
						});
					});
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		});
	});

	const Update = function(type, query, isLimited, isAvailable) {
		let ItemGrid = document.getElementsByClassName('itemgrid')[0];
		let BrickBalance = parseInt(JSON.parse(window.localStorage.getItem('p+account_info')).Bricks);
		query = query.toLowerCase();
		let Results = Array.from(ItemGrid.children);
		for (let i = 0; i < Results.length; i++) {
			let Show = true;
	
			console.log('type: ', type);
			if (!(type === 'any')) {
				console.log("isn't any");
				if (!(Results[i].getAttribute('data-type') === type)) {
					Show = false;
				}
			}
	
			if (!Results[i].getAttribute('data-name').toLowerCase().startsWith(query)) {
				Show = false;
			}
	
			if (isLimited === true) {
				if (!(Results[i].getAttribute('data-limited') === 'true')) {
					Show = false;
				}
			}
	
			if (isAvailable === true) {
				if (!(parseInt(Results[i].getAttribute('data-price')) <= BrickBalance)) {
					Show = false;
				}
			}
	
			if (Show === true) {
				Results[i].style.display = 'block';
			} else {
				Results[i].style.display = 'none';
			}
		}
	}
}

async function CollectibleCategory() {
	ItemGrid.innerHTML = ''
	document.getElementsByClassName('pagination')[0].remove()
	const CollectibleItemTypes = [
		"hat",
		"face",
		"tool"
	]
	const Collectibles = []

	for (let type of CollectibleItemTypes) {
		const InitialInventory = (await (await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory?type=' + type + '&limit=100')).json())
		Collectibles.push(...InitialInventory.inventory.filter((x) => x.asset.isLimited === true))

		if (InitialInventory.pages > 1) {
			if (InitialInventory.pages > 3) {
				InitialInventory.pages = 3
			}

			for (let page = 2; page < InitialInventory.pages; page++) {
				const PageResult = (await (await fetch('https://api.polytoria.com/v1/users/' + UserID + '/inventory?type=' + type + '&limit=100&page=' + page)).json())
				Collectibles.push(...PageResult.inventory.filter((x) => x.asset.isLimited === true))
			}
		}
	}

	Collectibles.forEach(item => {
		item = item.asset
		const ItemColumn = document.createElement('div')
		ItemColumn.classList = 'px-0'
		ItemColumn.innerHTML = `
		<a href="/store/${item.id}" class="text-reset">
			<div class="card mb-2">
				<div class="ribbon ribbon-limited ribbon-top-right"><span>Limited</span></div>
				<div class="card-body">
					<img src="${item.thumbnail}" class="img-fluid rounded">
				</div>
			</div>
			<h6 class="text-truncate mb-0">
				${item.name}
			</h6>
		</a>
		<small class="text-muted d-block mb-1">
			by <a href="/u/Polytoria" class="text-muted">Polytoria</a>
		</small>
		`
		ItemGrid.appendChild(ItemColumn)
	})
}