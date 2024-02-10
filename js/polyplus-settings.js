const InExtensionSettings = (window.location.pathname.split('/')[3] === "polyplus")
if (InExtensionSettings === true) { window.location.href = chrome.runtime.getURL('settings.html') }

document.addEventListener('DOMContentLoaded', function(){
  const Nav = document.getElementsByClassName('nav nav-pills')[0]
  
  if (InExtensionSettings === true) {
    Array.from(Nav.children).forEach(item => {
      if (item.classList.contains('active')) {
        item.classList.remove('active')
      }
    })
  }

  const PolyPlusItem = document.createElement('a')
  PolyPlusItem.classList = 'nav-link'
  PolyPlusItem.href = chrome.runtime.getURL('settings.html')
  PolyPlusItem.innerHTML = `
  <i class="fa-regular fa-sparkles me-1"></i> <span class="pilltitle">Poly+</span>
  `

  Nav.insertBefore(PolyPlusItem, Nav.getElementsByTagName('hr')[0])
});