// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote, ipcRenderer } = require("electron");
let sendToView = remote.getGlobal("sendToView");
let getView = remote.getGlobal("getView")
let statusMessages = ["Please navigate to the page with the first page and hit select",
    "Please naviagte to the page with the most recent page and hit select<br>Examples for valid urls: <br>https://www.xkcd.com/<br>http://www.minnasundberg.fi/comic/recent.php<br>Invalid urls:<br>https://www.xkcd.com/2220/<br>http://www.minnasundberg.fi/comic/page556.php",
    "Please click on the element which redirects you to the previous page",
    "Please click on the element which redirects you to the next page",
    "Please click on the element which contains the image"];
let comicResult = {};
let currentStatus = 0;
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {setStatus(0)}, 500)
    document.getElementById("getparentbutton").onclick = () => {
        sendToView("comic", "getparent");
    }
    document.getElementById("getchildrenbutton").onclick = () => {
        sendToView("comic", "getchildren");
    }
    document.getElementById("selectelement").onclick = () => {
        let selector = document.querySelector("#copiedelementcontainer > div > div:nth-child(2)");
        switch (currentStatus) {
            case 0:
                comicResult.firstPage = getView("comic").webContents.getURL();
                break;
            case 1:
                comicResult.lastPage = getView("comic").webContents.getURL();
                break;
            case 2:
                comicResult.prevPage = decodeEntities(selector.innerHTML);
                break;
            case 3:
                comicResult.nextPage = decodeEntities(selector.innerHTML);
                break;
            case 4:
                comicResult.image = decodeEntities(selector.innerHTML);
                break;

            default:
                console.log(comicResult);
                break;
        }
        currentStatus++;
        setStatus(currentStatus);
    }
});

function setStatus(id) {
    if(statusMessages[id] === undefined)
        return;
    if(id < 2){
        sendToView("comic", "mousecaptureoff");
    }
    else {
        sendToView("comic", "mousecaptureon");
    }
    alert(statusMessages[id].replace(/<br>/g, "\n"));
    document.getElementById("statusmessage").innerHTML = statusMessages[id];
}

ipcRenderer.on("showchildren", (event, outerHTMLArray, computedStyleArray, cssSelectorArray, baseURL, url) => {
    currentComicUrl = url;
    setBase(baseURL);
    resetCopiedElements();

    for (let i = 0; i < outerHTMLArray.length; i++) {
        const outerHTML = outerHTMLArray[i];
        const computedStyle = computedStyleArray[i];
        const cssSelector = cssSelectorArray[i];
        const element = createElement(outerHTML, computedStyle);
        const button = document.createElement("button");
        button.classList.add("padding");
        button.onclick = () => {
            sendToView("comic", "selectchild", i);
            setBase(baseURL);
            resetCopiedElements();
            addCopiedElement(element, cssSelector, baseURL);
        };
        button.innerHTML = "Set as current element";
        addCopiedElement(element, cssSelector, baseURL, button);
    }
});

ipcRenderer.on("showsingleelement", (event, outerHTML, computedStyle, cssSelector, baseURL, url) => {
    currentComicUrl = url;
    setBase(baseURL);
    resetCopiedElements();
    const element = createElement(outerHTML, computedStyle);

    addCopiedElement(element, cssSelector, baseURL);
});

function resetCopiedElements() {
    document.getElementById("copiedelementcontainer").innerHTML = "";
}

function addCopiedElement(element, cssSelector, baseURL, button) {
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
    const definitelyURLS = ["src", "srcset", "href"];

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
    if (button !== undefined) {
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
    let template = document.createElement("template");
    template.innerHTML = outerHTML;
    template.content.firstChild.style.cssText = computedStyle;
    return template.content.firstChild;
}

function insertElement() {

}

function fixURL(url, baseURL) {
    if (url.startsWith("http")) {
        return url;
    }
    if (url.startsWith("//")) {
        return baseURL.split("://")[0] + ":" + url;
    }
    return baseURL + url;
}

let decodeEntities = (function () {
    // this prevents any overhead from creating the object each time
    let element = document.createElement('div');

    function decodeHTMLEntities(str) {
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    return decodeHTMLEntities;
})();
