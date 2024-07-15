const PlaceID = parseInt(window.location.pathname.split('/')[2]);
const UserID = JSON.parse(window.localStorage.getItem('p+account_info')).ID;
const GameCreator = document.querySelector('#main-content .card-body .col div.text-muted a[href^="/users/"]').getAttribute('href').split('/')[2];

let Utilities;
let PlaceDetails = null;

var Settings;
let TimePlayed;
var PinnedGamesData = [];
let GamePinned;

let InfoColumns = document.querySelectorAll('#main-content .col:has(#likes-data-container) .card:has(.fas.fa-chart-bar) ul');
let CalculateRevenueButton;

const AchievementsTab = document.getElementById('achievements-tabpane');
const GamepassesTab = document.getElementById('gamepasses-tabpane');
const Achievements = Array.from(AchievementsTab.getElementsByClassName('card')) || [];
const Gamepasses = Array.from(GamepassesTab.getElementsByClassName('card')) || [];

!(() => {
	if (PlaceID === undefined) {
		return;
	}

	const DataContainer = document.getElementById('likes-data-container');
	const RatingsData = {
		Likes: parseInt(DataContainer.getAttribute('data-like-count')),
		Dislikes: parseInt(DataContainer.getAttribute('data-dislike-count')),
		Percentage: null
	};
	RatingsData.Percentage = Math.floor((RatingsData.Likes / (RatingsData.Likes + RatingsData.Dislikes)) * 100);
	const RatingsContainer = document.getElementById('thumbup-btn').parentElement.parentElement;

	const PercentageLabel = document.createElement('small');
	PercentageLabel.classList = 'text-muted';
	PercentageLabel.style.fontSize = '0.8rem';
	PercentageLabel.style.marginLeft = '10px';
	PercentageLabel.style.marginRight = '10px';

	if (!isNaN(RatingsData.Percentage)) {
		PercentageLabel.innerText = RatingsData.Percentage + '%';
	} else {
		PercentageLabel.innerText = 'N/A';
	}

	RatingsContainer.children[0].appendChild(PercentageLabel);

	chrome.storage.sync.get(['PolyPlus_Settings', 'PolyPlus_PinnedGames', 'PolyPlus_TimePlayed'], async function (result) {
		Settings = result.PolyPlus_Settings || {};
		TimePlayed = result.PolyPlus_TimePlayed || {};

		Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
		Utilities = Utilities.default;

		if (Settings.PinnedGamesOn === true) {
			PinnedGames(result.PolyPlus_PinnedGames);
		}

		if (Settings.InlineEditingOn === true && GameCreator === UserID) {
			InlineEditing();
		}

		const Description = document.querySelector('.col:has(#likes-data-container) .card.mcard.mb-2 .card-body.p-3.small');
		if (Settings.GameProfilesOn === true && Description !== null) {
			const GameProfileRegex = /p\+gp;(#(?:[A-Fa-f0-9]{3}){1,2}\b(;#(?:[A-Fa-f0-9]{3}){1,2}\b)+)/gm;
			if (GameProfileRegex.test(Description.innerText)) {
				const Info = GameProfileRegex.exec(Description.innerText)[1].split(';');
				GameProfile(Info);
			}
		}

		if (Settings.IRLPriceWithCurrency && Settings.IRLPriceWithCurrency.Enabled === true) {
			IRLPrice();
		}

		if (Settings.TimePlayedOn === true) {
			const TimePlayedNameRow = document.createElement('li');
			TimePlayedNameRow.innerText = 'Time Played:';

			const TimePlayedValueRow = document.createElement('li')
			if (TimePlayed[PlaceID]) {
				TimePlayedValueRow.innerText = new Date(TimePlayed[PlaceID] * 1000).toISOString().slice(11, 19)
			} else {
				TimePlayedValueRow.innerText = '-'
			}

			InfoColumns[0].appendChild(TimePlayedNameRow);
			InfoColumns[1].appendChild(TimePlayedValueRow);

			document.getElementById('btn-play').addEventListener('click', function(){
				chrome.runtime.sendMessage({ action: "start_time_played", placeID: PlaceID, userID: UserID })
			})
		}

		if (Settings.ShowPlaceRevenueOn === true) {
			const NameRow = document.createElement('li');
			NameRow.innerText = 'Revenue:';

			CalculateRevenueButton = document.createElement('li');
			CalculateRevenueButton.classList = 'fw-normal text-success';
			CalculateRevenueButton.style.letterSpacing = '0px';
			CalculateRevenueButton.innerHTML = `
            <a class="text-decoration-underline text-success" style="text-decoration-color: rgb(15, 132, 79) !important;">$ Calculate</a>
            `;

			InfoColumns[0].appendChild(NameRow);
			InfoColumns[1].appendChild(CalculateRevenueButton);

			let Calculating = false;
			CalculateRevenueButton.addEventListener('click', function () {
				if (Calculating === false) {
					Calculating = true;
					CalculateRevenueButton.innerText = '$ Calculating...';
					PlaceRevenue();
				}
			});
		}

		if (Settings.ImprovedAchievements && Settings.ImprovedAchievements.Enabled === true && AchievementsTab.getElementsByClassName('display-3')[0] === undefined) {
			if (Settings.ImprovedAchievements.ProgressBarOn && Settings.ImprovedAchievements.ProgressBarOn === true) {
				AchievementProgressBar();
			}

			if (Settings.ImprovedAchievements.PercentageOn && Settings.ImprovedAchievements.PercentageOn === true) {
				AchievementEarnedPercentage();
			}

			if (Settings.ImprovedAchievements.OpacityOn && Settings.ImprovedAchievements.OpacityOn === true) {
				for (let achievement of Achievements) {
					if ((achievement.getElementsByClassName('fad fa-check-circle')[0] !== undefined) === false) {
						achievement.style.opacity = '0.5';
					}
				}
			}
		}

		if (Settings.ReaddCopyablePlacesOn === true) {
			ReaddCopyable()
		}
	});
})();

function PinnedGames(placeIDs) {
	const PinButton = document.createElement('button')
	PinButton.classList = 'btn btn-primary btn-sm'
	PinButton.style = 'position: absolute; top: 0; right: 0; margin: 4px; font-size: 1.3em;'
	PinButton.innerHTML = `
	<i class="fa-regular fa-star"></i>
	`

	const UpdatePinButtonState = function(){
		PinButton.classList = 'btn btn-primary btn-sm'
		if (placeIDs.indexOf(PlaceID) === -1) {
			// Not Pinned
			if (placeIDs.length >= Utilities.Limits.PinnedGames) {
				PinButton.disabled = true
			}
			PinButton.children[0].classList = 'fa-regular fa-star'
		} else {
			// Pinned
			PinButton.children[0].classList = 'fa-duotone fa-star'
		}
	}

	PinButton.addEventListener('mouseenter', function(){
		if (placeIDs.indexOf(PlaceID) !== -1) {
			PinButton.classList.add('btn-danger')
			PinButton.classList.remove('btn-primary')
			PinButton.children[0].classList.add('fa-star-half-stroke')
			PinButton.children[0].classList.remove('fa-star')
		}
	})

	PinButton.addEventListener('mouseleave', function(){
		if (placeIDs.indexOf(PlaceID) !== -1) {
			PinButton.classList.add('btn-primary')
			PinButton.classList.remove('btn-danger')
			PinButton.children[0].classList.add('fa-star')
			PinButton.children[0].classList.remove('fa-star-half-stroke')
		}
	})

	UpdatePinButtonState()
	document.querySelector('h1.my-0').parentElement.appendChild(PinButton)

	PinButton.addEventListener('click', function(){
		if (placeIDs.length >= Utilities.Limits.PinnedGames) {
			PinButton.disabled = true
			return
		}

		if (placeIDs.indexOf(PlaceID) === -1) {
			placeIDs.push(PlaceID)
		} else {
			placeIDs.splice(placeIDs.indexOf(PlaceID), 1)
		}

		PinButton.disabled = true
		UpdatePinButtonState()

		chrome.storage.sync.set({'PolyPlus_PinnedGames': placeIDs}, function(){
			setTimeout(() => {
				PinButton.disabled = false
			}, 750);
		})
	});

	chrome.storage.onChanged.addListener(function (changes) {
		if ('PolyPlus_PinnedGames' in changes) {
			placeIDs = changes.PolyPlus_PinnedGames.newValue
			UpdatePinButtonState()
		}
	});
}

async function InlineEditing() {
	/*
        INLINE EDITING TO-DO:
            - Make it possible to edit the description even if there is no description initially
            - Make it possible to edit the place's genre
    */

	let Editing = false;

	const Style = document.createElement('style');
	Style.innerHTML = `
    body[data-polyplus-inlineEditing="true"] .polyplus-inlineEditing-visible {display: block !important;}
    .polyplus-inlineEditing-visible {display: none;}

    body[data-polyplus-inlineEditing="true"] .polyplus-inlineEditing-hidden {display: none !important;}
    .polyplus-inlineEditing-hidden {display: block;}
    `;
	document.body.prepend(Style);

	const Inputs = [
		{
			name: 'name',
			element: null,
			reference: '.card-header h1[style="font-weight:800;font-size:1.6em"]',
			placeholder: 'Place Title..',
			required: true,
			isTextarea: false,
			styles: 'font-weight:800;font-size:1.6em'
		},
		{
			name: 'description',
			element: null,
			reference: '.col:has(#likes-data-container) .card.mcard.mb-2 .card-body.p-3.small',
			placeholder: 'Place Description..',
			required: false,
			isTextarea: true,
			styles: 'height:300px; overflow-y:auto;'
		}
	];
	console.log(Inputs);
	for (let input of Inputs) {
		let Input = input.isTextarea === true ? document.createElement('textarea') : document.createElement('input');
		input.element = Input;

		const Reference = document.querySelector(input.reference);

		Input.classList = 'polyplus-inlineEditing-visible form-control';
		Input.placeholder = input.placeholder;
		Input.value = Reference.innerText;
		Input.style = input.styles;

		Reference.classList.add('polyplus-inlineEditing-hidden');
		Reference.parentElement.appendChild(Input);
	}

	const PlaceGenre = document.getElementsByClassName('list-unstyled m-0 col')[0].children[3];

	const Genres = [
		'other',
		'adventure',
		'building',
		'competitive',
		'creative',
		'fighting',
		'funny',
		'hangout',
		'medieval',
		'parkour',
		'puzzle',
		'racing',
		'roleplay',
		'sandbox',
		'showcase',
		'simulator',
		'sports',
		'strategy',
		'survival',
		'techdemo',
		'trading',
		'tycoon',
		'western'
	];

	const EditBtn = document.createElement('button');
	EditBtn.classList = 'btn btn-primary btn-sm';
	EditBtn.style = 'position: absolute; right: 0; margin-right: 7px;';
	EditBtn.innerHTML = '<i class="fa-duotone fa-hammer"></i> <span>Edit Details</span>';
	document.getElementsByClassName('card-header')[3].appendChild(EditBtn);

	EditBtn.addEventListener('click', function () {
		Editing = !Editing;

		EditBtn.children[0].classList.toggle('fa-hammer');
		EditBtn.children[0].classList.toggle('fa-check-double');
		EditBtn.children[0].classList.toggle('fa-fade');

		document.body.setAttribute('data-polyplus-inlineEditing', Editing);

		if (Editing === false) {
			const Send = new FormData();
			Send.append('_csrf', document.querySelector('input[name="_csrf"]').value);
			Send.append('id', PlaceID);
			for (let input of Inputs) {
				console.log('start of loop');
				Send.append(input.name, input.element.value);
			}

			console.log('after');
			fetch('/create/place/update', {method: 'POST', body: Send})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network not ok');
					}
					return response.text();
				})
				.then((data) => {
					console.log('Successfully edited game');
					for (let input of Inputs) {
						const Reference = document.querySelector(input.reference);
						Reference.innerText = input.element.value;
					}
				})
				.catch((error) => {
					alert('Error while saving changes');
					console.log('Error while editing game');
				});
		}
	});
}

