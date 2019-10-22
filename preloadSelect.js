// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let sendToView = remote.getGlobal("sendToView");
let i;
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("getparentbutton").onclick = () => {
        sendToView('comic', 'getparent');
    }

});

ipcRenderer.on('messagefromcomic', (event, outerHTML, computedStyle, baseURL, cssSelector) => {
    document.getElementById("cssselector").innerHTML = cssSelector;
    //delete previous base
    let prevBase = document.head.querySelector("base");
    if (prevBase !== null) {
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
    let devtools = document.getElementById("devtools");
    devtools.innerHTML = "";


    const ignoreAttributes = ["style", "id", ";", "border"];
    const definitelyURLS = ["src", "href"];

    for (const attr of template.content.firstChild.attributes) {
        if(ignoreAttributes.includes(attr.name)){
            continue;
        }
        if(definitelyURLS.includes(attr.name)){
            debugger;
            attr.value = fixURL(attr.value, baseURL);
        }
        let text = document.createTextNode(innerHTML = attr.name + ":" + attr.value);
        devtools.appendChild(text);
        devtools.appendChild(document.createElement("br"));
    }

    copied = document.getElementById("copiedelementcontainer");
    copied.innerHTML = template.content.firstChild.outerHTML;
});

function fixURL(url, baseURL){
    if(url.startsWith("http")){
        return url;
    }
    return baseURL + url;
}
