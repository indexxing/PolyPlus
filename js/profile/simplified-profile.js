const Username = window.location.pathname.split('/')[2]

let Reference = new URLSearchParams(new URL(window.location.href).search).get('ref')
if (Reference === null) {
    Reference = ""
}

fetch("https://api.polytoria.com/v1/users/find?username=" + Username)
    .then(response => {
        if (!response.ok) {
            window.location.href = window.location.origin + decodeURIComponent(Reference)
        } else {
            return response.json()
        }
    })
    .then(data => {
        window.location.href = "https://polytoria.com/users/" + data.id
    })
    .catch(error => {
        console.log("An error occurred:", error);
    });