async function GameProfile(data) {
	document.querySelector('h1.my-0').setAttribute('game-key', 'true');
	document.querySelector('div[style="min-height: 60vh;"]').id = 'gameprofile';

	const Style = document.createElement('style');

	Style.innerHTML = `
    div#app {
        background: ${data[0]} !important;
    }

    #gameprofile {
        /*font-family: no !important;*/
        color: ${data[4]} !important;
    }

    #gameprofile .card {
        --bs-card-bg: ${data[3]};
    }

    /*
    #gameprofile .card.mcard[game-key] .card-header {
        background: transparent;
        border: none;
    }
    */

    #gameprofile .card.mcard [game-key] {
        background: linear-gradient(to bottom, ${data[1]}, ${data[2]});
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    `;
	document.body.appendChild(Style);
}

async function IRLPrice() {
	const Gamepasses = document.querySelector('#gamepasses-tabpane .row.flex-row').children;
	for (let gamepass of Gamepasses) {
		const Price = gamepass.getElementsByClassName('text-success')[0];
		const IRLResult = await Utilities.CalculateIRL(Price.innerText, Settings.IRLPriceWithCurrency.Currency);

		let Span = document.createElement('span');
		Span.classList = 'text-muted polyplus-price-tag';
		Span.style.fontSize = '0.7rem';
		Span.innerText = '($' + IRLResult.result + ' ' + IRLResult.display + ')';
		Price.appendChild(Span);
	}
}

