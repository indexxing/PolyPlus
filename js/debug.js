// DEBUG PAGE FOR BETA TESTING
const Version = chrome.runtime.getManifest().version
document.querySelector('#main-content .container').innerHTML = `
<style>
    #main-content .container label {
        font-size: 0.8rem;
        color: darkgray;
    }

    #main-content .container label + p {
        margin-bottom: 4px;
        font-size: 0.9rem;
        margin-top: -4px;
    }
</style>
<div class="row">
    <div class="col-md-2">
        <div class="card">
            <div class="card-body">
                <p class="text-muted mb-1">Version: v${Version}</p>
                <p class="text-muted mb-1">Data Size: <span id="data-size">Loading</span> byte(s)</p>
                <button class="btn btn-primary btn-sm w-100" id="check-for-updates">Check for Updates</button>
                <a href="https://github.com/IndexingGitHub/PolyPlus" class="btn btn-dark btn-sm w-100 mt-2" target="_blank">Open GitHub</a>
                <!--
                <a href="https://github.com/IndexingGitHub/PolyPlus/issues" class="btn btn-dark btn-sm w-100 mt-2" target="_blank">Open GitHub Issues</a>
                <a href="https://github.com/IndexingGitHub/PolyPlus/pulls" class="btn btn-dark btn-sm w-100 mt-2" target="_blank">Open GitHub PRs</a>
                -->
            </div>
        </div>
        <hr>
        Created by <a href="/users/2782" target="_blank">Index</a>
        <br><br>
        Beta Testers:
        <ul>
            <li><a href="/users/24435" target="_blank">datastore</a></li>
            <li><a href="/users/17064" target="_blank">Emir</a></li>
            <li><a href="/users/9219" target="_blank">InsertSoda</a></li>
            <li><a href="/users/26895" target="_blank">qwp</a></li>
        </ul>
    </div>
    <div class="col">
        <label for="settingName">Edit Setting Value</label>
        <p>Set a value of the extension's local settings data</p>
        <div role="group" class="input-group mb-3">
            <input type="text" name="settingName" id="edit-setting-name" class="form-control" placeholder="Setting Name..">
            <input type="text" id="edit-setting-value" class="form-control" placeholder="New Value..">
            <button class="btn btn-success" id="edit-setting">Submit</button>
        </div>

        <label>Clear Specific Local Data</label>
        <p>Quickly clear specific parts of the extension's local data</p>
        <div role="group" class="btn-group w-100 mb-3">
            <button class="btn btn-secondary" id="reset-settings">Reset Settings to Defaults</button>
            <button class="btn btn-secondary" id="clear-pinnedgames">Clear Pinned Games</button>
            <button class="btn btn-secondary" id="clear-bestfriends">Clear Best Friends</button>
            <button class="btn btn-secondary" id="clear-itemwishlist">Clear Item Wishlist</button>
        </div>

        <label style="color: red;">DANGER ZONE!</label>
        <p>This will clear all local data associated with the extension</p>
        <button class="btn btn-danger w-100" id="delete-all-data">Delete All Data</button>
    </div>
</div>
`

const CheckForUpdatesButton = document.getElementById('check-for-updates')
function CheckForUpdates() {
    CheckForUpdatesButton.removeEventListener('click', CheckForUpdates)
    CheckForUpdatesButton.disabled = true
    fetch('https://polyplus.vercel.app/data/version.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.json()
        })
        .then(data => {
            /*
            const Result = document.createElement('span')
            if (data.version === Version || Math.floor((data.version - Version) * 10) === 0) {
                Result.innerText = 'No updates available'
            } else {
                Result.innerText = Math.floor((data.version - Version) * 10) + ' updates available'
            }
            CheckForUpdatesButton.parentElement.insertBefore(Result, CheckForUpdatesButton)
            CheckForUpdatesButton.remove()
            */
            if (data.version === Version || Math.floor((data.version - Version) * 10) === 0) {
                CheckForUpdatesButton.innerText = 'No updates available'
            } else {
                CheckForUpdatesButton.innerText = Math.floor((data.version - Version) * 10) + ' updates available'
            }
        })
        .catch(error => {console.log(error)});
}
CheckForUpdatesButton.addEventListener('click', CheckForUpdates);

document.getElementById('edit-setting').addEventListener('click', function(){
    const EditSettingName = document.getElementById('edit-setting-name')
    const EditSettingValue = document.getElementById('edit-setting-value')

    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        result = result.PolyPlus_Settings

        let NewValue = EditSettingValue.value
        switch (NewValue) {
            case 'true':
                NewValue = true
                break
            case 'false':
                NewValue = false
                break
            case 'null':
                NewValue = null
                break
            case 'undefined':
                NewValue = undefined
                break
            case parseInt(NewValue):
                NewValue = parseInt(NewValue)
                break
        }
        result[EditSettingName.value] = NewValue

        chrome.storage.sync.set({ 'PolyPlus_Settings': result }, function() {
            alert('Successfully set: "' + EditSettingName.value + '" to ' + NewValue)
        });
    });
});

document.getElementById('reset-settings').addEventListener('click', async function(){
    let Utilities = await import(chrome.runtime.getURL('/js/resources/utils.js'))
    Utilities = Utilities.default
    chrome.storage.sync.set({ 'PolyPlus_Settings': Utilities.DefaultSettings }, function() {
        alert('Successfully reset settings to their defaults!')
    });
});

document.getElementById('clear-pinnedgames').addEventListener('click', function(){
    chrome.storage.sync.set({ 'PolyPlus_PinnedGames': [] }, function() {
        alert('Successfully cleared Pinned Games!')
    });
});

document.getElementById('clear-bestfriends').addEventListener('click', function(){
    chrome.storage.sync.set({ 'PolyPlus_BestFriends': [] }, function() {
        alert('Successfully cleared Best Friends!')
    });
});

document.getElementById('clear-itemwishlist').addEventListener('click', function(){
    chrome.storage.sync.set({ 'PolyPlus_ItemWishlist': [] }, function() {
        alert('Successfully cleared Item Wishlist!')
    });
});

document.getElementById('delete-all-data').addEventListener('click', function(){
    if (confirm("Are you sure you'd like to delete all local data associated with the extension?") === false) { return }
    chrome.storage.sync.clear(function() {
        alert('Successfully deleted all local data associated with the extension!')
    });
});

chrome.storage.sync.getBytesInUse(["PolyPlus_Settings", "PolyPlus_PinnedGames", "PolyPlus_BestFriends", "PolyPlus_ItemWishlist"], function(bytes){
    document.getElementById('data-size').innerText = bytes
});