window.localStorage.setItem('p+account_info', JSON.stringify({
    ID: userID,
    Username: document.querySelector('a[href^="/u"]:has(.dropdown-item):first-child').innerText.replaceAll('\n', '').replaceAll('\t', '').trim(),
    Bricks: document.querySelector('.brickBalanceCont').innerText.replace(/\s+/g,'').split('(')[0]
}))