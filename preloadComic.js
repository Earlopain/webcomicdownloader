// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let otherView = remote.getGlobal("selectorView");

window.addEventListener('DOMContentLoaded', () => {
    //disable all mouse events. Simply preventing the default does not work for some reason
    //If you click on the microphone google.com it still triggers
    //If you do pointerevents none you will always select the complete html element
    //solve this by reseting it after recieving mouseevent and activating it after selection of element is done
    document.body.style.pointerEvents = "none";

    document.addEventListener("click", (event) => {
        document.body.style.pointerEvents = "";
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
        document.body.style.pointerEvents = "none";
        //console.log(inspectedElement);
        //alert(inspectedElement.outerHTML)
        let pathName = document.location.pathname;
        let pathFolder = pathName.substr(0, pathName.lastIndexOf("/"));
        let rootURL = document.location.protocol + "//" + document.location.host;

        otherView.webContents.send("messagefromcomic", inspectedElement.outerHTML, window.getComputedStyle(inspectedElement).cssText, rootURL + pathFolder + "/");
    });
});

ipcRenderer.on('messagefromselect', (event, message) => { document.body.innerHTML = message });
