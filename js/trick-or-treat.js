// This was for the limited time 2023 halloween event
const HauntedStudsCount = document.querySelector('[href="/event/active"] .brickBalanceCount')
if (HauntedStudsCount !== null) {
    HauntedStudsCount.innerHTML = HauntedStudsCount.innerHTML + ` <span style="color: orange;">(${parseInt(HauntedStudsCount.innerText) / 8} candies)</style>`
}

if (window.location.pathname === '/event/trick-o-toria-2023') {
    const LeaderboardRows = document.getElementsByClassName('leaderboard-row')
    Array.from(LeaderboardRows).forEach(row => {
        const _HauntedStudsCount = row.querySelector('span[style^="color:#cd60ff;"]')
        _HauntedStudsCount.innerHTML = _HauntedStudsCount.innerHTML + `<br><span style="color: orange;">(${parseFloat(_HauntedStudsCount.innerText.replace(/,/g, '')) / 8} candies)</span>`
    });
}