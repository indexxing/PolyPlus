let NavColumn = document.getElementsByClassName('col-lg-2')[0]
let LaunchCreatorBtn = document.createElement('button')
LaunchCreatorBtn.classList = 'btn btn-success w-100'
LaunchCreatorBtn.innerText = 'Launch Creator'
LaunchCreatorBtn.setAttribute('data-id', '1')
LaunchCreatorBtn.setAttribute('onclick', 'editPlace(this)')
NavColumn.appendChild(LaunchCreatorBtn)