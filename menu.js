const prompt = require("electron-prompt");

const template = [
    {
        label: "ComicView",
        submenu: [
            {
                label: "Load New URL",
                async click() {
                    const result = await prompt({
                        title: "URL to load", label: "URL with http(s)://:", value: "https://",
                    });
                    if (result !== null) {
                        if (!result.startsWith("http")) {
                            result = "https://" + result;
                        }
                        getView("comic").webContents.loadURL(result);
                    }
                }
            },
            {
                label: "Toggle Mouse Capture",
                async click() {
                    global.ignoreMouseInput = !global.ignoreMouseInput;
                    sendToView("comic", "togglemousecapture");
                }
            }
        ]
    },
    {
        label: "Debug",
        submenu: [
            {
                label: "Left devtools",
                async click() {
                    getView("comic").webContents.openDevTools();
                }
            },
            {
                label: "Right devtools",
                async click() {
                    getView("select").webContents.openDevTools();
                }
            }
        ]
    }
]

module.exports = template;
