const ItemID = window.location.pathname.split('/')[2];
const ItemType = document.querySelector('.row .badge').innerHTML;

var Settings;
var ItemWishlist;
var PurchaseBtn;
var WishlistBtn;
var ItemOwned;
var InitialOwners;
var OwnerPagesFetched = 0;

var Utilities;

(async () => {
	Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
	Utilities = Utilities.default;

	chrome.storage.sync.get(['PolyPlus_Settings'], async function (result) {
		Settings = result.PolyPlus_Settings || {};

		PurchaseBtn = document.querySelector('.col:has(h1) .justify-content-lg-end .d-flex .flex-grow-1:nth-child(2) :nth-child(1)')
		ItemOwned = PurchaseBtn.innerText === ' Item owned' || PurchaseBtn.innerText === ' You earned this achievement' || document.querySelector('.btn[onclick="sellItem()"]') !== null;

		if (PurchaseBtn.getAttribute('data-seller-name')) {
			PurchaseBtn.setAttribute('data-bs-toggle', 'tooltip');
			PurchaseBtn.setAttribute('data-bs-title', 'Sold by ' + PurchaseBtn.getAttribute('data-seller-name'));
			Utilities.InjectResource('registerTooltips');
		}

		if (Settings.IRLPriceWithCurrency && Settings.IRLPriceWithCurrency.Enabled === true) {
			IRLPrice();
		}

		if (Settings.TryOnItemsOn === true && (Utilities.MeshTypes.indexOf(ItemType.toLowerCase()) !== -1 || Utilities.TextureTypes.indexOf(ItemType.toLowerCase()) !== -1)) {
			TryOnItems();
		}

		if (Settings.ReplaceItemSalesOn === true) {
			const Sales = document.querySelectorAll('.col:has(h6):has(h3.small)')[3];
			if (Sales.children[1].innerText === '0') {
				InitialOwners = await (await fetch('https://api.polytoria.com/v1/store/' + ItemID + '/owners?limit=100')).json();

				Sales.children[0].innerHTML = `Owners <i class="fa-solid fa-circle-info" data-bs-toggle="tooltip" data-bs-title="${ (InitialOwners.total <= 15) ? InitialOwners.inventories.map((x) => x.user.username).join(', ') : InitialOwners.inventories.slice(0, 14).map((x) => x.user.username).join(', ') + ' ...' }"></i>`;
				Sales.children[1].innerText = InitialOwners.total.toLocaleString();

				Utilities.InjectResource("registerTooltips")
			}
		}

		if (document.getElementById('resellers') !== null) {
			if (Settings.HoardersList && Settings.HoardersList.Enabled === true) {
				HoardersList(parseInt(Settings.HoardersList.MinCopies), Settings.HoardersList.AvatarsEnabled);
			}

			if (Settings.ShowValueListDataOn && Settings.ShowValueListDataOn === true) {
				ValueListData()
			}
		}
		
		if (Settings.ItemOwnerCheckOn === true && ((document.getElementById('timer') !== null && /\d/.test(document.getElementById('timer').innerText) || document.getElementById('resellers') !== null))) {
			CheckOwner();
		}

		if (Settings.ItemWishlistOn === true) {
			HandleItemWishlist();
		}
	});
})();

chrome.storage.onChanged.addListener(function (changes, namespace) {
	if ('PolyPlus_ItemWishlist' in changes) {
		chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function (result) {
			ItemWishlist = result.PolyPlus_ItemWishlist || [];

			if (Array.isArray(ItemWishlist) && ItemWishlist.includes(parseInt(ItemID))) {
				WishlistBtn.innerHTML = `
				<i class="fa-solid fa-star" style="color: orange;"></i>
				`;
			} else {
				if (!(ItemWishlist.length === 25)) {
					WishlistBtn.removeAttribute('disabled');
					WishlistBtn.innerHTML = `
					<i class="fa-regular fa-star"></i>
					`;
				} else {
					WishlistBtn.setAttribute('disabled', true);
					WishlistBtn.innerHTML = `
					<i class="fad fa-star"></i>
					`;
				}
			}
		});
	}
});

