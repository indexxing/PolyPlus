var idCache = []
let url = "https://polytoria.com/users/:id"

console.log('loaded!')

function LowAttentionSpanMode() {
    let PostContent = document.querySelector('.mcard p:nth-child(3)').textContent
    let Captions = CombineArray(PostContent.split(' ')).map((x, i) => `<span data-index="${i}" style="display: none;">${x}</span>`).join('')
    let NumberOfCaptions = (PostContent.split(' ').length) - 1
    Swal.fire({
        title: "No Attention Span Mode",
        html: `
        <video src="${chrome.runtime.getURL('low-attention-span.mp4')}" loop autoplay muted play>
        <div id="polyplus-captions">${Captions}</div>
        `
    });
    let CaptionsElement = document.getElementById('polyplus-captions')

    let Index = 0
    //LoopIteration()

    function LoopIteration() {
        Array.from(CaptionsElement.children).forEach(element => {
            element.style.display = 'none'
        });
        if (CaptionsElement.children[Index] === undefined) {
            Swal.close()
            return
        }
        CaptionsElement.children[Index].style.display = 'block'
        setTimeout(function () {
            console.log(Index, 'Next Caption')
            Index++
            LoopIteration()
        }, 1100)
    }

    function CombineArray(arr) {
        let CombinedArray = [];
        let CurrentCombinedItem = "";

        for (let i = 0; i < arr.length; i++) {
            if ((CurrentCombinedItem + " " + arr[i]).length <= 6) {
                if (CurrentCombinedItem !== "") {
                    CurrentCombinedItem += " ";
                }
                CurrentCombinedItem += arr[i];
            } else {
                CombinedArray.push(CurrentCombinedItem);
                CurrentCombinedItem = arr[i];
            }
        }

        if (CurrentCombinedItem !== "") {
            CombinedArray.push(CurrentCombinedItem);
        }

        return CombinedArray;
    }
}

setTimeout(LowAttentionSpanMode, 525)

chrome.storage.sync.get(['PolyPlus_Settings'], function(result) {
    let text = document.querySelectorAll('p.mb-0 + p')

    if (result.PolyPlus_Settings.ForumMarkOn === true) {
        text.forEach(element => {
            element.innerHTML = MarkdownText(element.innerText)
        });
    }

    if (result.PolyPlus_Settings.ForumMentsOn === true) {
        text.forEach(element => {
            let output = element.innerText.replace(/@([\w.]+)/g, '<a class="polyplus-mention" href="https://example.com/">@$1</a>');
            output = output.replace(/\n/g, '<br>');
            element.innerHTML = output

            let links = element.querySelectorAll('a.polyplus-mention');
            if (!(links.length > 3)) {
                HandleLinks(links, null)
                setTimeout(function () {}, 125)
            }
        });
    }
});

function HandleLinks(links, link, index = 0) {
    if (index >= links.length) {
        return
    }

    link = links[index]
    let username = link.textContent.replace(/@/g, '')
    var inCache = CheckIDCache(username)
    console.log(idCache, inCache)
    if (inCache.success === false) {
        fetch('https://api.polytoria.com/v1/users/find?username=:user'.replace(':user', username))
            .then(response => {
                if (!response.ok) {
                    throw new Error(`An error occurred: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                link.setAttribute('href', url.replace(':id', data.id));
                idCache.push({ "username": username, "id": data.id });
                console.log(idCache);
                HandleLinks(links, null, index + 1)
            })
            .catch(error => {
                console.error(error);
                link.removeAttribute('href');
                HandleLinks(links, null, index + 1)
            });
    } else {
        console.log('cached')
        link.setAttribute('href', url.replace(':id', inCache.id))
        HandleLinks(links, null, index + 1)
    }
}

function CheckIDCache(cache, username) {
    idCache.forEach(element => {
        if (element.username === username) {
            return {"success": true, "id": element.id}
        }
    });
    /*
    for (let i = 0; i < cache.length; i++) {
        const element = cache[i];
        console.log((element.username === username))
        if (element.username === username) {
            return {"success": true, "id": element.id};
        }
    }
    */
    return {"success": false, "id": null};
}

function MarkdownText(text) {
    // Split the text into an array of lines
    const lines = text.split('\n');
  
    // Process each line
    const formattedLines = lines.map(line => {
      if (line.startsWith('###')) {
        // Third-level heading: remove the '###' and wrap in <h3> tag
        const headingText = line.substring(3).trim();
        return `<h3>${headingText}</h3>`;
      } else if (line.startsWith('##')) {
        // Secondary heading: remove the '##' and wrap in <h2> tag
        const headingText = line.substring(2).trim();
        return `<h2>${headingText}</h2>`;
      } else if (line.startsWith('#')) {
        // Big heading: remove the '#' and wrap in <h1> tag
        const headingText = line.substring(1).trim();
        return `<h1>${headingText}</h1>`;
      } else {
        // Apply formatting to the line
        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        formattedLine = formattedLine.replace(/__(.*?)__/g, '<u>$1</u>'); // Underline
        formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
        formattedLine = formattedLine.replace(/~~(.*?)~~/g, '<s>$1</s>'); // Strikethrough
        return formattedLine;
      }
    });
  
    // Join the formatted lines back into a single string
    const formattedText = formattedLines.join('\n\n');
  
    return formattedText;
  }