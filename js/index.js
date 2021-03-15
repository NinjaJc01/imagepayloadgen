const fileHeaderMap = new Map([
    ["jpegHeader", new Uint8Array([255, 216, 255, 219])],
    ["pngHeader", new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
    ["gifHeader", new Uint8Array([71, 73, 70, 56, 55, 97])]
]);

var payloadObject = {
    headerType: "",
    imageData: ArrayBuffer,
    fileName: ""
}

function onEmbedChosen(self) {
    document.getElementById("headerDiv").style = (self.value === "mime" ? "" : "display: none;")
    document.getElementById("fileDiv").style = (self.value === "exif" ? "" : "display: none;")
}

function onHeaderChosen(self) {
    console.log(self.value)
    if (self.value === "jifHeader") {
        alert("Incorrect pronounciation detected. We've corrected your mistake for now.")
        self.value = "gifHeader"
    }
    payloadObject.headerType = self.value
}

function embedPayloadInPayloadObject() {
    //If it's PNG/JPEG/GIF, add it after header
    if (payloadObject.headerType !== "") {
        //Form Payload buffer?
        const encoder = new TextEncoder();
        const payloadTypedArray = encoder.encode(document.getElementById("payload").value)
        payloadObject.imageData = appendArrayBuffers(fileHeaderMap.get(payloadObject.headerType).buffer, payloadTypedArray.buffer)
        payloadObject.fileName = "payload" + document.getElementById("finalExt").value
    } else { //If it's for an exif, add as Exif comment
        const exif = {}
        //TODO - This exif library doesn't like ArrayBuffer images, just use the form for it
        exif[piexif.ExifIFD.UserComment] = document.getElementById("payload").value
        piexif.insert(piexif.dump({"Exif":exif}), payloadObject.imageData)
    }
}

function appendArrayBuffers(buffer1, buffer2) { // Thanks to https://gist.github.com/72lions/4528834
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}

function makeAndDownloadPayload() {
    embedPayloadInPayloadObject()
    const resultBlob = new Blob([payloadObject.imageData], { type: 'application/octet-binary' })
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(resultBlob);
    link.download = payloadObject.fileName;
    link.click();
}

function imageInfo(self) {
    const file = self.files[0]
    console.log(file.name, file.size, file.type)
    payloadObject.fileName = file.name.split(".")[0]
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function () {
        payloadObject.imageData = reader.result
    }
}