async function PlaceRevenue() {
	const BricksPerView = 5;

	if (PlaceDetails === null) {
		PlaceDetails = (await (await fetch('https://api.polytoria.com/v1/places/' + PlaceID)).json());
	}

	let CreatorDetails = await fetch('https://api.polytoria.com/v1/users/' + GameCreator);
	CreatorDetails = await CreatorDetails.json();

	let Total = round5(PlaceDetails.uniqueVisits) / 5;
	let Revenue = round5(PlaceDetails.uniqueVisits) / 5;

	let CreatorTax = 0.35;
	switch (CreatorDetails.membershipType) {
		case 'plus':
			CreatorTax = 0.25;
			break;
		case 'plusDeluxe':
			CreatorTax = 0.15;
			break;
	}

	let Achievements = await fetch('https://api.polytoria.com/v1/places/' + PlaceID + '/achievements');
	Achievements = await Achievements.json();

	let Gamepasses = await fetch('https://api.polytoria.com/v1/places/' + PlaceID + '/gamepasses');
	Gamepasses = await Gamepasses.json();

	for (let gamepass of Gamepasses.gamepasses) {
		const PriceAfterTax = Math.floor(gamepass.asset.price - gamepass.asset.price * CreatorTax);
		Revenue += PriceAfterTax * gamepass.asset.sales;
	}

	/*
    let AchievementCost = 0
    let FreeAchievements = null;
    for (let achievement of Achievements.achievements) {
        // decrease total by price of achievement creation based on when the achievement was created

        if ()
    }
    */

	const ResultText = document.createElement('li');
	ResultText.classList = 'fw-normal text-success';
	ResultText.style.letterSpacing = '0px';
	ResultText.innerHTML = `<i class="pi pi-brick mx-1"></i> ~` + Revenue.toLocaleString() + ' <i class="fa fa-question"></i>';

	CalculateRevenueButton.remove();
	InfoColumns[1].appendChild(ResultText);
}

