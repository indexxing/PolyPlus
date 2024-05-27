setTimeout(function () {}, 100);
var Settings;
chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
	Settings = result.PolyPlus_Settings;

	if (!(Settings.MoreSearchFiltersOn === true)) {
		return;
	}

	let Form = document.querySelector('form[action="/forum/search"]');
	let SearchBtn = document.querySelector('button[type="submit"]');
	let CreatedByFilter = document.createElement('div');
	CreatedByFilter.classList = 'input-group mt-2';
	CreatedByFilter.innerHTML = `
    <div class="form-check">
        <input class="form-check-input" type="checkbox">
        <label class="form-check-label" for="createdBy">Created by <input type="text" class="form-control" placeholder="willemsteller" id="createdBy" name="createdBy"></label>
    </div>
    `;
	console.log(SearchBtn);
	Form.insertBefore(CreatedByFilter, SearchBtn.parentElement);
	let CreatedByFilter_Checkbox = CreatedByFilter.querySelector('input[type="checkbox"]');
	let CreatedByFilter_Input = CreatedByFilter.querySelector('input[type="text"]');
	let CreatedByValue = GetURLParameter('createdBy');
	console.log(CreatedByValue);
	if (CreatedByValue) {
		CreatedByFilter_Checkbox.setAttribute('checked', true);
		CreatedByFilter_Input.setAttribute('value', CreatedByValue);
		CreatedByFilter_Input.removeAttribute('disabled');
		document.querySelectorAll('.forum-entry').forEach((element) => {
			console.log(element.querySelectorAll('a[href^="/users/"]')[1].innerText);
			if (!(element.querySelectorAll('a[href^="/users/"]')[1].innerText === CreatedByValue)) {
				element.remove();
			}
		});
	}
	/*
    CreatedByFilter_Checkbox.addEventListener('click', function(){
        let Status = CreatedByFilter_Checkbox.getAttribute('checked')
        if (Status === true) {
            CreatedByFilter_Input.removeAttribute('disabled')
        } else {
            CreatedByFilter_Input.setAttribute('disabled', true)
        }
    });
    */
});

function GetURLParameter(param) {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	return urlParams.get(param);
}
