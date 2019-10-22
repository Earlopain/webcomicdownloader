// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let otherView = remote.getGlobal("selectorView");

let ignoreMouseInput = remote.getGlobal("ignoreMouseInput");

ipcRenderer.on("togglemousecapture", () => {
    ignoreMouseInput = !ignoreMouseInput;
    if (ignoreMouseInput) {
        document.body.style.pointerEvents = "none";
    }
    else {
        document.body.style.pointerEvents = "";
    }
    console.log(ignoreMouseInput);
});

window.addEventListener('DOMContentLoaded', () => {
    //disable all mouse events. Simply preventing the default does not work for some reason
    //If you click on the microphone google.com it still triggers
    //If you do pointerevents none you will always select the complete html element
    //solve this by reseting it after recieving mouseevent and activating it after selection of element is done
    if (ignoreMouseInput) {
        document.body.style.pointerEvents = "none";
    }

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
        if (ignoreMouseInput) {
            document.body.style.pointerEvents = "none";
            let pathName = document.location.pathname;
            let pathFolder = pathName.substr(0, pathName.lastIndexOf("/"));
            let rootURL = document.location.protocol + "//" + document.location.host;

            otherView.webContents.send("messagefromcomic", inspectedElement.outerHTML, window.getComputedStyle(inspectedElement).cssText, rootURL + pathFolder + "/", cssSelector(inspectedElement));
        }
    });
});

//https://stackoverflow.com/a/12222317/7873303
function cssSelector(element) {
    if (!(element instanceof Element))
        return;
    let path = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += '#' + element.id;
            path.unshift(selector);
            break;
        } else {
            let sib = element;
            let nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector) {
                    nth++;
                }
            }
            if (nth != 1) {
                selector += ":nth-of-type(" + nth + ")";
            }
        }
        path.unshift(selector);
        element = element.parentNode;
    }
    return path.join(" > ");
}

ipcRenderer.on('messagefromselect', (event, message) => { alert("Message from preloadSelect.js") });