function round5(number) {
	const remainder = number % 5;
	if (remainder < 2.5) {
		return number - remainder;
	} else {
		return number + (5 - remainder);
	}
}

function AchievementProgressBar() {
	const AchievementCount = Achievements.length;
	let AchievementsEarned = 0;

	for (let achievement of Achievements) {
		Achieved = achievement.getElementsByClassName('fad fa-check-circle')[0] !== undefined;

		if (Achieved === true) {
			AchievementsEarned++;
		}
	}

	const PercentageEarned = ((AchievementsEarned * 100) / AchievementCount).toFixed(0);

	const ProgressBar = document.createElement('div');
	ProgressBar.role = 'progressbar';
	ProgressBar.classList = 'progress';
	ProgressBar.style.background = '#000';
	ProgressBar.ariaValueNow = PercentageEarned;
	ProgressBar.ariaValueMin = '0';
	ProgressBar.ariaValueMax = '100';
	ProgressBar.innerHTML = `<div class="progress-bar progress-bar-striped text-bg-warning" style="width: ${PercentageEarned}%">${PercentageEarned}%</div>`;

	AchievementsTab.prepend(document.createElement('hr'));
	AchievementsTab.prepend(ProgressBar);
}

async function AchievementEarnedPercentage() {
	if (PlaceDetails === null) {
		PlaceDetails = (await (await fetch('https://api.polytoria.com/v1/places/' + PlaceID)).json());
	}

	const GetAchievementDifficulty = function(percent) {
		if (percent >= 90 && percent <= 100) {
			return 'Freebie';
		} else if (percent >= 80 && percent <= 89.9) {
			return 'Cake Walk';
		} else if (percent >= 50 && percent <= 79.9) {
			return 'Easy';
		} else if (percent >= 30 && percent <= 49.9) {
			return 'Moderate';
		} else if (percent >= 20 && percent <= 29.9) {
			return 'Challenging';
		} else if (percent >= 10 && percent <= 19.9) {
			return 'Hard';
		} else if (percent >= 5 && percent <= 9.9) {
			return 'Extreme';
		} else if (percent >= 1 && percent <= 4.9) {
			return 'Insane';
		} else if (percent >= 0 && percent <= 0.9) {
			return 'Impossible';
		}
	}
	
	const UserCount = PlaceDetails.uniqueVisits;
	for (let achievement of Achievements) {
		const OwnerText = achievement.getElementsByClassName('text-muted small my-0')[0];
		// thanks to Stackoverflow on how to remove everything except numbers from string
		const OwnerCount = parseInt(OwnerText.innerText.replace(/[^0-9]/g, ''));
		const PercentageOfPlayers = ((OwnerCount * 100) / UserCount).toFixed(2);

		OwnerText.innerHTML += ' (' + PercentageOfPlayers + '%, ' + GetAchievementDifficulty(PercentageOfPlayers) + ')';
	}
}

