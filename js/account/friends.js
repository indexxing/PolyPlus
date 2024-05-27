var SelectedFriends = [];

chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
	Settings = result.PolyPlus_Settings;
	if (Settings.ImprovedFrListsOn === true) {
		var Tab = 'requests';

		var FriendsContainer = document.getElementById('friends-container');
		var Container = document.createElement('div');
		Container.classList = 'row mb-3';
		Container.innerHTML = `
        <div class="col"><button id="AccAllFrBtn" class="btn btn-success w-100">Accept all Friend Request(s)</button></div>
        <div class="col"><button id="DelAllFrBtn" class="btn btn-danger w-100">Decline all Friend Request(s)</button></div>
        `;
		FriendsContainer.parentElement.insertBefore(Container, FriendsContainer);
		var AccAllFrBtn = document.getElementById('AccAllFrBtn');
		var DelAllFrBtn = document.getElementById('DelAllFrBtn');
		var AccBtns = document.querySelectorAll('[onclick="acceptFriendRequest(this)"]');
		var DelBtns = document.querySelectorAll('[onclick="declineFriendRequest(this)"]');
		if (!(AccBtns.length === 0)) {
			AccAllFrBtn.addEventListener('click', function () {
				AccBtns.forEach((element) => {
					setTimeout(function () {}, 145);
					fetch('https://polytoria.com/api/friends/send', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
						},
						body: JSON.stringify({userID: parseInt(element.getAttribute('data-user-id'))})
					}).catch((error) => {
						// Handle any errors
						console.error('Error:', error);
						Success = false;
					});

					/*
                    let NewAcceptBtn = document.createElement('a')
                    NewAcceptBtn.style.display = 'none'
                    sNewAcceptBtn.classList = 'btn btn-success'
                    NewAcceptBtn.setAttribute('data-user-id', element.getAttribute('data-user-id'))
                    NewAcceptBtn.setAttribute('onclick', 'acceptFriendRequest(this)')
                    FriendsContainer.appendChild(NewAcceptBtn)
                    NewAcceptBtn.click();
                    */
				});
			});
		} else {
			AccAllFrBtn.setAttribute('disabled', 'true');
		}
		if (!(DelBtns.length === 0)) {
			DelAllFrBtn.addEventListener('click', function () {
				DelBtns.forEach((element) => {
					setTimeout(function () {}, 110);
					fetch('https://polytoria.com/api/friends/remove', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
						},
						body: JSON.stringify({userID: parseInt(element.getAttribute('data-user-id'))})
					}).catch((error) => {
						// Handle any errors
						console.error('Error:', error, document.querySelector('input[name="_csrf"]').value);
						Success = false;
					});

					/*
                    let NewDeclineBtn = document.createElement('a')
                    NewDeclineBtn.style.display = 'none'
                    NewDeclineBtn.classList = 'btn btn-danger'
                    NewDeclineBtn.setAttribute('data-user-id', element.getAttribute('data-user-id'))
                    NewDeclineBtn.setAttribute('onclick', 'declineFriendRequest(this)')
                    FriendsContainer.appendChild(NewDeclineBtn)
                    NewDeclineBtn.click();
                    */
				});
			});
		} else {
			DelAllFrBtn.setAttribute('disabled', 'true');
		}
		let Text = document.createElement('p');
		Text.classList = 'mx-auto';
		Text.style.textAlign = 'center';
		Text.style.fontSize = '1.3rem';
		Text.style.display = 'none';
		Text.innerHTML = `
        <span>0</span> friends selected!
        <br>
        <button id="viewSelectionBtn" class="btn btn-primary">View Selection</button>
        <button id="clearSelectionBtn" class="btn btn-warning">Clear Selection</button>
        <button id="removeSelectionBtn" class="btn btn-danger">Remove Selected Friends</button>
        `;
		FriendsContainer.parentElement.insertBefore(Text, FriendsContainer);
		let Text_Span = Text.querySelector('span');
		let Text_View = document.getElementById('viewSelectionBtn');
		let Text_Clear = document.getElementById('clearSelectionBtn');
		let Text_Remove = document.getElementById('removeSelectionBtn');
		document.querySelector('[data-friends-tab="requests"]').addEventListener('click', function () {
			Tab = 'requests';
			Container.style.display = '';
			Text.style.display = 'none';
			document.querySelectorAll('input[type="check"]').forEach((element) => {
				element.remove();
			});
		});
		document.querySelector('[data-friends-tab="friends"]').addEventListener('click', function () {
			Tab = 'friends';
			Container.style.display = 'none';
			Text.style.display = '';
		});
		var ConfirmRemove = 0;
		Text_View.addEventListener('click', function () {});
		Text_Clear.addEventListener('click', function () {
			SelectedFriends = [];
			UpdateCheckboxes();
			Text_Span.innerText = SelectedFriends.length;
		});
		Text_Remove.addEventListener('click', function () {
			ConfirmRemove = ConfirmRemove + 1;
			switch (ConfirmRemove) {
				case 0:
					Text_Remove.innerText = 'Remove Selected Friends';
					break;
				case 1:
					Text_Remove.innerText = 'Are you sure?';
					break;
				case 2:
					for (let i = 0; i < SelectedFriends.length; i++) {
						setTimeout(function () {}, 110);
						let NewDeclineBtn = document.createElement('a');
						NewDeclineBtn.style.display = 'none';
						NewDeclineBtn.classList = 'btn btn-danger';
						NewDeclineBtn.setAttribute('data-user-id', SelectedFriends[i]);
						NewDeclineBtn.setAttribute('onclick', 'declineFriendRequest(this)');
						FriendsContainer.appendChild(NewDeclineBtn);
						NewDeclineBtn.click();
					}
					SelectedFriends = [];
					UpdateCheckboxes();
					Text_Remove.innerText = 'Remove Selected Friends';
					ConfirmRemove = 0;
					break;
			}
		});

		const observer = new MutationObserver(function () {
			if (FriendsContainer.children.length > 0 && Tab === 'friends') {
				LoadCheckBoxes();
			}
		});
		observer.observe(FriendsContainer, {childList: true, subtree: false});

		function LoadCheckBoxes() {
			Array.from(FriendsContainer.children).forEach((element) => {
				let DeclineBtn = element.querySelector('a.btn.btn-danger');
				let UserID = DeclineBtn.getAttribute('data-user-id');
				let Column = document.createElement('div');
				let EditColumn = element.querySelector('.col-9');
				Column.classList = 'col-auto';
				var NewCheckBox = document.createElement('button');
				NewCheckBox.classList = 'polyplus-multiremovefr-checkbox';
				NewCheckBox.setAttribute('style', 'padding: 20px; background-color: #191919; border: 1px solid #393939; border-radius: 1rem;');
				var Index = SelectedFriends.indexOf(UserID);
				if (Index !== -1) {
					DeclineBtn.classList.add('disabled');
					NewCheckBox.style.borderColor = 'lime';
				}
				EditColumn.classList.remove('col-9');
				EditColumn.classList.add('col');
				Column.appendChild(NewCheckBox);
				EditColumn.parentElement.appendChild(Column);
				NewCheckBox.addEventListener('click', function () {
					var Index = SelectedFriends.indexOf(UserID);
					if (Index === -1) {
						DeclineBtn.classList.add('disabled');
						SelectedFriends.push(UserID);
						NewCheckBox.style.borderColor = 'lime';
					} else {
						SelectedFriends.splice(Index, 1);
						NewCheckBox.style.borderColor = '#393939';
						DeclineBtn.classList.remove('disabled');
					}
					Text_Span.innerText = SelectedFriends.length;
					UpdateCheckboxes();
				});
			});
		}

		function UpdateCheckboxes() {
			document.querySelectorAll('.polyplus-multiremovefr-checkbox').forEach((element) => {
				let Parent = element.parentElement.parentElement.parentElement.parentElement.parentElement;
				let DeclineBtn = Parent.querySelector('a.btn.btn-danger');
				if (element.getAttribute('disabled')) {
					element.removeAttribute('disabled');
				}
				if (SelectedFriends.IndexOf(DeclineBtn.getAttribute('data-user-id')) === -1) {
					element.style.borderColor = '#393939';
					DeclineBtn.classList.remove('disabled');
					if (SelectedFriends.length >= 25) {
						element.setAttribute('disabled', true);
					}
				} else {
					DeclineBtn.classList.add('disabled');
					element.style.borderColor = 'lime';
				}
			});
		}
	}
});
