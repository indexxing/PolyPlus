const PlaceID = window.location.pathname.split('/')[3];
const Form = document.querySelector('form[action="/create/place/update"]');

var Settings;
var PlaceData = null;

let Utilities;

!(async () => {
	Utilities = (await import(chrome.runtime.getURL('resources/utils.js')))
		.default;

	chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
		Settings = result.PolyPlus_Settings || Utilities.DefaultSettings;

		if (Settings.ImprovedPlaceManagement.Enabled) {
			if (Settings.ImprovedPlaceManagement.QuickActivityToggleOn && Settings.ImprovedPlaceManagement.QuickActivityToggleOn === true) {
				ActivityToggle();
			}

			if (Settings.ImprovedPlaceManagement.PlaceFileDownloadOn && Settings.ImprovedPlaceManagement.PlaceFileDownloadOn === true) {
				CopyOwnedPlace();
			}

			if (Settings.ImprovedPlaceManagement.MultiWhitelistOn && Settings.ImprovedPlaceManagement.MultiWhitelistOn === true) {
				MultiWhitelist();
			}

			if (Settings.ImprovedPlaceManagement.ClearWhitelistOn && Settings.ImprovedPlaceManagement.ClearWhitelistOn === true) {
				ClearWhitelist();
			}
		}
	})
})();

async function ActivityToggle() {
	if (PlaceData === null) {
		PlaceData = await fetch('https://api.polytoria.com/v1/places/' + PlaceID);
		PlaceData = await PlaceData.json();
	}
	let Status = PlaceData.isActive;

	const DIV = document.createElement('div');
	DIV.classList = 'form-group mt-4';
	DIV.innerHTML = `
    <label class="mb-2">
      <h5 class="mb-0">Toggle Activity</h5>
      <small class="text-muted">Make your place active or inactive (currently <span id="p+current_place_activity">${Status === true ? 'active' : 'inactive'}</span>).</small>
    </label>
    <br>
    `;

	Form.insertBefore(DIV, Form.children[Form.children.length - 1]);

	const ActivityBtn = document.createElement('button');
	ActivityBtn.type = 'button';
	ActivityBtn.classList = 'btn ' + (Status === true ? 'btn-danger' : 'btn-success');
	ActivityBtn.innerText = 'Set ' + (Status === true ? 'Private' : 'Public');
	DIV.appendChild(ActivityBtn);

	ActivityBtn.addEventListener('click', async function () {
		const Toggle = (await (await fetch(`https://polytoria.com/api/places/${PlaceID}/toggle-active`,{ method: 'POST' })).json())
		if (Toggle.success) {
			Status = Toggle.isActive;
			ActivityBtn.innerText = 'Set ' + (Status === true ? 'Private' : 'Public');
			ActivityBtn.classList = 'btn ' + (Status === true ? 'btn-danger' : 'btn-success');
			Status === true ? document.getElementById('p+current_place_activity').innerText = 'active' : document.getElementById('p+current_place_activity').innerText = 'inactive'
		} else {
			//chrome.runtime.sendMessage({ action: "sweetalert2", icon: "error", title: "Error", text: Toggle.message });
			alert(Toggle.message)
		}
	});
}

function RequestGameProfile() {
	const Div = document.createElement('div');
	Div.classList = 'card mt-4';
	Div.innerHTML = `
    <div class="card-body">
        <input type="text" class="form-control bg-dark mb-2" placeholder="Game Title..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Background Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Accent Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Secondary Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Card Background Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Text Color..">
        <button type="button" class="btn btn-primary">Submit Request</button>
    </div>
    `;
	Form.insertBefore(Div, Form.children[Form.children.length - 1]);

	const SubmitBtn = Div.getElementsByTagName('button')[0];

	SubmitBtn.addEventListener('click', function () {
		const CardBody = Div.children[0];
		const Result = {
			gameTitle: CardBody.children[0].value,
			bg: CardBody.children[1].value,
			accent: CardBody.children[2].value,
			secondary: CardBody.children[3].value,
			cardBg: CardBody.children[4].value,
			text: CardBody.children[5].value
		};
		window.location.href = 'https://polyplus.vercel.app/app/game-profile.html?gameId=' + PlaceID + '&profile=' + encodeURIComponent(btoa(JSON.stringify(Result)));
	});
}