async function ReaddCopyable() {
	if (PlaceDetails === null) {
		PlaceDetails = (await (await fetch('https://api.polytoria.com/v1/places/' + PlaceID)).json());
	}

	if (PlaceDetails.isCopyable) {
		console.log('is copyable')
		const TitleCardButtons = document.querySelector('.card:has(h1.my-0) .col-auto[style^="m"]')
		
		const DownloadCopyButton = document.createElement('button')
		DownloadCopyButton.style.padding = '9px'
		DownloadCopyButton.classList = 'px-4 btn btn-success my-2'
		DownloadCopyButton.setAttribute('data-bs-toggle', 'tooltip')
		DownloadCopyButton.setAttribute('data-bs-title', 'Download this place')
		DownloadCopyButton.innerHTML = '<i class="fas fa-download"></i>'

		if (TitleCardButtons.children[0].children.length === 0) {
			TitleCardButtons.children[0].innerHTML = '<div class="col-auto px-1"></div>'
			TitleCardButtons.children[0].appendChild(DownloadCopyButton)
		} else {
			TitleCardButtons.children[0].prepend(DownloadCopyButton)
		}

		DownloadCopyButton.addEventListener('click', async function () {
			let CreatorToken = (await (await fetch('https://polytoria.com/api/places/edit', {
				method: 'POST',
				body: JSON.stringify({placeID: PlaceID})
			})).json()).token;
	
			fetch(`https://api.polytoria.com/v1/places/get-place?id=${PlaceID}&tokenType=creator`, {
				headers: {
					Authorization: CreatorToken
				}
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network not ok');
					}
					return response.blob();
				})
				.then((data) => {
					const DownloadURL = URL.createObjectURL(data);
	
					const Link = document.createElement('a');
					Link.href = DownloadURL;
					Link.download = PlaceDetails.name + '.poly';
					document.body.appendChild(Link);
					Link.click();
					Link.remove();
				})
				.catch((error) => {
					console.log(error);
				});
		});
	}
}