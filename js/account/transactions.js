setTimeout(function () {}, 100)

let Currencies;

LoadFile(chrome.runtime.getURL('js/resources/currencies.json'), function(text){
    Currencies = JSON.parse(text)
    console.log(new Date(Currencies.Date).toLocaleDateString("en-US", {day:"numeric",month:"long",year:"numeric"}), Currencies)
})

let Nav = document.querySelector('.nav-pills')
let DIV = document.createElement('div')
DIV.innerHTML = `
<input id="polyplus-brickconverter-input" type="number" class="form-control bg-dark mb-2" placeholder="How many Bricks?">
<input id="polyplus-brickconverter-output" type="text" class="form-control bg-dark mb-2" placeholder="Result" disabled>
<select id="polyplus-brickconverter-type" class="form-select bg-dark mb-2">
    <option value="USD" selected>United States Dollar (USD)</option>
    <option value="EUR">Euro (EUR)</option>
    <option value="CAD">Canadian Dollar (CAD)</option>
    <option value="GBP">Great British Pound (GBP)</option>
    <option value="MXN">Mexican Peso (MXN)</option>
    <option value="AUD">Australian Dollar (AUD)</option>
    <option value="TRY">Turkish Lira (TRY)</option>
</select>
<select id="polyplus-brickconverter-package" class="form-select bg-dark">
    <option value="0" selected>$0.99 USD</option>
    <option value="1">$4.99 USD</option>
    <option value="2">a</option>
    <option value="3">b</option>
    <option value="4">c</option>
    <option value="5">d</option>
</select>
`
Nav.appendChild(document.createElement('hr'))
Nav.appendChild(DIV)

let Input = document.getElementById('polyplus-brickconverter-input')
let Output = document.getElementById('polyplus-brickconverter-output')
let Type = document.getElementById('polyplus-brickconverter-type')
chrome.storage.sync.get(['PolyPlus_Settings'], function(result){
    Type.selectedIndex = result.PolyPlus_Settings.IRLPriceWithCurrencyCurrency || 0
});
let Package = document.getElementById('polyplus-brickconverter-package')

Input.addEventListener('change', function(){
    Update()
});

Type.addEventListener('change', function(){
    Update()
});

Package.addEventListener('change', function(){
    Update()
});

function Update(){
    let DISPLAY = Type.options[Type.selectedIndex].value
    let IRL = (parseInt(Input.value.replace(/,/g, '')) * Currencies.Data[Package.selectedIndex][DISPLAY]).toFixed(2)
    /*
    var IRL;
    var DISPLAY;
    switch (Type.selectedIndex) {
        case 0:
            IRL = (parseInt(Input.value.replace(/,/g, '')) * 0.0099).toFixed(2)
            DISPLAY = 'USD'
            break
        case 1:
            IRL = (parseInt(Input.value.replace(/,/g, '')) * 0.009).toFixed(2)
            DISPLAY = 'EUR'
            break
        case 2:
            IRL = (parseInt(Input.value.replace(/,/g, '')) * 0.0131).toFixed(2)
            DISPLAY = 'CAD'
            break
        case 3:
            IRL = (parseInt(Input.value.replace(/,/g, '')) * 0.0077).toFixed(2)
            DISPLAY = 'GBP'
            break
        case 4:
            IRL = (parseInt(Input.value.replace(/,/g, '')) * 0.1691).toFixed(2)
            DISPLAY = 'MXN'
            break
        case 5:
            IRL = (parseInt(Input.value.replace(/,/g, '')) * 0.0144).toFixed(2)
            DISPLAY = 'AUD'
            break
        case 6:
            IRL = (parseInt(Input.value.replace(/,/g, '')) *  0.2338).toFixed(2)
            DISPLAY = 'TRY'
            break
    }
    */
    Output.value = "$" + IRL  + " " + DISPLAY
}

function LoadFile(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { return callback(this.responseText); }
    xhr.open("GET", path, true);
    xhr.send();
}