async function IRLPrice() {
	const Price = PurchaseBtn.getAttribute('data-price');
	if (Price !== null && Price !== '0') {
		const Span = document.createElement('span');
		Span.classList = 'text-muted polyplus-own-tag';
		Span.style.fontSize = '0.7rem';
		Span.style.fontWeight = 'normal';
		const IRLResult = await Utilities.CalculateIRL(Price, Settings.IRLPriceWithCurrency.Currency);
		Span.innerText = '($' + IRLResult.result + ' ' + IRLResult.display + ')';
		PurchaseBtn.appendChild(Span);
	}

	const Resellers = document.getElementById('resellers-container')
	if (Resellers !== null) {
		const observer = new MutationObserver(async function (list) {
			for (const record of list) {
				for (const element of record.addedNodes) {
					if (element.tagName === 'DIV') {
						const ResellerSpan = document.createElement('span');
						ResellerSpan.classList = 'text-muted polyplus-own-tag';
						ResellerSpan.style.fontSize = '0.7rem';
						ResellerSpan.style.fontWeight = 'normal';
						const ResellerIRLResult = await Utilities.CalculateIRL(element.getElementsByClassName('text-success')[0].innerText, Settings.IRLPriceWithCurrency.Currency);
						ResellerSpan.innerText = ' ($' + ResellerIRLResult.result + ' ' + ResellerIRLResult.display + ')';
						element.getElementsByClassName('text-success')[0].appendChild(ResellerSpan);
					}
				}
				observer.observe(Resellers, {attributes: false, childList: true, subtree: false});
			}
		});
		
		observer.observe(Resellers, {attributes: false, childList: true, subtree: false});
	}
}

function HandleItemWishlist() {
	const DescriptionText = document.querySelector('.mcard .card-body:has(p)');
	const Column = document.createElement('div')
	Column.classList = 'col'
	Column.style = 'text-align: right; --bs-gutter-x: 0px;'
	Column.innerHTML = `
		<button class="btn btn-sm btn-link"></button>
	`
	const ItemNameHeading = document.getElementsByTagName('h1')[0]
	ItemNameHeading.parentElement.parentElement.prepend(Column)
	ItemNameHeading.parentElement.classList.add('col-auto')
	ItemNameHeading.parentElement.style.paddingLeft = '0px !important'
	WishlistBtn = Column.children[0];
	chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function (result) {
		ItemWishlist = result.PolyPlus_ItemWishlist || [];

		if (ItemOwned === true) {
			if (ItemWishlist.includes(parseInt(ItemID))) {
				ItemWishlist.splice(ItemWishlist.indexOf(parseInt(ItemID)), 1);
				chrome.storage.sync.set({PolyPlus_ItemWishlist: ItemWishlist, arrayOrder: true});
			}
			return;
		}
		if (ItemOwned === true) {
			return;
		} else if (ItemOwned === true && ItemWishlist.includes(parseInt(ItemID))) {
			ItemWishlist.splice(ItemWishlist.indexOf(parseInt(ItemID)), 1);
			return;
		}

		if (ItemWishlist.includes(parseInt(ItemID))) {
			WishlistBtn.innerHTML = `
			<i class="fa-solid fa-star" style="color: orange;"></i>
			`;
		} else {
			WishlistBtn.innerHTML = `
			<i class="fa-regular fa-star"></i>
			`;
		}

		WishlistBtn.addEventListener('click', function () {
			WishlistBtn.setAttribute('disabled', true);
			chrome.storage.sync.get(['PolyPlus_ItemWishlist'], function (result) {
				ItemWishlist = result.PolyPlus_ItemWishlist || [];

				let i = ItemWishlist.indexOf(parseInt(ItemID));
				if (i !== -1) {
					ItemWishlist.splice(i, 1);
					WishlistBtn.innerHTML = `
					<i class="fa-solid fa-star" style="color: orange;"></i>
					`;
				} else {
					ItemWishlist.push(parseInt(ItemID));
					WishlistBtn.innerHTML = `
					<i class="fa-regular fa-star"></i>
					`;
				}

				chrome.storage.sync.set({PolyPlus_ItemWishlist: ItemWishlist, arrayOrder: true}, function () {
					setTimeout(function () {
						WishlistBtn.removeAttribute('disabled');
					}, 1250);
				});
			});
		});

		//DescriptionText.appendChild(document.createElement('br'));
		//DescriptionText.appendChild(WishlistBtn);
	});
}

