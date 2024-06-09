chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
	Settings = result.PolyPlus_Settings || {
		ApplyMembershipTheme: {
			Enabled: false,
			Theme: 0
		},
		ApplyMembershipThemeOn: false,
		ApplyMembershipThemeTheme: 0
	};
	if (Settings.ApplyMembershipTheme.Enabled !== true) {
		return;
	}

	MembershipTheme = Settings.ApplyMembershipTheme.Theme === 0 ? 'plus' : 'plusdx';

	document.addEventListener('DOMContentLoaded', function () {
		if (document.getElementsByClassName('card-header')[0] && document.getElementsByClassName('card-header')[0].innerText === ' Page not found') {
			return;
		}

		if (document.getElementsByTagName('NAV')[0].classList.contains('navbar-plus') === true || document.getElementsByTagName('NAV')[0].classList.contains('navbar-plusdx') === true) {
			return;
		}

		const Navbar = document.querySelector('.navbar.navbar-expand-lg.navbar-light.bg-navbar.nav-topbar');
		const Sidebar = document.querySelector('.d-flex.flex-column.flex-shrink-0.bg-sidebar.nav-sidebar');

		Navbar.classList.add('navbar-' + MembershipTheme);
		Sidebar.classList.add('sidebar-' + MembershipTheme);

		let SidebarLogo = Sidebar.getElementsByTagName('img')[0];
		if (MembershipTheme === 'plus') {
			SidebarLogo.src = 'https://c0.ptacdn.com/static/images/branding/icon-plus.8f6e41f1.svg'
		} else {
			SidebarLogo.src = 'https://c0.ptacdn.com/static/images/branding/icon-plusdx.bd9daa92.svg'
		}

		let SidebarLogoLabel = document.createElement('div');
		SidebarLogoLabel.classList = 'n' + MembershipTheme + '-banner';
		SidebarLogoLabel.innerHTML = `
		<i class="pi pi-${MembershipTheme}" style="margin-right:-0.4em"></i>
		`;
		SidebarLogo.parentElement.appendChild(SidebarLogoLabel);

		if (MembershipTheme === 'plusdx' && window.location.pathname === '/home') {
			let HomeUsernameText = document.getElementsByClassName('home-title2')[0];
			HomeUsernameText.classList.add('text-plusdx');
			let Label = document.createElement('div');
			Label.classList = 'hplusdx-banner reqFadeAnim rounded-2';
			Label.setAttribute('style', 'margin-top:-8px');
			Label.innerText = 'Deluxe';
			HomeUsernameText.parentElement.appendChild(Label);
		}
	});
});
