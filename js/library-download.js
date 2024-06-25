const AssetID = window.location.pathname.split('/')[2];
const LibraryType = document.querySelectorAll('ol a')[1].innerText.toLowerCase();
const LibraryTypes = ['model', 'audio', 'decal', 'mesh', 'shirt', 'pant'];

if (LibraryTypes.some(element => LibraryType.startsWith(element))) {
	chrome.storage.sync.get(['PolyPlus_Settings'], async function (result) {
		Settings = result.PolyPlus_Settings || {};

		if (['model', 'audio', 'decal', 'mesh'].some(element => LibraryType.startsWith(element))) {
			const Breadcrumbs = document.querySelectorAll('ol a')
			Breadcrumbs[0].href = '/library'
			Breadcrumbs[0].innerText = 'Library'
			Breadcrumbs[1].href = '/library'
		}

		if (Settings.LibraryDownloadsOn === false) {
			return;
		}

		const Dropdown = document.querySelector('#app div[style] .dropdown-menu li');

		const DownloadLink = document.createElement('a');
		DownloadLink.classList = 'dropdown-item text-warning';
		DownloadLink.href = '#';
		DownloadLink.innerHTML = `<i class="fa-duotone fa-download"></i> Download`;
		Dropdown.insertBefore(DownloadLink, Dropdown.children[Dropdown.children.length - 1]);

		const SourceLink = document.createElement('a');
		SourceLink.classList = 'dropdown-item text-primary';
		SourceLink.href = '#';
		SourceLink.innerHTML = `<i class="fa-duotone fa-copy"></i> Copy CDN URL`;
		
		if (LibraryType.startsWith('audio') || LibraryType.startsWith('decal') || LibraryType.startsWith('shirt') || LibraryType.startsWith('pant') || LibraryType.startsWith('mesh')) {
			Dropdown.insertBefore(SourceLink, DownloadLink)
		}

		switch (LibraryType) {
			case LibraryType.startsWith('model'):
				DownloadLink.href = 'https://api.polytoria.com/v1/models/get-model?id=' + AssetID;
				break;
			case LibraryType.startsWith('audio'):
				const AudioBlob = new Blob([document.getElementsByTagName('audio')[0]], {type: 'octet-steam'});
				DownloadLink.href = URL.createObjectURL(AudioBlob);
				DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.mp3';

				console.log('aaaaa')
				SourceLink.addEventListener('click', function() {
					console.log('LCICKED!!')
					navigator.clipboard
						.writeText(document.getElementsByTagName('audio')[0].src)
						.then(() => {})
						.catch(() => {
							alert('Failure to copy .png file CDN url to clipboard')
						});
				})
				break;
				/*
			case (LibraryType.startsWith('decal')):
				const DecalBlob = new Blob([document.getElementsByClassName('store-thumbnail')[0]], {type: 'image/png'});
				DownloadLink.href = URL.createObjectURL(DecalBlob);
				DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.png';
				break;
				*/
		}

		if (LibraryType.startsWith('shirt') || LibraryType.startsWith('pant') || LibraryType.startsWith('decal')) {
			let ClothingURL = null;
			DownloadLink.addEventListener('click', async function () {
				if (ClothingURL !== null) {
					return;
				}
				ClothingURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve/' + AssetID + '/Asset')).json());

				if (ClothingURL.success === true) {
					const ClothingBlob = (await (await fetch(ClothingURL.url)).blob())
					DownloadLink.href = URL.createObjectURL(ClothingBlob);
					DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.png';

					DownloadLink.click();
				} else {
					alert('Failure to fetch .png file for clothing item');
				}
			});

			SourceLink.addEventListener('click', async function(){
				if (ClothingURL !== null) {
					return;
				}
				ClothingURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve/' + AssetID + '/Asset')).json());

				if (ClothingURL.success === true) {
					navigator.clipboard.writeText(ClothingURL.url)
						.then(() => {})
						.catch(() => {
							alert('Failure to copy .png file CDN url to clipboard')
						});
				} else {
					alert('Failure to fetch .png file for clothing item');
				}
			})
		} else if (LibraryType.startsWith('mesh')) {
			let MeshURL = null;
			DownloadLink.addEventListener('click', async function () {
				if (MeshURL !== null) {
					return;
				}
				MeshURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + AssetID)).json());

				if (MeshURL.success === true) {
					DownloadLink.href = MeshURL.url;
					DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.glb';

					DownloadLink.click();
				} else {
					alert('Failure to fetch .glb file for mesh');
				}
			});

			SourceLink.addEventListener('click', async function(){
				if (MeshURL !== null) {
					return;
				}
				MeshURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + AssetID)).json());

				if (MeshURL.success === true) {
					navigator.clipboard.writeText(MeshURL.url)
						.then(() => {})
						.catch(() => {
							alert('Failure to copy .glb file CDN url to clipboard')
						});
				} else {
					alert('Failure to fetch .glb file for mesh');
				}
			})
		}
	});
}