function TryOnItems() {
	const Avatar = {
		useCharacter: true,
		items: [],
		headColor: '#e0e0e0',
		torsoColor: '#e0e0e0',
		leftArmColor: '#e0e0e0',
		rightArmColor: '#e0e0e0',
		leftLegColor: '#e0e0e0',
		rightLegColor: '#e0e0e0'
	};

	let AssetType = document.querySelector('.px-4.px-lg-0.text-muted.text-uppercase.mb-3 .badge').innerHTML;

	const ItemThumbnail = document.getElementsByClassName('store-thumbnail')[0];
	//const IFrame = document.getElementsByClassName('store-thumbnail-3d')[0]
	const TryIFrame = document.createElement('iframe');
	TryIFrame.style = 'width: 100%; height: auto; aspect-ratio: 1; border-radius: 20px; background: #1e1e1e;';

	const TryOnBtn = document.createElement('button');
	TryOnBtn.classList = 'btn btn-warning';
	TryOnBtn.style = 'position: absolute; bottom: 60px; right: 10px;';
	if (document.getElementsByClassName('3dviewtoggler')[0] === undefined) {
		TryOnBtn.style.bottom = '15px';
	}
	//TryOnBtn.setAttribute('data-bs-toggle', 'tooltip')
	//TryOnBtn.setAttribute('data-bs-title', 'Try this item on your avatar')
	TryOnBtn.innerHTML = '<i class="fa-duotone fa-vial"></i>';
	TryOnBtn.addEventListener('click', function () {
		fetch('https://api.polytoria.com/v1/users/' + JSON.parse(window.localStorage.getItem('p+account_info')).ID + '/avatar')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				data.assets.forEach((item) => {
					if (item.type !== AssetType.toLowerCase()) {
						if (item.type === 'hat') {
							Avatar.items[Avatar.items.length] = item.path || '';
						} else if (item.type === 'face') {
							Avatar.face = item.path || '';
						} else if (item.type === 'tool') {
							Avatar.tool = item.path || '';
						} else if (item.type === 'shirt') {
							Avatar.shirt = item.path || '';
						} else if (item.type === 'pants') {
							Avatar.pants = item.path || '';
						}
					}
				});

				Avatar.headColor = '#' + data.colors.head;
				Avatar.torsoColor = '#' + data.colors.torso;
				Avatar.leftArmColor = '#' + data.colors.leftArm;
				Avatar.rightArmColor = '#' + data.colors.rightArm;
				Avatar.leftLegColor = '#' + data.colors.leftLeg;
				Avatar.rightLegColor = '#' + data.colors.rightLeg;

				if (Utilities.MeshTypes.indexOf(AssetType.toLowerCase()) !== -1) {
					fetch('https://api.polytoria.com/v1/assets/serve-mesh/:id'.replace(':id', window.location.pathname.split('/')[2]))
						.then((response) => {
							if (!response.ok) {
								throw new Error('Network response was not ok');
							}
							return response.json();
						})
						.then((data) => {
							if (AssetType === 'Tool') {
								Avatar.tool = data.url;
							} else {
								Avatar.items.push(data.url);
							}

							TryIFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)));
						})
						.catch((error) => {
							console.error('Fetch error:', error);
						});
				} else if (Utilities.TextureTypes.indexOf(AssetType.toLowerCase()) !== -1) {
					fetch('https://api.polytoria.com/v1/assets/serve/:id/Asset'.replace(':id', window.location.pathname.split('/')[2]))
						.then((response) => {
							if (!response.ok) {
								throw new Error('Network response was not ok');
							}
							return response.json();
						})
						.then((data) => {
							switch (AssetType) {
								case 'Shirt':
									Avatar.shirt = data.url;
									break;
								case 'Pants':
									Avatar.pants = data.url;
									break;
								case 'Face':
									Avatar.face = data.url;
									break;
							}

							TryIFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)));
						})
						.catch((error) => {
							console.error('Fetch error:', error);
						});
				}
			})
			.catch((error) => {
				console.error('Fetch error:', error);
			});

		TryOnModal.showModal();
	});

	let TryOnModal = document.createElement('dialog');
	TryOnModal.classList = 'polyplus-modal';
	TryOnModal.setAttribute('style', 'width: 450px; border: 1px solid #484848; background-color: #181818; border-radius: 20px; overflow: hidden;');
	TryOnModal.innerHTML = `
	<div class="row text-muted mb-2" style="font-size: 0.8rem;">
		<div class="col">
			<h5 class="mb-0" style="color: #fff;">Preview</h5>
				Try this item on your avatar before purchasing it!
			</div>
			<div class="col-md-2">
				<button class="btn btn-info w-100 mx-auto" onclick="this.parentElement.parentElement.parentElement.close();">X</button>
			</div>
		</div>
	</div>
	<div class="modal-body"></div>
  	`;

	document.body.prepend(TryOnModal);
	ItemThumbnail.parentElement.appendChild(TryOnBtn);
	TryOnModal.children[1].prepend(TryIFrame);
}

