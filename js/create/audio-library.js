const AssetGrid = document.getElementById('assets')

const AssetObserver = new MutationObserver(async function (list) {
	const SelectedTab = document.getElementsByClassName('nav-link active')[0].getAttribute('data-category')
    if (SelectedTab === "audio") {
        for (const record of list) {
            for (const audio of record.addedNodes) {
                if (audio.tagName === 'DIV') {
                    const PlayButton = document.createElement('button')
                    PlayButton.classList = 'btn btn-primary btn-sm'
                    PlayButton.style = 'position: absolute; bottom: 0; right: 0; margin: 5px; margin-bottom: 55px; z-index: 2000;'
                    PlayButton.innerHTML = '<i class="fa-solid fa-play"></i>'
                    audio.getElementsByTagName('a')[0].parentElement.insertBefore(PlayButton, audio.getElementsByTagName('a')[0])
                    audio.children[0].style.position = 'relative'

                    let AudioElement = null
                    let Playing = false
                    PlayButton.addEventListener('click', async function(){
                        if (!Playing) {
                            if (AudioElement === null) {
                                PlayButton.innerHTML = '<div class="spinner-border text-light" role="status" style="--bs-spinner-width: 15px; --bs-spinner-height: 15px; --bs-spinner-border-width: 2px; vertical-align: middle; text-align: center;"><span class="sr-only">Loading...</span></div>'
                                const AudioURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve-audio/' + audio.querySelector('a[href^="/store"]').getAttribute('href').split('/')[2])).json())
                                if (AudioURL.success) {
                                    AudioElement = new Audio(AudioURL.url)
                                } else {
                                    PlayButton.remove();
                                }
    
                                AudioElement.addEventListener("canplaythrough", (event) => {
                                    Playing = true
                                    AudioElement.play();
                                    PlayButton.innerHTML = '<i class="fa-duotone fa-solid fa-play-pause"></i>'
                                    PlayButton.classList = 'btn btn-warning btn-sm'
                                });
                            } else {
                                Playing = true
                                AudioElement.play();
                                PlayButton.innerHTML = '<i class="fa-duotone fa-solid fa-play-pause"></i>'
                                PlayButton.classList = 'btn btn-warning btn-sm'
                            }
    
                            AudioElement.addEventListener("ended", function() {
                                Playing = false
                                PlayButton.innerHTML = '<i class="fa-solid fa-play"></i>'
                                PlayButton.classList = 'btn btn-primary btn-sm'
                            })
                        } else {
                            Playing = false
                            AudioElement.pause()
                            PlayButton.innerHTML = '<i class="fa-solid fa-play"></i>'
                            PlayButton.classList = 'btn btn-primary btn-sm'
                        }
                    })
                }
            }
            AssetObserver.observe(AssetGrid, {attributes: false, childList: true, subtree: false});
        }
    }
});

AssetObserver.observe(AssetGrid, {attributes: false, childList: true, subtree: false});