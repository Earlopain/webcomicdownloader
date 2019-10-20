// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;

function createWindow() {
    // Create the browser window.
    browserWindow = new BrowserWindow({
        webPreferences: {
            preload: __dirname + '/preload.js',
        }
    });
    let debug = browserWindow.webContents.debugger;
    let selectedNodeID;
    debug.attach();

    browserWindow.loadURL('https://google.com');

    ipcMain.on("inspectelement", async (event, pageX, pageY) => {
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
        let js$0True = (await debug.sendCommand("Runtime.evaluate", { expression: "selectedElement = $0", includeCommandLineAPI: true }));
        event.reply("domelementselected");
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
app.on('ready', createWindow);

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