async function HoardersList(min, avatars) {
	let Page = 0;
	let Tabs = document.getElementById('store-tabs');

	const Tab = document.createElement('li');
	Tab.classList = 'nav-item';
	Tab.innerHTML = `
	<a class="nav-link">
		<i class="fas fa-calculator me-1"></i>
		<span class="d-none d-sm-inline"><span class="pilltitle">Hoarders</span>
	</a>
	`;
	Tabs.appendChild(Tab);

	const TabContent = document.createElement('div');
	TabContent.classList = 'd-none';
	TabContent.innerHTML = `
	<small class="d-block text-center text-muted" style="font-size: 0.8rem;">
		Loading... (this may take a few seconds)
	</small>
	<lottie-player id="avatar-loading" src="https://c0.ptacdn.com/static/images/lottie/poly-brick-loading.2b51aa85.json" background="transparent" speed="1" style="width: 20%;height: auto;margin: -16px auto 50px;margin-top: 0px;" loop="" autoplay=""></lottie-player>
	`;
	document.getElementById('owners').parentElement.appendChild(TabContent);

	// Add tab logic
	Array.from(Tabs.children).forEach((tab) => {
		tab.addEventListener('click', function () {
			if (tab === Tab) {
				Array.from(Tabs.children).forEach((tab) => {
					tab.children[0].classList.remove('active');
				});
				Array.from(document.getElementById('owners').parentElement.children).forEach((tab) => {
					tab.classList.add('d-none');
				});
				tab.children[0].classList.add('active');
				TabContent.classList.remove('d-none');
			}
		});
	});

	let Fetched = false;
	Tab.addEventListener('click', async function () {
		if (Fetched === true) {
			return;
		}
		Fetched = true;

		const Owners = [];
		if (InitialOwners === undefined) {
			InitialOwners = await (await fetch('https://api.polytoria.com/v1/store/' + ItemID + '/owners?limit=100')).json();
		}
		Owners.push(...InitialOwners.inventories);

		// Get owners (up to 300, if needed)
		if (InitialOwners.pages > Utilities.Limits.HoardersListPages) {
			InitialOwners.pages = Utilities.Limits.HoardersListPages;
		}
		if (InitialOwners.pages > 1 && OwnerPagesFetched < InitialOwners.pages) {
			for (let i = 1; i < InitialOwners.pages; i++) {
				const PageResult = (await (await fetch('https://api.polytoria.com/v1/store/' + ItemID + '/owners?limit=100&page=' + (i + 1))).json()).inventories;
				console.log(PageResult);
				Owners.push(...PageResult);
			}
		}
		const Formatted = {};

		// Count copies & store serials of owners
		for (let owner of Owners) {
			if (Formatted[owner.user.id] !== undefined) {
				Formatted[owner.user.id].copies++;
				Formatted[owner.user.id].serials.push(owner.serial);
			} else {
				Formatted[owner.user.id] = {
					user: owner.user,
					copies: 1,
					serials: [owner.serial]
				};
			}
		}

		let AvatarsFetched = 0;
		let Hoarders = await new Promise(async (resolve, reject) => {
			const FormattedValues = Object.values(Formatted).filter((x, index) => x.copies >= 2)
			if (avatars === true) {
				for (let hoarder of FormattedValues) {
					if (AvatarsFetched < 15) {
						try {
							AvatarsFetched++
							const Avatar = (await (await fetch('https://api.polytoria.com/v1/users/' + hoarder.user.id)).json());
							hoarder.user.avatar = Avatar.thumbnail.icon;
						} catch(error) {
							hoarder.user.avatar = ''
						}
					}
				}
			}
			const Sorted = FormattedValues
				.filter((x, index) => x.copies >= min)
				.sort((a, b) => b.copies - a.copies);
			resolve(Sorted);
		});
		let AmountOfHoarders = Hoarders.length;

		// Break hoarders into groups of 4
		let Groups = [];
		while (Hoarders.length > 0) {
			Groups.push(Hoarders.splice(0, 4));
		}

		TabContent.innerHTML = `
    	<div id="p+hoarders-container">
			${ Groups[Page] !== undefined ? Groups[Page].map((x) => `
			<div class="card mb-3">
				<div class="card-body">
					<div class="row">
						${ avatars === true ? `
						<div class="col-auto">
							<img src="${x.user.avatar}" alt="${x.user.username}" width="72" class="rounded-circle border border-2 border-secondary bg-dark">
						</div>
						` : ''
						}
						<div class="col d-flex align-items-center">
							<div>
								<h6 class="mb-1">
									<a class="text-reset" href="/u/${x.user.username}">${x.user.username}</a>
								</h6>
								<small class="text-muted">${x.copies} Copies <i class="fa-solid fa-circle-info" data-bs-toggle="tooltip" data-bs-title="#${x.serials.sort((a, b) => a - b).join(', #')}"></i></small>
							</div>
						</div>
						<div class="col-auto d-flex align-items-center">
							<a class="btn btn-warning" type="button" href="/trade/new/${x.user.id}">
								<i class="fad fa-exchange-alt me-1"></i>
								<span class="d-none d-sm-inline">Trade</span>
							</a>
						</div>
					</div>
				</div>
			</div>
			`
			).join('') : `
			<div class="card mb-3">
				<div class="card-body text-center py-5 text-muted">
				<h1 class="display-3"><i class="fa-solid fa-rectangle-history-circle-user"></i></h1>
				<h5> No hoarders </h5>
				<p class="mb-0">This item is fresh and doesn't have any hoarders yet! Come back later!</p>
				</div>
			</div>
			`}
		</div>
		<nav aria-label="Hoarders">
			<ul class="pagination justify-content-center">
				<li style="margin-top: auto; margin-bottom: auto;">
					<select class="form-select form-select-sm" style="height: 37px !important;" id="p+hoarders-min-copies">
						<option value="2">Min. 2+ Copies</option>
						<option value="3">Min. 3+ Copies</option>
						<option value="5">Min. 5+ Copies</option>
						<option value="10">Min. 10+ Copies</option>
						<option value="15">Min. 15+ Copies</option>
						<option value="35">Min. 35+ Copies</option>
					</select>
				</li>
				<li class="page-item disabled">
					<a class="page-link" href="#!" id="p+hoarders-first-pg">«</a>
				</li>
				<li class="page-item disabled">
					<a class="page-link" href="#!" tabindex="-1" id="p+hoarders-prev-pg">‹</a>
				</li>
				<li class="page-item active">
					<a class="page-link">
						<span class="visually-hidden">Page</span>
						<span id="p+hoarders-current-pg">1</span>
					</a>
				</li>
				<li class="page-item">
					<a class="page-link" href="#!" id="p+hoarders-next-pg">›</a>
				</li>
				<li class="page-item">
					<a class="page-link" href="#!" id="p+hoarders-last-pg">»</a>
				</li>
			</ul>
		</nav>
		<small class="text-muted text-center mt-1 mb-3 d-block" style="font-size: 0.7rem;">feature of Poly+</small>
		`;
		Utilities.InjectResource('registerTooltips');

		const Container = document.getElementById('p+hoarders-container');

		// Pagination is annoying
		const First = document.getElementById('p+hoarders-first-pg');
		const Prev = document.getElementById('p+hoarders-prev-pg');
		const Current = document.getElementById('p+hoarders-current-pg');
		const Next = document.getElementById('p+hoarders-next-pg');
		const Last = document.getElementById('p+hoarders-last-pg');

		const MinCopies = document.getElementById('p+hoarders-min-copies');
		MinCopies.selectedIndex = Array.from(MinCopies.children).indexOf(MinCopies.querySelector(`option[value="${min}"]`));

		if (Page > 0) {
			Prev.parentElement.classList.remove('disabled');
			First.parentElement.classList.remove('disabled');
		} else {
			Prev.parentElement.classList.add('disabled');
			First.parentElement.classList.add('disabled');
		}
		if (Page < Groups.length - 1) {
			Next.parentElement.classList.remove('disabled');
			Last.parentElement.classList.remove('disabled');
		} else {
			Next.parentElement.classList.add('disabled');
			Last.parentElement.classList.add('disabled');
		}

		First.addEventListener('click', function () {
			if (Page > 0) {
				Page = 0;
				UpdateHoardersList();
			}
		});

		Prev.addEventListener('click', function () {
			if (Page > 0) {
				Page--;
				UpdateHoardersList();
			}
		});

		Next.addEventListener('click', function () {
			if (Page < Groups.length - 1) {
				Page++;
				UpdateHoardersList();
			}
		});

		Last.addEventListener('click', function () {
			if (Page < Groups.length - 1) {
				Page = Groups.length - 1;
				UpdateHoardersList();
			}
		});

		MinCopies.addEventListener('change', function () {
			Page = 0;
			min = parseInt(MinCopies.options[MinCopies.selectedIndex].value);
			Hoarders = Object.values(Formatted)
				.filter((x, index) => x.copies >= min)
				.sort((a, b) => b.copies - a.copies);
			AmountOfHoarders = Hoarders.length;
			Groups = [];
			while (Hoarders.length > 0) {
				Groups.push(Hoarders.splice(0, 4));
			}
			UpdateHoardersList();
		});

		const UpdateHoardersList = function () {
			Current.innerText = Page + 1;

			if (Groups[Page] !== undefined) {
				Container.innerHTML = Groups[Page].map((x) => `
				<div class="card mb-3">
					<div class="card-body">
						<div class="row">
							${ avatars === true ? `
							<div class="col-auto">
								<img src="${x.user.avatar}" alt="${x.user.username}" width="72" class="rounded-circle border border-2 border-secondary bg-dark">
							</div>
							` : ''
							}
							<div class="col d-flex align-items-center">
								<div>
									<h6 class="mb-1">
										<a class="text-reset" href="/users/${x.user.id}">${x.user.username}</a>
									</h6>
									<small class="text-muted">${x.copies} Copies <i class="fa-solid fa-circle-info" data-bs-toggle="tooltip" data-bs-title="#${x.serials.sort((a, b) => a - b).join(', #')}"></i></small>
								</div>
							</div>
							<div class="col-auto d-flex align-items-center">
								<a class="btn btn-warning" type="button" href="/trade/new/${x.user.id}">
									<i class="fad fa-exchange-alt me-1"></i>
									<span class="d-none d-sm-inline">Trade</span>
								</a>
							</div>
						</div>
					</div>
				</div>
				`
				).join('');

				Utilities.InjectResource('registerTooltips');
			} else {
				Container.innerHTML = `
				<div class="card mb-3">
					<div class="card-body text-center py-5 text-muted">
						<h1 class="display-3"><i class="fa-solid fa-rectangle-history-circle-user"></i></h1>
						<h5> No hoarders </h5>
						<p class="mb-0">This item is fresh and doesn't have any hoarders yet! Come back later!</p>
					</div>
				</div>
				`;
			}

			if (Page > 0) {
				Prev.parentElement.classList.remove('disabled');
				First.parentElement.classList.remove('disabled');
			} else {
				Prev.parentElement.classList.add('disabled');
				First.parentElement.classList.add('disabled');
			}
			if (Page < Groups.length - 1) {
				Next.parentElement.classList.remove('disabled');
				Last.parentElement.classList.remove('disabled');
			} else {
				Next.parentElement.classList.add('disabled');
				Last.parentElement.classList.add('disabled');
			}
		};
	});
}

