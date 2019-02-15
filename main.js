const electron = require('electron');
const url = require('url');
const path = require('path');
const parser = require('./parser')

const { app, BrowserWindow, Menu, ipcMain } = electron;


// Set environment process
process.env.NODE_ENV = 'test';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function () {

    let text = parser.parseSteps();
    console.log(text);
    mainWindow = new BrowserWindow({});

    // file://dirname/mainWIndow.html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //Quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
})

//Handle create add window
function createAddWindow() {

    addWindow = new BrowserWindow({
        height: 200,
        width: 300,
        title: 'Add Shopping List Item'
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //Garbage collection handle
    addWindow.on('close', function () {
        addWindow = null;
    })

}

// Catch item:add

ipcMain.on("item:add", function (e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add step',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear steps',
                click() {
                    mainWindow.webContents.send('item:clear');
                }

            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not on prod
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}