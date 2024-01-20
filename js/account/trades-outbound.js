setTimeout(function() {}, 100)
var SelectedTrades = []

let Parent = document.getElementsByClassName('card mcard p-5 text-center text-muted')[0].parentElement
let Text = document.createElement('p')
Text.classList = 'mx-auto'
Text.style.textAlign = 'center'
Text.style.fontSize = '1.3rem'
Text.innerHTML = `
<span>0</span> trades selected!
<br>
<button id="viewSelectionBtn" class="btn btn-primary">View Selection</button>
<button id="clearSelectionBtn" class="btn btn-warning">Clear Selection</button>
<button id="cancelSelectionBtn" class="btn btn-danger">Cancel Selected Trades</button>
`
Parent.insertBefore(Text, Parent.children[0])
let Text_Span = Text.querySelector('span');
let Text_View = document.getElementById('viewSelectionBtn');
let Text_Clear = document.getElementById('clearSelectionBtn');
let Text_Cancel = document.getElementById('cancelSelectionBtn');

var ConfirmCancel = 0
Text_View.addEventListener('click', function(){});
Text_Clear.addEventListener('click', function(){
    SelectedTrades = []
    UpdateCheckboxes();
    Text_Span.innerText = SelectedTrades.length
});
Text_Cancel.addEventListener('click', function(){
    ConfirmCancel = ConfirmCancel + 1
    switch(ConfirmCancel) {
        case 0:
            Text_Cancel.innerText = 'Cancel Selected Trades'
            break
        case 1:
            Text_Cancel.innerText = 'Are you sure?'
            break
        case 2:
            let Success = true
            for (let i = 0; i < SelectedTrades.length; i++) {
                setTimeout(function () {}, 110)
                console.log(SelectedTrades[i])
                fetch('https://polytoria.com/api/trade/decline', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': document.querySelector('input[name="_csrf"]').value
                    },
                    body: JSON.stringify({ id: SelectedTrades[i] }),
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error:', error);
                    Success = false
                });
            }
            SelectedTrades = []
            UpdateCheckboxes();
            Text_Cancel.innerText = 'Cancel Selected Trades'
            ConfirmCancel = 0
            break
    }
});

LoadCheckBoxes();

function LoadCheckBoxes() {
    Array.from(document.getElementsByClassName('card-inbox')).forEach(element => {
        let ViewBtn = element.querySelector('a.btn.btn-primary')
        let TradeID = parseInt(ViewBtn.getAttribute('href').split('/')[3])
        var NewCheckBox = document.createElement('button')
        NewCheckBox.classList = 'polyplus-multicanceltr-checkbox'
        NewCheckBox.setAttribute('style', 'padding: 20px; background-color: #191919; border: 1px solid #393939; border-radius: 1rem; margin-left: 10px;')
        var Index = SelectedTrades.indexOf(TradeID)
        if (Index !== -1) {
            NewCheckBox.style.borderColor = 'lime'
        }
        ViewBtn.parentElement.appendChild(NewCheckBox)
        NewCheckBox.addEventListener('click', function(){
            var Index = SelectedTrades.indexOf(TradeID)
            if (Index === -1) {
                SelectedTrades.push(TradeID)
                NewCheckBox.style.borderColor = 'lime'
            } else {
                SelectedTrades.splice(Index, 1) 
                NewCheckBox.style.borderColor = '#393939'
            }
            Text_Span.innerText = SelectedTrades.length
            UpdateCheckboxes();
        });
    });
}

function UpdateCheckboxes(){
    document.querySelectorAll('.polyplus-multicanceltr-checkbox').forEach(element => {
        let Parent = element.parentElement
        let ViewBtn = Parent.querySelector('a.btn.btn-primary')
        if (element.getAttribute('disabled')) {
            element.removeAttribute('disabled')
        }
        if (SelectedTrades.IndexOf(ViewBtn.getAttribute('data-user-id')) === -1) {
            element.style.borderColor = '#393939'
        } else {
            element.style.borderColor = 'lime'
            if (SelectedTrades.length >= 10) {
                element.setAttribute('disabled', true)
            }
        }
    })
}