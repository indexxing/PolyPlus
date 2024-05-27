chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
    if (result.PolyPlus_Settings.MoreSearchFiltersOn === true) {
        const BlockedUsersCard = document.getElementsByClassName('card-body')[1]
        const InputGroup = document.createElement('div')
        InputGroup.classList = 'input-group mb-2'
        InputGroup.innerHTML = `
        <input id="blocked-users-search" type="text" class="form-control bg-dark" placeholder="Search blocked users...">
        <button id="blocked-users-confirm" class="btn btn-secondary"><i class="fad fa-search"></i></button>
        `
        BlockedUsersCard.insertBefore(InputGroup, BlockedUsersCard.children[0])
        const SearchBar = document.getElementById('blocked-users-search')
        const ConfirmBtn = document.getElementById('blocked-users-confirm')

        ConfirmBtn.addEventListener('click', function(){
            SearchBlockedUsers(SearchBar.value);
        });

        function SearchBlockedUsers(query) {
            query = query.toLowerCase();
            for (let i = 1; i < BlockedUsersCard.children.length; i++) {
                let Username = BlockedUsersCard.children[i].getElementsByTagName('h5')[0].innerText.toLowerCase();
                if (Username.includes(query)) {
                    BlockedUsersCard.children[i].style.display = 'block'
                } else {
                    BlockedUsersCard.children[i].style.display = 'none'
                }
            }
        }
    }
});