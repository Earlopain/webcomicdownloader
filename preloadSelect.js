// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let sendToView = remote.getGlobal("sendToView");
let i;
window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener("click", (event) => {
        event.preventDefault();
        sendToView("comic", "messagefromselect", i++);
    });

});

ipcRenderer.on('messagefromcomic', (event, outerHTML, computedStyle, baseURL, cssSelector) => {
    document.getElementById("cssselector").innerHTML = cssSelector;
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

    template.content.firstChild.id = "copiedelement";
    template.content.firstChild.style.cssText = computedStyle;

    copied = document.getElementById("copiedelementcontainer");
    copied.innerHTML = template.content.firstChild.outerHTML;
});
