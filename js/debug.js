// DEBUG MENU FOR CLEARING PINNED GAMES AND BEST FRIENDS
document.querySelector('#main-content .container').innerHTML = `
<button class="btn btn-warning" id="clear-pins">Clear Pinned Games</button>

<br>

<button class="btn btn-warning" id="clear-bf">Clear Best Friends</button>

<br>

<label for="settingName">Edit Setting Value</label>
<div class="input-group">
    <input type="text" name="settingName" id="edit-setting-name" class="form-control" placeholder="Setting Name..">
    <input type="text" id="edit-setting-value" class="form-control" placeholder="New Value..">
    <button class="btn btn-warning" id="edit-setting">Submit</button>
</div>
`

const ClearPins = document.getElementById('clear-pins')
const ClearBF = document.getElementById('clear-bf')
const EditSettingName = document.getElementById('edit-setting-name')
const EditSettingValue = document.getElementById('edit-setting-value')
const EditSettingBtn = document.getElementById('edit-setting')

ClearPins.addEventListener('click', function(){
    chrome.storage.sync.set({ 'PolyPlus_PinnedGames': [] }, function() {
        alert('Successfully cleared Pinned Games.')
    });
});

ClearBF.addEventListener('click', function(){
    chrome.storage.sync.set({ 'PolyPlus_BestFriends': [] }, function() {
        alert('Successfully cleared Best Friends.')
    });
});

EditSettingBtn.addEventListener('click', function(){
    chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
        result = result.PolyPlus_Settings

        let NewValue = EditSettingValue.value
        if (NewValue === "true") {NewValue = true}
        if (NewValue === "false") {NewValue = false}
        if (parseInt(NewValue)) {NewValue = parseInt(NewValue)}
        result[EditSettingName.value] = NewValue

        chrome.storage.sync.set({ 'PolyPlus_Settings': result }, function() {
            alert('Successfully set: "' + EditSettingName.value + '" to ' + NewValue)
        });

        alert('Successfully cleared Best Friends.')
    });
});