function CheckOwner() {
	const ImageCard = document.querySelector('.card-body:has(.store-thumbnail)');

	const CheckOwnerDiv = document.createElement('div');
	CheckOwnerDiv.classList = 'mt-3 d-none';
	CheckOwnerDiv.innerHTML = `
	<div class="input-group mb-2">
		<input type="text" class="form-control bg-dark" placeholder="Username..">
		<button class="btn btn-success">Check</button>
	</div>

	<b class="text-muted" style="font-size: 0.85rem;"><i class="fa-duotone fa-square-question mr-1"></i> ...</b>
	`;

	ImageCard.appendChild(CheckOwnerDiv);

	const ToggleButton = document.createElement('button');
	ToggleButton.classList = 'btn btn-dark';
	ToggleButton.style = 'position: absolute; bottom: 15px; left: 10px;';
	//ToggleButton.setAttribute('data-bs-toggle', 'tooltip')
	//ToggleButton.setAttribute('data-bs-title', 'Quickly check if someone owns this item')
	ToggleButton.innerHTML = '<i class="fa-duotone fa-bags-shopping"></i>';

	ImageCard.children[0].prepend(ToggleButton);

	const UsernameInput = CheckOwnerDiv.getElementsByTagName('input')[0];
	const CheckButton = CheckOwnerDiv.getElementsByTagName('button')[0];
	const ResultText = CheckOwnerDiv.getElementsByTagName('b')[0];

	ToggleButton.addEventListener('click', function () {
		if (CheckOwnerDiv.classList.contains('d-none')) {
			ResultText.classList = '';
			ResultText.innerHTML = '<i class="fa-duotone fa-square-question mr-1"></i> ...';
			CheckOwnerDiv.classList.remove('d-none');
		} else {
			CheckOwnerDiv.classList.add('d-none');
		}
	});

	UsernameInput.addEventListener('update', function () {
		ResultText.classList = '';
		ResultText.innerHTML = '<i class="fa-duotone fa-square-question mr-1"></i> ...';
	});

	CheckButton.addEventListener('click', async function () {
		const Username = UsernameInput.value;
		if (Username.trim() === '') {
			ResultText.classList = '';
			ResultText.innerHTML = '<i class="fa-duotone fa-square-question mr-1"></i> ...';
			return;
		}

		const UserID = (await (await fetch('https://api.polytoria.com/v1/users/find?username=' + Username)).json()).id;

		if (UserID !== undefined) {
			const Owns = await (await fetch('https://api.polytoria.com/v1/store/' + ItemID + '/owner?userID=' + UserID)).json();

			if (Owns.owned === true) {
				ResultText.classList = 'text-success';
				ResultText.innerHTML = '<i class="fa-duotone fa-circle-check mr-1"></i> ' + Username + ' owns #' + Owns.inventory.serial + ' of "' + document.getElementsByTagName('h1')[0].innerText + '".';
			} else {
				ResultText.classList = 'text-danger';
				ResultText.innerHTML = '<i class="fa-duotone fa-circle-exclamation mr-1"></i> ' + Username + ' does not own "' + document.getElementsByTagName('h1')[0].innerText + '".';
			}
		} else {
			ResultText.classList = 'text-warning';
			ResultText.innerHTML = '<i class="fa-duotone fa-circle-exclamation mr-1"></i> No user found under the username "' + Username + '".';
		}
	});
}

