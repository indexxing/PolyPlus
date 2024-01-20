let Avatar = {
    "useCharacter": true,
    "items": [],
    "shirt": "https://c0.ptacdn.com/assets/uWrrnFGwgNN5W171vqYTWY7E639rKiXK.png",
    "pants": "https://c0.ptacdn.com/assets/HD6TFdXD8CaflRNmd84VCNyNsmTB0SH3.png",
    "headColor": "#e0e0e0",
    "torsoColor": "#e0e0e0",
    "leftArmColor": "#e0e0e0",
    "rightArmColor": "#e0e0e0",
    "leftLegColor": "#e0e0e0",
    "rightLegColor": "#e0e0e0"
}

const Style = document.createElement('style')
Style.innerHTML = `
html:has(.polyplus-modal[open]), body:has(.polyplus-modal[open]) {
    overflow: hidden;
}

.polyplus-modal::backdrop {
    background: rgba(0, 0, 0, 0.73);
}
`
document.body.prepend(Style)

const ItemType = document.getElementsByClassName('px-4 px-lg-0 text-muted text-uppercase mb-3')[0].innerText.toLowerCase().split(' ')[1]
const ItemThumbnail = document.getElementsByClassName('store-thumbnail')[0]
const IFrame = document.getElementsByClassName('store-thumbnail-3d')[0]
const TryIFrame = document.createElement('iframe')
TryIFrame.setAttribute('style', 'width: 100%; height: auto; aspect-ratio: 1; border-radius: 20px;')

const TryOnBtn = document.createElement('button')
TryOnBtn.classList = 'btn btn-outline-warning'
TryOnBtn.setAttribute('style', 'position: absolute; bottom: 15px;')
TryOnBtn.innerHTML = '<i class="fa-duotone fa-vial"></i>'
TryOnBtn.addEventListener('click', function (){
    TryOnModal.showModal()
});
if (typeof(document.getElementsByClassName('3dviewtoggler')[0]) === 'object') {
    TryOnBtn.style.right = '60px'
} else {
    TryOnBtn.style.right = '10px'
}

let TryOnModal = document.createElement('dialog')
TryOnModal.classList = 'polyplus-modal'
TryOnModal.setAttribute('style', 'width: 450px; border: 1px solid #484848; background-color: #181818; border-radius: 20px; overflow: hidden;')
TryOnModal.innerHTML = `
<div class="text-muted mb-2" style="font-size: 0.8rem;">
    <h5 class="mb-0" style="color: #fff;">Preview</h5>
    Try on this item!
</div>
<div class="modal-body">
    <button class="btn btn-primary w-100 mx-auto" onclick="this.parentElement.parentElement.close();">Close</button>
</div>
`

document.body.prepend(TryOnModal)
ItemThumbnail.parentElement.appendChild(TryOnBtn)
TryOnModal.children[1].prepend(TryIFrame)

fetch("https://api.polytoria.com/v1/users/:id/avatar".replace(':id', JSON.parse(window.localStorage.getItem('account_info')).ID))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.assets.forEach(item => {
                switch (item.type) {
                    case 'hat':
                        Avatar.items[Avatar.items.length] = item.path || ''
                        break
                    case 'face':
                        Avatar.face = item.path || ''
                        break
                    case 'tool':
                        Avatar.tool = item.path || ''
                        break
                    case 'shirt':
                        Avatar.shirt = item.path || ''
                        break
                    case 'pants':
                        Avatar.pants = item.path || ''
                        break
                }
            });

            Avatar.headColor = "#" + data.colors.head
            Avatar.torsoColor = "#" + data.colors.torso
            Avatar.leftArmColor = "#" + data.colors.leftArm
            Avatar.rightArmColor = "#" + data.colors.rightArm
            Avatar.leftLegColor = "#" + data.colors.leftLeg
            Avatar.rightLegColor = "#" + data.colors.rightLeg

            if (ItemType === 'hat' || ItemType === 'tool') {
                fetch("https://api.polytoria.com/v1/assets/serve-mesh/:id".replace(':id', window.location.pathname.split('/')[2]))
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (ItemType === 'hat') {
                            Avatar.items[Avatar.items.length] = data.url
                        } else if (ItemType === 'tool') {
                            Avatar.tool = data.url
                        }

                        console.log(Avatar)
                        TryIFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)))
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                    });
            } else {
                fetch("https://api.polytoria.com/v1/assets/serve/:id/Asset".replace(':id', window.location.pathname.split('/')[2]))
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        switch (ItemType) {
                            case 'shirt':
                                Avatar.shirt = data.url
                                break
                            case 'pants':
                                Avatar.pants = data.url
                                break
                            case 'face':
                                Avatar.face = data.url
                                break
                        }

                        TryIFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + btoa(encodeURIComponent(JSON.stringify(Avatar)))
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                    });
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });