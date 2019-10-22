// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, Menu } = require('electron');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;
let browserViews

global.ignoreMouseInput = true;

function createWindow() {
    // Create the browser window.
    browserWindow = new BrowserWindow();
    browserViews  = {
        "comic": new BrowserView({
            webPreferences: {
                preload: __dirname + '/preloadComic.js',
            }
        }),
        "select": new BrowserView({
            webPreferences: {
                preload: __dirname + '/preloadSelect.js',
            }
        })
    }
    let comicView = getView("comic");
    let selectorView = getView("select");
    let template = require(__dirname + "/menu.js");
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    let debug = comicView.webContents.debugger;
    let selectedNodeID;
    debug.attach();

    browserWindow.addBrowserView(comicView);
    browserWindow.addBrowserView(selectorView);

    comicView.webContents.loadURL("http://www.minnasundberg.fi/comic/page01.php");
    selectorView.webContents.loadFile(__dirname + "/index.html");


    myEmitter.on("inspectelement", async (pageX, pageY) => {
        //required for subsequent calls. Not sure if it is needed for every call but maybe 
        //it does not update automaticly so it stays here
        let doc = (await debug.sendCommand("DOM.getDocument"));
        //backend id of the node at mouse position
        let backendNodeId = (await debug.sendCommand("DOM.getNodeForLocation", { x: pageX, y: pageY })).backendNodeId;
        //needed to push the backend node to the fron
        let front = (await debug.sendCommand("DOM.pushNodesByBackendIdsToFrontend", { backendNodeIds: [backendNodeId] }));
        selectedNodeID = front.nodeIds[0];
        //it seems like the devtools context and this one do not share $0.
        //Because of this you need to call setInspectedNode, after which it will be set and accessible
        let inspect = (await debug.sendCommand("DOM.setInspectedNode", { nodeId: selectedNodeID }));
        //write $0 to another var accessable from a normal js context
        let js$0True = (await debug.sendCommand("Runtime.evaluate", { expression: "inspectedElement = $0", includeCommandLineAPI: true }));
        sendToView("comic", "domelementselected");
    });
    // Emitted when the window is closed.
    browserWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        browserWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();

    function setBrowserViewSize() {
        const size = browserWindow.getSize();
        console.log(size)
        const width = size[0];
        const height = size[1];
        const views = browserWindow.getBrowserViews();

        for (let i = 0; i < views.length; i++) {
            views[i].setBounds({ x: Math.floor(width / views.length * i), y: 0, width: Math.floor(width / views.length), height: height });
        }
    }
    setBrowserViewSize();
    browserWindow.on("resize", setBrowserViewSize);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (browserWindow === null) {
        createWindow();
    }
})

function getView(identifier){
    return browserViews[identifier];
}

function sendToView(identifier, channel, ... args){
    if(identifier === "main"){
        myEmitter.emit(channel, ... args);
    }
    else{
        const view = getView(identifier);
        if(view === undefined){
            throw new Error("Unknown view " + identifier);
        }
        view.webContents.send(channel, ...args);
    }
}

global.sendToView = sendToView;
global.getView = getView;
