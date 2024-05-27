!(() => {
    let Comments = document.getElementById('comments')
    const Type = window.location.pathname.split('/')[1]

    let CreatorID;
    if (Type === 'store') {
        if (document.querySelector('h5 .text-reset[href^="/users/"]')) {
            CreatorID = document.querySelector('h5 .text-reset[href^="/users/"]').getAttribute('href').split('/')[2]
        } else {
            CreatorID = 1
        }
    } else if (Type === 'places') {
        CreatorID = document.querySelector('.mcard .col .text-muted [href^="/users/"]').getAttribute('href').split('/')[2]
    } else if (Type === 'feed') {
        CreatorID = document.querySelector('p a[href^="/users/"].text-reset').getAttribute('href').split('/')[2]
    } else if (Type === 'guilds') {
        CreatorID = document.querySelector('[class^="userlink-"][href^="/users/"]').getAttribute('href').split('/')[2]
        Comments = document.getElementById('wall-posts')
    }

    const Observer = new MutationObserver(function (list){
        for (let record of list) {
            for (let element of record.addedNodes) {
                if (element.classList === 'card mb-3') {
                    LoadCreatorTag(element)
                }
            }
        }
    });
    Observer.observe(Comments, {attributes: false, childList: true, subtree: false})

    const LoadCreatorTag = function(element) {
        let NameElement = element.querySelector('.text-reset[href^="/users/"]')
        if (Type === 'guilds') {
            NameElement = element.querySelector('[class^="userlink-"][href^="/users/"]')
        }

        let UserID = NameElement.getAttribute('href').split('/')[2]
        if (UserID === CreatorID) {
            let Tag = document.createElement('span')
            Tag.classList = 'badge bg-primary'
            Tag.style.marginLeft = '5px'
            Tag.style.verticalAlign = 'text-top'
            Tag.innerText = 'CREATOR'
            if (Type === 'guilds') { Tag.innerText = 'LEADER' }
            NameElement.appendChild(Tag)
            
            //new window.bootstrap.Tooltip(Tag, {toggle:"tooltip",title:"This user is the creator of this asset!"})
        }
    }

    Array.from(Comments.children).forEach(element => {
        LoadCreatorTag(element)
    });
})();