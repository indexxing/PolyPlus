!(async () => {
    const ID = window.location.pathname.split('/')[3]
    const Response = await fetch('https://api.polytoria.com/v1/places/'+ID)
    let Status = await Response.json()
    Status = Status.isActive
    console.log(Status)

    const Form = document.querySelector('form[action="/create/place/update"]')
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
})()