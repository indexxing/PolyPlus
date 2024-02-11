const ID = window.location.pathname.split('/')[3]
const Form = document.querySelector('form[action="/create/place/update"]')

var Settings;

!(async () => {
    ActivityToggle()
    //RequestGameProfile()
})()

async function ActivityToggle() {
    const Response = await fetch('https://api.polytoria.com/v1/places/'+ID)
    let Status = await Response.json()
    Status = Status.isActive

    const DIV = document.createElement('div')
    DIV.classList = 'form-group mt-4'
    DIV.innerHTML = `
    <label class="mb-2">
      <h5 class="mb-0">Toggle Activity</h5>
      <small class="text-muted">Make your place active or inactive (currently ${(Status === true) ? 'active' : 'inactive'}).</small>
    </label>
    <br>
    `

    Form.insertBefore(DIV, Form.children[Form.children.length-1])

    const ActivityBtn = document.createElement('button')
    ActivityBtn.type = 'button'
    ActivityBtn.classList = 'btn ' + (Status === true ? 'btn-danger' : 'btn-success')
    ActivityBtn.innerText = Status === true ? 'Deactivate' : 'Activate'
    DIV.appendChild(ActivityBtn)

    ActivityBtn.addEventListener('click', function() {
        fetch(`https://polytoria.com/api/places/${ID}/toggle-active`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network not ok ' + response.status)
                }
                return response.json()
            })
            .then(data => {
                Status = data.isActive
                ActivityBtn.innerText = Status === true ? 'Deactivate' : 'Activate'
                ActivityBtn.classList = 'btn ' + (Status === true ? 'btn-danger' : 'btn-success')
            })
            .catch(error => {
                console.log(error)
            });
    });
}

function RequestGameProfile() {
    const Div = document.createElement('div')
    Div.classList = 'card mt-4'
    Div.innerHTML = `
    <div class="card-body">
        <input type="text" class="form-control bg-dark mb-2" placeholder="Game Title..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Background Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Accent Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Secondary Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Card Background Color..">
        <input type="color" class="form-control bg-dark mb-2" placeholder="Text Color..">
        <button type="button" class="btn btn-primary">Submit Request</button>
    </div>
    `
    Form.insertBefore(Div, Form.children[Form.children.length-1])

    const SubmitBtn = Div.getElementsByTagName('button')[0]

    SubmitBtn.addEventListener('click', function(){
        const CardBody = Div.children[0]
        const Result = {
            gameTitle: CardBody.children[0].value,
            bg: CardBody.children[1].value,
            accent: CardBody.children[2].value,
            secondary: CardBody.children[3].value,
            cardBg: CardBody.children[4].value,
            text: CardBody.children[5].value
        }
        window.location.href = 'https://polyplus.vercel.app/app/game-profile.html?gameId=' + ID + '&profile=' + encodeURIComponent(btoa(JSON.stringify(Result)))
    });
}