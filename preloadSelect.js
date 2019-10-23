// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require('electron');
let sendToView = remote.getGlobal("sendToView");
let i;
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("getparentbutton").onclick = () => {
        sendToView('comic', 'getparent');
    }
    document.getElementById("getchildrenbutton").onclick = () => {
        sendToView('comic', 'getchildren');
    }
});

ipcRenderer.on("showchildren", (event, outerHTMLArray, computedStyleArray, cssSelectorArray, baseURL) => {
    alert(outerHTMLArray.length);
});

ipcRenderer.on("showsingleelement", (event, outerHTML, computedStyle, cssSelector, baseURL) => {
    document.getElementById("cssselector").innerHTML = cssSelector;
    setBase(baseURL);

    let element = createElement(outerHTML, computedStyle);
    
    let devtools = document.getElementById("devtools");
    devtools.innerHTML = "";

    const ignoreAttributes = ["style", "id", ";", "border"];
    const definitelyURLS = ["src", "href"];

    for (const attr of element.attributes) {
        if (ignoreAttributes.includes(attr.name)) {
            continue;
        }
        if (definitelyURLS.includes(attr.name)) {
            attr.value = fixURL(attr.value, baseURL);
        }
        let text = document.createTextNode(innerHTML = attr.name + ":" + attr.value);
        devtools.appendChild(text);
        devtools.appendChild(document.createElement("br"));
    }

    copied = document.getElementById("copiedelementcontainer");
    copied.innerHTML = element.outerHTML;
});

function setBase(baseURL) {
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
}

function createElement(outerHTML, computedStyle) {
    let template = document.createElement('template');
    template.innerHTML = outerHTML;

    template.content.firstChild.id = "copiedelement";
    template.content.firstChild.style.cssText = computedStyle;
    return template.content.firstChild;
}

function insertElement() {

}

function fixURL(url, baseURL) {
    if (url.startsWith("http")) {
        return url;
    }
    return baseURL + url;
}
