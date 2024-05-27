/*
    THIS FILE DOES NOT RUN
    IT WAS ADDED WHILE I CONSIDER WHETHER OR NOT TO ADD PINNED GAMES TO THE MAIN PLACES PAGE
*/

let Settings;
let PinnedGamesData;

chrome.storage.sync.get(['PolyPlus_Settings', 'PolyPlus_PinnedGames'], function(result){
    Settings = result.PolyPlus_Settings || {}
    PinnedGamesData = result.PolyPlus_PinnedGames || []

    if (Settings.PinnedGamesOn === true) {}
})

function PinnedGames() {
    for (let game of PinnedGamesData) {
        fetch('https://api.polytoria.com/v1/places/' + game)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network not ok')
                }
                return response.json()
            })
            .then(data => {
                // epic
            })
            .catch(error => {console.log(error)})
    }
}