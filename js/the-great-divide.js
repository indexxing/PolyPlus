let EventOngoing = true;
let Team;
let HasTeam = true;

const PlaceAllowlist = [
	'9656',
	'9757'
];

(async () => {
	Utilities = await import(chrome.runtime.getURL('resources/utils.js'))
		.default

	chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
		Settings = result.PolyPlus_Settings || {};

		if (Settings.TheGreatDivide.Enabled !== true) {
			return
		}

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
		<h6 class="text-center section-title px-3 px-lg-0 fw-bold" style="background-clip:text;-webkit-background-clip:text;color:transparent;background-image: linear-gradient(90deg, #1ad05b, #68f);-webkit-text-fill-color: transparent;">
			<i class="fas fa-swords me-1 float-start"></i>
			GREATEST DIVISION
			<i class="fas fa-swords me-1 float-end"></i>
		</h6>
		<div class="card mcard mb-4" style="min-height: 226px; background-image: linear-gradient(rgba(0.7, 0.7, 0.7, 0.7), rgba(0.7, 0.7, 0.7, 0.7)), url('https://blog.polytoria.com/content/images/2024/06/TheGreatDivide.png'); background-size: cover; background-position: center; border-color: #000 !important;">
			<div class="card-body" id="p+greatdivide_card">
				<button class="btn btn-primary btn-sm w-100">Load Statistics</button>
			</div>
		</div>
		`
		document.getElementsByClassName('user-right')[0].appendChild(EventSection)

		const EventCard = document.getElementById('p+greatdivide_card')
		EventCard.innerHTML = `
		<small class="d-block text-center text-muted" style="font-size: 0.8rem;">
			Loading...
		</small>
		<lottie-player id="avatar-loading" src="https://c0.ptacdn.com/static/images/lottie/poly-brick-loading.2b51aa85.json" background="transparent" speed="1" style="width: 20%;height: auto;margin: -16px auto 50px;margin-top: 0px;" loop="" autoplay=""></lottie-player>
		`
		await chrome.runtime.sendMessage({
			action: "greatdivide_stats",
			userID: document.querySelector('.dropdown-item.text-danger[href^="/report"]').getAttribute('href').split('?')[0].split('/')[3]
		});
	}
})();