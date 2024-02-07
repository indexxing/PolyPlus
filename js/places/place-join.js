/*
    DISABLED FEATURE
*/

!(() => {
    return
    const PlaceID = parseInt(window.location.pathname.split('/')[2])
    
    fetch('https://polytoria.com/home')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network not ok')
            }
            return response.text()
        })
        .then(data => {
            const Parser = new DOMParser()
            const Doc = Parser.parseFromString(data, 'text/html')

            fetch('https://polytoria.com/api/places/join',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Csrf-Token': Doc.querySelector('[name="_csrf"]').value
                },
                body: JSON.stringify({
                    'placeID': PlaceID
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network not ok')
                    }
                    return response.json()
                })
                .then(data => {
                    if (data.success !== true) {throw new Error(data.message)}
                    setTimeout(function(){
                        window.location.href = 'polytoria://client/' + data.token
                        window.location.href = 'https://polytoria.com/places/' + PlaceID
                    }, 5000)
                })
                .catch(error => {console.log(error)})
        })
})();