async function ValueListData() {
	let Tabs = document.getElementById('store-tabs');

	const ValueSection = document.createElement('div')
	ValueSection.classList = 'mb-3'
	ValueSection.innerHTML = `
	<h6 class="section-title mt-3 mt-lg-0 mb-3 px-2">
		Valuation <a href="https://docs.google.com/document/d/1W7JN74MU-9Dbd-9xNnjxE18hQVBPXWuwjK5DGSnuQR4/" target="_blank">(based off LOVE)</a>
	</h6>
	<div class="card" id="p+valuation_card">
		<div class="card-body">
			<small class="d-block text-center text-muted" style="font-size: 0.8rem;">
				Loading...
			</small>
			<lottie-player id="avatar-loading" src="https://c0.ptacdn.com/static/images/lottie/poly-brick-loading.2b51aa85.json" background="transparent" speed="1" style="width: 20%;height: auto;margin: -16px auto 50px;margin-top: 0px;" loop="" autoplay=""></lottie-player>
		</div>
	</div>
	`
	Tabs.parentElement.insertBefore(ValueSection, Tabs)

	const ValueCard = document.getElementById('p+valuation_card').children[0]

	const ColumnLabels = [
		"name",
		"short",
		"value",
		"type",
		"trend",
		"demand",
		"tags"
	]

	const TagColors = {
		"Projected": "warning",
		"Hoarded": "success",
		"Rare": "primary",
		"Freaky": "danger"
	}

	const ValueListDocument = new DOMParser().parseFromString(await (await fetch('https://docs.google.com/feeds/download/documents/Export?exportFormat=html&format=html&id=1W7JN74MU-9Dbd-9xNnjxE18hQVBPXWuwjK5DGSnuQR4')).text(), 'text/html')

	/*
		Table to JSON function (slightly modified for my use-case)
		https://stackoverflow.com/questions/9927126/how-to-convert-the-following-table-to-json-with-javascript#answer-60196347
	*/
	const ExtractTableJSON = function(table) { 
		var data = [];
		for (var i = 1; i < table.rows.length; i++) { 
			var tableRow = table.rows[i]; 
			var rowData = {
				tags: []
			}; 
			for (var j = 0; j < tableRow.cells.length; j++) { 
				let Value = tableRow.cells[j].children[0].children[0].innerText;
				if (ColumnLabels[j] === "name") {
					rowData.id = tableRow.cells[j].children[0].children[0].children[0].href.split('https://www.google.com/url?q=')[1].split('&')[0].split('/')[4]
				}
				if (ColumnLabels[j] === "tags") {
					Array.from(tableRow.cells[j].children).forEach(tag => {
						/* 
							The regex for the emoji character codes replacement was made by AI, such a time saver lol
						*/
						rowData.tags.push(tag.children[0].innerHTML.replace(/\s/g,'').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''))
					})
				} else {
					rowData[ColumnLabels[j]] = Value
				}
			} 
			data.push(rowData); 
		} 
		return data; 
	}

	const GetTagColor = function(label) {
		if (TagColors[label] !== undefined) {
			return TagColors[label]
		} else if (TagColors[label.substring(1)] !== undefined) {
			return TagColors[label.substring(1)]
		} else {
			return 'dark'
		}
	}

	const ValueDetails = ExtractTableJSON(ValueListDocument.getElementsByTagName('table')[0]).filter((x) => x.id === ItemID)[0]

	if (ValueDetails !== undefined) {
		ValueCard.innerHTML = `
		<div class="mb-1">
			<b class="text-success">
				<i class="pi pi-brick" style="width:1.2em"></i>
				Value
			</b>
			<span class="float-end">
				${ValueDetails.value}
			</span>
		</div>
		<div class="mb-1">
			<b class="text-primary"">
				<i class="pi" style="width:1.2em">%</i>
				Trend
			</b>
			<span class="float-end">
				${ValueDetails.trend}
			</span>
		</div>
		<div class="mb-1">
			<b>
				<i class="fa-duotone fa-triangle" style="width:1.2em"></i>
				Valuation Type
			</b>
			<span class="float-end">
				${ValueDetails.type}
			</span>
		</div>
		<div class="mb-1">
			<b>
				<i class="fa-duotone fa-hand-wave" style="width:1.2em"></i>
				Shorthand
			</b>
			<span class="float-end">
				${ValueDetails.short}
			</span>
		</div>
		<div class="d-flex" style="gap: 5px;">
			${ ValueDetails.tags.map((x) => `
			<span class="badge bg-${ GetTagColor(x) }">${x}</span>
			`).join('')}
		</div>
		`
	} else {
		ValueCard.innerHTML = `
		There is no evaluation for this item at this time.
		`
	}
}