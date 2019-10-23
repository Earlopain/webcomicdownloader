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
    setBase(baseURL);
    resetCopiedElements();

    for(let i = 0; i < outerHTMLArray.length; i++){
        const outerHTML = outerHTMLArray[i];
        const computedStyle = computedStyleArray[i];
        const cssSelector = cssSelectorArray[i];
        const element = createElement(outerHTML, computedStyle);
        const button = document.createElement("button");
        button.classList.add("padding");
        button.onclick =  () => {
            sendToView("comic", "selectchild", i);
            setBase(baseURL);
            resetCopiedElements();
            addCopiedElement(element, cssSelector, baseURL);
        };
        button.innerHTML = "Set as current element";
        addCopiedElement(element, cssSelector, baseURL, button);
    }
});

ipcRenderer.on("showsingleelement", (event, outerHTML, computedStyle, cssSelector, baseURL) => {
    setBase(baseURL);
    resetCopiedElements();
    const element = createElement(outerHTML, computedStyle);
    
    addCopiedElement(element, cssSelector, baseURL);
});

function resetCopiedElements() {
    document.getElementById("copiedelementcontainer").innerHTML = "";
}

function addCopiedElement(element, cssSelector, baseURL, button){
    let divContainer = document.createElement("div");
    let copiedElement = document.createElement("div");
    copiedElement.class = "elementcontainer float";
    copiedElement.appendChild(element);
    divContainer.appendChild(copiedElement);
    let cssSelectorDiv = document.createElement("div");
    cssSelectorDiv.innerHTML = cssSelector;
    divContainer.appendChild(cssSelectorDiv);

    let devtools = document.createElement("p");
    devtools.style.wordWrap = "break-word";

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
    divContainer.appendChild(devtools);
    if(button !== undefined){
        divContainer.appendChild(button);
    }
    document.getElementById("copiedelementcontainer").appendChild(divContainer);
}

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
    template.content.firstChild.classList.add("copiedelement");
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