async function CopyOwnedPlace() {
	if (PlaceData === null) {
		PlaceData = await fetch('https://api.polytoria.com/v1/places/' + PlaceID);
		PlaceData = await PlaceData.json();
	}

	if (PlaceData.creator.id !== parseInt(JSON.parse(window.localStorage.getItem('p+account_info')).ID)) {
		return
	}

	const DIV = document.createElement('div');
	DIV.classList = 'form-group mt-4';
	DIV.innerHTML = `
    <label class="mb-2">
      <h5 class="mb-0">Download <code style="color: orange;">.poly</code> File</h5>
      <small class="text-muted">Quickly download your place from the site!</small>
    </label>
    <br>
    <button type="button" class="btn btn-primary">Download</button>
    `;

	Form.insertBefore(DIV, Form.children[Form.children.length - 1]);

	const DownloadButton = DIV.getElementsByTagName('button')[0];
	DownloadButton.addEventListener('click', async function () {
		console.log('clicked download epic');

		let CreatorToken = await fetch('https://polytoria.com/api/places/edit', {
			method: 'POST',
			body: JSON.stringify({placeID: PlaceID})
		});
		CreatorToken = await CreatorToken.json();
		CreatorToken = CreatorToken.token;

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
				Link.download = PlaceData.name + '.poly';
				document.body.appendChild(Link);
				Link.click();
				Link.remove();
			})
			.catch((error) => {
				console.log(error);
			});
	});
}

function MultiWhitelist(){
	const WhitelistCard = document.querySelector('.card:has(#whitelist-username)')

	const MultiWhitelistCard = document.createElement('card')
	MultiWhitelistCard.classList = 'card mt-3'
	MultiWhitelistCard.innerHTML = `
	<div class="card-header">
		<i class="fa-duotone fa-solid fa-vial-circle-check"></i>
		Multi-Whitelist
	</div>
	<div class="card-body">
		<textarea class="form-control bg-dark mb-2" placeholder="Usernames (separated by lines).." style="min-height: 250px;"></textarea>
		<button class="btn btn-primary">
			<i class="fa-duotone fa-solid fa-users"></i>
			Whitelist
		</button>
	</div>
	`
	WhitelistCard.parentElement.appendChild(MultiWhitelistCard)

	const MultiWhitelistSubmitButton = MultiWhitelistCard.getElementsByTagName('button')[0]

	MultiWhitelistSubmitButton.addEventListener('click', async function(){
		const Usernames = MultiWhitelistSubmitButton.previousElementSibling.value.split('\n').filter((x) => x !== "")
		MultiWhitelistSubmitButton.previousElementSibling.disabled = true
		if (Usernames.length > 0) {
			for (let username of Usernames) {
				const WhitelistAddRequest = (await (await fetch('https://polytoria.com/api/create/whitelist', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						placeID: PlaceID,
						username: username
					})
				})).json())
			}

			window.location.reload()
		}
	})
}

function ClearWhitelist() {
	const WhitelistCard = document.querySelector('.card:has(#whitelist-username)')

	const ClearWhitelistButton = document.createElement('button')
	ClearWhitelistButton.classList = 'btn btn-danger btn-sm'
	ClearWhitelistButton.style = 'position: absolute; top: 0; right: 0; margin: 4px;'
	ClearWhitelistButton.innerHTML = '<i class="fa-duotone fa-solid fa-broom-wide"></i> Clear'
	WhitelistCard.children[0].appendChild(ClearWhitelistButton)

	let WhitelistData = null
	let ClearPending = false
	ClearWhitelistButton.addEventListener('click', async function(){
		if (ClearPending === false) {
			ClearPending = true
			ClearWhitelistButton.innerText = 'Are you sure?'
			setTimeout(() => {
				if (ClearPending === true) {
					ClearPending = false;
					ClearWhitelistButton.innerHTML = '<i class="fa-duotone fa-solid fa-broom-wide"></i> Clear'
				}
			}, 3000);
		} else {
			ClearPending = false
			ClearWhitelistButton.innerHTML = '<i class="fa-duotone fa-solid fa-broom-wide"></i> Clear'
			if (confirm('Are you sure you\'d like to clear all of this place\'s whitelist')) {
				if (WhitelistData === null) {
					const InitialWhitelist = (await (await fetch('https://polytoria.com/api/create/whitelist?placeID=' + PlaceID + '&page=1')).json())
					WhitelistData = [...InitialWhitelist.data]

					if (InitialWhitelist.meta.lastPage > 1) {
						for (let page = 1; page < InitialWhitelist.meta.lastPage; page++) {
							const PageResult = (await (await fetch('https://polytoria.com/api/create/whitelist?placeID=' + PlaceID + '&page=' + (page+1))).json())
							WhitelistData.push(...PageResult.data)
						}
					}

					for (let id of WhitelistData.map((x) => x.user.id)) {
						Utilities.RatelimitRepeatingFetch('https://polytoria.com/api/create/remove-whitelist', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								placeID: PlaceID,
								userID: id
							})
						})
					}

					window.location.reload()
				}
			}
		}
	})
}