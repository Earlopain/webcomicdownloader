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

ipcRenderer.on('messagefromcomic', (event, outerHTML, computedStyle, baseURL) => {

    //delete previous base
    let prevBase = document.head.querySelector("base");
    if(prevBase !== null){
        prevBase.remove();
    }

    //insert base to ensure links from original work
    let base = document.createElement("base");
    base.href = baseURL;
    base.target = "_blank";

    document.head.append(base);

    let template = document.createElement('template');
    outerHTML = outerHTML.trim();
    template.innerHTML = outerHTML;
    template.content.firstChild.style.cssText = computedStyle;

    document.body = document.createElement("body");
    document.body.appendChild(template.content.firstChild)
});
