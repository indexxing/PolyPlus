chrome.storage.sync.get(['PolyPlus'], function (result) {
    if (result.PolyPlus.Settings.ForumMentsOn === false) {
        return;
    }

    const idCache = [];
    const url = "https://polytoria.com/users/:id";
    const text = document.querySelectorAll('p.mb-0');

    async function CheckIDCache(cache, username) {
        for (let i = 0; i < cache.length; i++) {
            const element = cache[i];
            console.log('type', typeof element);
            console.log('expected type', typeof username);

            const cachedUsername = Object.keys(element)[0];
            if (cachedUsername.toString() === username) {
                return [true, element];
            }
        }
        return [false, null];
    }

    async function processLinks(links) {
        for (const link of links) {
            const username = link.textContent.replace(/@/g, '');
            const inCache = await CheckIDCache(idCache, username);
            console.log('1', inCache[0]);
            console.log('2', inCache[1]);

            if (inCache[0] === false) {
                console.log('not cached');
                try {
                    const response = await fetch(`https://api.polytoria.com/v1/users/find?username=${username}`);
                    if (!response.ok) {
                        throw new Error(`An error occurred: ${response.status}`);
                    }
                    const data = await response.json();
                    link.setAttribute('href', url.replace(':id', data.id));
                    idCache.push({ [username]: data.id });
                    console.log(idCache);
                } catch (error) {
                    console.error(error);
                    link.removeAttribute('href');
                }
            } else {
                console.log('cached');
                link.setAttribute('href', url.replace(':id', inCache[1][username]));
            }
        }
    }

    text.forEach(element => {
        let output = element.innerText.replace(/@([\w.]+)/g, '<a href="https://example.com/">@$1</a>');
        output = output.replace(/\n/g, '<br>');
        element.innerHTML = output;

        const links = element.querySelectorAll('a');
        if (!(links.length > 3)) {
            processLinks(links);
        }
    });
});
