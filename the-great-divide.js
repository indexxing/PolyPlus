chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
    Settings = result.PolyPlus_Settings || {};

	if (Settings.TheGreatDivide.Enabled !== true) {
		return
	}

	let EventOngoing = true
	let HasTeam = true
	if (document.querySelector('#user-avatar-card a[href="/event/the-great-divide"]') === null) { HasTeam = false }
	if (new Date().getMonth().toString()+new Date().getDate().toString() >= 714) { EventOngoing = false }

    if (Settings.TheGreatDivide.UnbalancedIndicatorOn === true && window.location.pathname.split('/')[1] === 'places' && window.location.pathname.split('/')[2] === '9656') {
        UnbalancedServerMarkers()
    }

	console.log('ongoing|has team', EventOngoing, HasTeam)
	if (Settings.TheGreatDivide.UserStatsOn === true && window.location.pathname.split('/')[1] === 'u') {
		if (HasTeam === true) {
			UserStatsTab()
		} else {
			if (EventOngoing === true) {
				UserStatsTab()
			}
		}
	}
})

async function UnbalancedServerMarkers() {
	const Team = (await (await fetch('https://api.polytoria.com/v1/users/' + JSON.parse(window.localStorage.getItem('p+account_info')).ID + '/greatdivide')).json()).team
	if (Team !== undefined) {
		const Servers = Array.from(document.getElementById('servers-tabpane').children)

		Servers.forEach(server => {
			const TeamCounts = {
				phantoms: server.getElementsByClassName('border-phantoms').length,
			 	cobras: server.getElementsByClassName('border-cobras').length
			}

			let Enemy = "cobras"
			if (Team === "cobras") { Enemy = "phantoms" }

			if (new URLSearchParams(window.location.search).has('forceServerUnbalance')) {
				TeamCounts[Enemy] = 1000
			}

			if (TeamCounts[Team] < TeamCounts[Enemy]) {
				const UnbalancedText = document.createElement('p')
				UnbalancedText.classList = 'mb-2'
				UnbalancedText.style.fontSize = '0.7rem'
				UnbalancedText.style.color = 'orange'
				UnbalancedText.innerHTML = `*Potentially Unbalanced <i class="fa-solid fa-circle-info" data-bs-toggle="tooltip" data-bs-title="${TeamCounts.cobras} Cobras and ${TeamCounts.phantoms} Phantoms" data-bs-placement="right"></i>`
				
				const ServerInfoColumn = server.getElementsByClassName('col-3')[0]
				ServerInfoColumn.children[0].style.marginBottom = '0px'
				ServerInfoColumn.insertBefore(UnbalancedText, ServerInfoColumn.children[1])

				Utilities.InjectResource("registerTooltips")
			}
		})
	}
}

async function UserStatsTab() {
	const EventSection = document.createElement('div')
	EventSection.innerHTML = `
	<div class="d-grid mt-2 mb-4"></div>
	<h6 class="section-title px-3 px-lg-0">
		<i class="fas fa-swords me-1"></i> Great Divide
	</h6>
	<div class="card mcard card-themed mb-4">
		<div class="card-body" id="p+greatdivide_card">
			<button class="btn btn-primary btn-sm w-100">Load Statistics</button>
		</div>
	</div>
	`
	document.getElementsByClassName('user-right')[0].appendChild(EventSection)

	const EventCard = document.getElementById('p+greatdivide_card')
	EventCard.innerHTML = `
	<small class="d-block text-center text-muted" style="font-size: 0.8rem;">
		loading...
	</small>
	<lottie-player id="avatar-loading" src="https://c0.ptacdn.com/static/images/lottie/poly-brick-loading.2b51aa85.json" background="transparent" speed="1" style="width: 20%;height: auto;margin: -16px auto 50px;margin-top: 0px;" loop="" autoplay=""></lottie-player>
	`
	chrome.runtime.sendMessage({
		action: "greatdivide_stats",
		userID: document.querySelector('.dropdown-item.text-danger[href^="/report"]').getAttribute('href').split('?')[0].split('/')[3]
	});
}

async function UserStatsTabOLD() {
	const Tabs = document.getElementById('user-info-tabs')

	const EventTab = document.createElement('li')
	EventTab.classList = 'nav-item'
	EventTab.style.marginLeft = 'auto'
	EventTab.innerHTML = `
	<a class="nav-link fw-semibold" href="#!" aria-selected="false" tabindex="-1" role="tab" style="background-clip:text;-webkit-background-clip:text;color:transparent;background-image: linear-gradient(90deg, #1ad05b, #68f);-webkit-text-fill-color: transparent;">
		<img style="width: 25px;height: auto;" src="https://c0.ptacdn.com/static/images/misc/event/dpoint.af12a3d7.png">
		Great Divide
	</a>
	`
	Tabs.appendChild(EventTab)

	const TabContainer = document.createElement('div')
	TabContainer.id = 'p+greatdivide_stats'
	TabContainer.classList = 'tab-pane fade d-none'
	TabContainer.innerHTML = `
	<small class="d-block text-center text-muted" style="font-size: 0.8rem;">
    	loading...
  	</small>
  	<lottie-player id="avatar-loading" src="https://c0.ptacdn.com/static/images/lottie/poly-brick-loading.2b51aa85.json" background="transparent" speed="1" style="width: 20%;height: auto;margin: -16px auto 50px;margin-top: 0px;" loop="" autoplay=""></lottie-player>
	`
	document.getElementById('user-friends').parentElement.appendChild(TabContainer)

	const ToggleTab = function(tab){
		Array.from(Tabs.children).forEach((tab) => {
			tab.children[0].classList.remove('active');
		});
		Array.from(document.getElementById('user-friends').parentElement.children).forEach((tab) => {
			tab.classList.add('d-none');
			tab.classList.remove('active');
			tab.classList.remove('show');
		});
		tab.children[0].classList.add('active');
		
		let SelectedTab
		if (tab.children[0].getAttribute('data-bs-target')) {
			SelectedTab = document.getElementById(tab.children[0].getAttribute('data-bs-target').substring(1))
		} else if (tab.children[0].classList.contains('fw-bold')) {
			SelectedTab = TabContainer
		}
		SelectedTab.classList.add('active');
		SelectedTab.classList.add('show');
		SelectedTab.classList.remove('d-none');
	}

	Array.from(Tabs.children).forEach((tab) => {
		tab.addEventListener('click', function () {
			ToggleTab(tab)
		});
	});

	let Fetched = false
	EventTab.addEventListener('click', async function(){
		if (Fetched === false) {
			chrome.runtime.sendMessage({
				action: "greatdivide_stats",
				userID: document.querySelector('.dropdown-item.text-danger[href^="/report"]').getAttribute('href').split('?')[0].split('/')[3]
			});
			Fetched = true
		}
	})
}