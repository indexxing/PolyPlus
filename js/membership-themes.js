chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
    Settings = result.PolyPlus_Settings || [];

    if (Settings.ApplyMembershipThemeOn !== true) {return}
    MembershipTheme = Settings.ApplyMembershipThemeTheme === 0 ? 'plus': 'plusdx'

    document.addEventListener('DOMContentLoaded', function(){
        if (document.getElementsByClassName('card-header')[0] && document.getElementsByClassName('card-header')[0].innerText === ' Page not found') {
            return
        }
        
        if (document.getElementsByTagName('NAV')[0].classList.contains('navbar-plus') === true || document.getElementsByTagName('NAV')[0].classList.contains('navbar-plusdx') === true) {
            return
        }
        
        const Navbar = document.querySelector('.navbar.navbar-expand-lg.navbar-light.bg-navbar.nav-topbar');
        const Sidebar = document.querySelector('.d-flex.flex-column.flex-shrink-0.bg-sidebar.nav-sidebar');

        Navbar.classList.add('navbar-' + MembershipTheme);
        Sidebar.classList.add('sidebar-' + MembershipTheme);

        if (MembershipTheme === 'plusdx') {
            let SidebarLogo = document.querySelector('.nav-sidebar img');
            SidebarLogo.setAttribute('src', 'https://c0.ptacdn.com/static/images/branding/icon-plusdx.bd9daa92.svg')
            let SidebarLogoLabel = document.createElement('div')
            SidebarLogoLabel.classList = 'nplusdx-banner'
            SidebarLogoLabel.innerHTML = `
            <i class="pi pi-plusdx" style="margin-right:-0.4em"></i>
            `
            SidebarLogo.parentElement.appendChild(SidebarLogoLabel)

            if (window.location.pathname === "/home") {
                let HomeUsernameText = document.getElementsByClassName('home-title2')[0]
                HomeUsernameText.children[0].classList.add('text-plusdx')
                let Label = document.createElement('div')
                Label.classList = 'hplusdx-banner rounded-2'
                Label.setAttribute('style', 'margin-top: -8px; animation-delay: 0.09s;')
                Label.innerText = 'Deluxe'
                HomeUsernameText.appendChild(Label)
            }
        }
    });
});