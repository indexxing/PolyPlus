ExpandMessages()

function ExpandMessages() {
    const Messages = document.getElementById('messages')

    for (let message of Messages.children) {
        let Expanded = false
        let ContentDiv = null

        const ViewButton = message.querySelector('a.btn[href^="/inbox/messages"]')
        const MessageID = ViewButton.getAttribute('href').split('/')[3]

        const ExpandButton = document.createElement('button')
        ExpandButton.classList = 'btn btn-outline-warning px-4 mt-1'
        ExpandButton.innerText = 'Expand'
        ViewButton.parentElement.appendChild(ExpandButton)

        ExpandButton.addEventListener('click', function(){
            if (ContentDiv === null) {
                fetch('https://polytoria.com/inbox/messages/'+MessageID)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network not ok')
                        }
                        return response.text()
                    })
                    .then(data => {
                        const Doc = new DOMParser().parseFromString(data, 'text/html')
                        const MessageContent = Doc.querySelector('p.mb-0').innerText
                        
                        ContentDiv = document.createElement('div')
                        ContentDiv.classList = 'py-2'
                        ContentDiv.innerText = MessageContent
                        message.appendChild(ContentDiv)
                    })
                    .catch(error => {
                        console.log(error)
                    });
            }

            Expanded = !Expanded

            ExpandButton.innerText = (Expanded === false) ? 'Expand' : 'Minimize'
            ContentDiv.style.display = (Expanded === false) ? 'none' : 'block'
        });
    }
}