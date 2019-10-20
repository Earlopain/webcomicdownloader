// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let otherView = remote.getGlobal("comicView");
let i;
window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener("click", (event) => {
        event.preventDefault();
        otherView.webContents.send("messagefromselect", i++);
    });

});

ipcRenderer.on('messagefromcomic', (event, message) => { document.body.innerHTML = message });
