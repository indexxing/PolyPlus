let Comments = document.getElementById('comments')
const Type = window.location.pathname.split('/')[1]

let CreatorID;
switch (Type) {
    case 'store':
        if (document.querySelector('h5 .text-reset[href^="/users/"]')) {
            CreatorID = document.querySelector('h5 .text-reset[href^="/users/"]').getAttribute('href').split('/')[2]
        } else {CreatorID = 1}
        break
    case 'places':
        CreatorID = document.querySelector('.mcard .col .text-muted [href^="/users/"]').getAttribute('href').split('/')[2]
        break
    case 'feed':
        CreatorID = document.querySelector('p a[href^="/users/"].text-reset').getAttribute('href').split('/')[2]
        break
    case 'guilds':
        CreatorID = document.querySelector('[class^="userlink-"][href^="/users/"]').getAttribute('href').split('/')[2]
        Comments = document.getElementById('wall-posts')
        break
}
Array.from(Comments.children).forEach(element => {
    LoadCreatorTag(element)
});

const Observer = new MutationObserver(function (list){
    for (let record of list) {
        for (let element of record.addedNodes) {
            LoadCreatorTag(element)
        }
    }
});
Observer.observe(Comments, {attributes: false, childList: true, subtree: false})

function LoadCreatorTag(element) {
    let NameElement;
    if (!(Type === 'guilds')) {
        NameElement = element.querySelector('.text-reset[href^="/users/"]')
    } else {
        NameElement = element.querySelector('[class^="userlink-"][href^="/users/"]')
    }
    let UserID = NameElement.getAttribute('href').split('/')[2]
    if (UserID === CreatorID) {
        let Tag = document.createElement('span')
        Tag.classList = 'badge bg-primary'
        Tag.style.marginLeft = '5px'
        Tag.style.verticalAlign = 'text-top'
        Tag.innerText = 'CREATOR'
        NameElement.appendChild(Tag)
        //console.log(window.bootstrap)
        //new window.bootstrap.Tooltip(Tag, {toggle:"tooltip",title:"This user is the creator of this asset!"})
    }
}