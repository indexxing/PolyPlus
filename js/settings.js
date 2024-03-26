const SettingsURL = chrome.runtime.getURL('settings.html')
const InExtensionSettings = (window.location.pathname.split('/')[3] === "polyplus")
if (InExtensionSettings === true) {
  window.location.href = SettingsURL + window.location.hash
}

document.addEventListener('DOMContentLoaded', function(){
  const Nav = document.getElementsByClassName('nav nav-pills')[0]

  const PolyPlusItem = document.createElement('a')
  PolyPlusItem.classList = 'nav-link'
  PolyPlusItem.href = SettingsURL
  PolyPlusItem.innerHTML = `
  <i class="fa-regular fa-sparkles me-1"></i> <span class="pilltitle">Poly+</span>
  `

  Nav.insertBefore(PolyPlusItem, Nav.getElementsByTagName('hr')[0])
});