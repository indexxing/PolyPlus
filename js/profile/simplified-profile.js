let Username = window.location.href.split('/')[4]

chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
    Settings = result.PolyPlus_Settings;

    if (Settings.SimplifiedProfileURLsOn === true) {
        fetch("https://api.polytoria.com/v1/users/find?username=" + Username)
        .then(response => response.json())
        .then(data => {
            window.location.href = "https://polytoria.com/users/" + data.id
        })
        .catch(error => {
            console.log("An error occurred:", error);
        });
    }

    if (!(parseInt(userID))) {
        return
    }
});