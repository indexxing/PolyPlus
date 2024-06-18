/*
    ParseGLB & GetTexture function code made by ChatGPT (I didn't want to use external libraries because of storage space)
*/

const ExtractButton = document.getElementById('extract-texture')

ExtractButton.addEventListener('click', async function(){
    const MeshURL = (await (await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + ExtractButton.previousElementSibling.value)).json()).url

    if (MeshURL !== undefined) {
        const Mesh = (await (await fetch(MeshURL)).arrayBuffer())
        const ParsedGTLF = ParseGLB(Mesh)

        const Texture = GetTexture(ParsedGTLF);
        if (Texture) {
            const DownloadLink = document.createElement('a');

            DownloadLink.href = Texture;
            DownloadLink.download = ExtractButton.previousElementSibling.value + '.png';
            document.body.appendChild(DownloadLink)
            DownloadLink.click()
            DownloadLink.remove()
        }
    }
})

function ParseGLB(arrayBuffer) {
    const MAGIC_glTF = 0x46546C67;

    const dataView = new DataView(arrayBuffer);

    const magic = dataView.getUint32(0, true);
    if (magic !== MAGIC_glTF) {
        throw new Error('Invalid GLB file.');
    }

    const version = dataView.getUint32(4, true);
    if (version !== 2) {
        throw new Error('Unsupported GLB version.');
    }

    const length = dataView.getUint32(8, true);
    const chunkLength = dataView.getUint32(12, true);
    const chunkType = dataView.getUint32(16, true);

    if (chunkType !== 0x4E4F534A) {
        throw new Error('Invalid GLB JSON chunk.');
    }

    const jsonChunk = new TextDecoder().decode(
        new Uint8Array(arrayBuffer, 20, chunkLength)
    );
    const json = JSON.parse(jsonChunk);

    const binChunkHeader = 20 + chunkLength;
    const binChunkLength = dataView.getUint32(binChunkHeader, true);
    const binChunkType = dataView.getUint32(binChunkHeader + 4, true);

    if (binChunkType !== 0x004E4942) {
        throw new Error('Invalid GLB BIN chunk.');
    }

    const binChunk = arrayBuffer.slice(binChunkHeader + 8, binChunkHeader + 8 + binChunkLength);

    return {
        json: json,
        bin: binChunk
    };
}

function GetTexture(gltf) {
    let Texture = null

    const images = gltf.json.images;
    if (images.length === 0) {
        return null;
    }

    const image = images[0];
    const bufferView = gltf.json.bufferViews[image.bufferView];
    const byteOffset = bufferView.byteOffset || 0;
    const byteLength = bufferView.byteLength;
    const buffer = new Uint8Array(gltf.bin, byteOffset, byteLength);

    const blob = new Blob([buffer], { type: image.mimeType });
    return URL.createObjectURL(blob);
}