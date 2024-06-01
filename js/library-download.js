const AssetID = window.location.pathname.split('/')[2];
const LibraryType = document.querySelectorAll('ol a')[1].innerText.toLowerCase();
const LibraryTypes = ['model', 'audio', 'decal', 'mesh'];

if (LibraryTypes.filter((x) => !LibraryTypes.some(element => element.startsWith(LibraryType))).length > 0) {
	chrome.storage.sync.get(['PolyPlus_Settings'], function (result) {
		Settings = result.PolyPlus_Settings || {};

		if (Settings.LibraryDownloadsOn === false) {
			return;
		}

		const Dropdown = document.querySelector('#app div[style] .dropdown-menu li');

		const DownloadLink = document.createElement('a');
		DownloadLink.classList = 'dropdown-item text-warning';
		DownloadLink.href = '#';
		DownloadLink.innerHTML = `<i class="fa-duotone fa-download"></i> Download`;
		Dropdown.insertBefore(DownloadLink, Dropdown.children[Dropdown.children.length - 1]);

		switch (LibraryType) {
			case LibraryType.startsWith('model'):
				DownloadLink.href = 'https://api.polytoria.com/v1/models/get-model?id=' + AssetID;
				break;
			case LibraryType.startsWith('audio'):
				const AudioBlob = new Blob([document.getElementsByTagName('audio')[0]], {type: 'octet-steam'});
				DownloadLink.href = URL.createObjectURL(AudioBlob);
				DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.mp3';
			case LibraryType.startsWith('decal'):
				const DecalBlob = new Blob([document.getElementsByClassName('store-thumbnail')[0]], {type: 'image/png'});
				DownloadLink.href = URL.createObjectURL(DecalBlob);
				DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.png';
				break;
		}

		if (LibraryType.startsWith('mesh')) {
			let MeshURL = null;
			DownloadLink.addEventListener('click', async function () {
				if (MeshURL !== null) {
					return;
				}
				MeshURL = await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + AssetID);
				MeshURL = await MeshURL.json();

				if (MeshURL.success === true) {
					DownloadLink.href = MeshURL.url;
					DownloadLink.download = document.getElementsByTagName('h1')[0].innerText + '.glb';

					DownloadLink.click();
				} else {
					alert('Failure to fetch .glb file for mesh');
				}
			});
		}
	});
}
