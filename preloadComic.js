// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let otherView = remote.getGlobal("selectorView");

window.addEventListener('DOMContentLoaded', () => {
    //send an event to the main thread with the clicked coords
    document.addEventListener("click", (event) => {
        event.preventDefault();
        ipcRenderer.send("inspectelement", event.pageX, event.pageY);
    });

    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        if (keyName === "p") {
            event.preventDefault();
            ipcRenderer.send("selectparent");
        }
    }, false);

    //element was selected and should be accessible via js somehow
    ipcRenderer.on("domelementselected", () => {
        //console.log(inspectedElement);
        //alert(inspectedElement.outerHTML)
        let pathName = document.location.pathname;
        let pathFolder = pathName.substr(0, pathName.lastIndexOf("/"));
        let rootURL = document.location.protocol + "//" + document.location.host;

        otherView.webContents.send("messagefromcomic", inspectedElement.outerHTML, window.getComputedStyle(inspectedElement), rootURL + pathFolder + "/");
    });
});

ipcRenderer.on('messagefromselect', (event, message) => {document.body.innerHTML = message });
