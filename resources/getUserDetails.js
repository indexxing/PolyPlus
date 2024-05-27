window.localStorage.setItem('p+account_info', JSON.stringify({
    ID: userID,
    Bricks: document.querySelector('.brickBalanceCont').innerText.replace(/\s+/g,'')
}))