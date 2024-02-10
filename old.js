let CurrencyNames = [
    "USD",
    "EUR",
    "CAD",
    "GBP",
    "MXN",
    "AUD",
    "TRY",
    "BRL"
]

let Divides = [
    100,
    550,
    1150,
    2750,
    6000,
    12500
]

let Currencies = [
    [
        0.99, // USD
        1.12, // EUR
        1.23, // CAD
        0.81, // GBP
        19.28, // MXN
        1.42, // AUD
        15.83, // TRY
        4.90 // BRL
    ],

    [
        4.99, // USD
        5.59, // EUR
        6.21, // CAD
        4.05, // GBP
        96.44, // MXN
        7.38, // AUD
        80.39, // TRY
        24.71 // BRL
    ],

    [
        9.99, // USD
        11.18, // EUR
        12.34, // CAD
        8.10, // GBP
        192.80, // MXN
        14.76, // AUD
        158.33, // TRY
        49.48 // BRL
    ],

    [
        24.99, // USD
        27.39, // EUR
        29.22, // CAD
        19.20, // GBP
        475.60, // MXN
        34.92, // AUD
        396.66, // TRY
        123.76 // BRL 
    ],

    [
        49.99, // USD
        55.94, // EUR
        58.44, // CAD
        36.40, // GBP
        951.20, // MXN
        73.84, // AUD
        793.32, // TRY
        247.58 // BRL
    ],

    [
        99.99, // USD
        111.88, // EUR
        116.88, // CAD
        72.80, // GBP
        1902.40, // MXN
        147.68, // AUD
        1586.64, // TRY
        495.20 // BRL
    ]
]

let UnitPrices = [
    {},
    {},
    {},
    {},
    {},
    {}
]

Currencies.forEach((_value, _index) => {
    Currencies[_index].forEach((value, index) => {
        UnitPrices[_index][CurrencyNames[index]] = (value / Divides[_index])
    })
});

console.log(JSON.stringify(UnitPrices))
