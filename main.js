const electron = require('electron');
const url = require('url');
const path = require('path');

// ipcMain => to catch the ipcRenderer's sent value in main.js
const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set ENV to production
process.env.NODE_ENV = 'production';

// Will list all the items
let mainWindow;

// Listen for the app to be ready
// Run following things when app is ready
app.on('ready', function(){
    
    // Create new browser Window, 
    // Without any configurations like length or height of window
    mainWindow = new BrowserWindow({});

    /* 
     * Load html file into browser window
     * Pass this path file://dirname/mainWindow.html into loadURL
     * __dirname is the current directory
     */
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app and all app's other windows when main window is closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build menu from electron's template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert the menu on application's top bar
    Menu.setApplicationMenu(mainMenu);

});


// Creates a new window when user clicks on 'Add Item'
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 180,
        title: 'Add Shopping List Item'
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Catch item:add (Catch ipcRenderer's sent value from addWindow.html)
ipcMain.on('item:add', function(event, item){
    // console.log("Item is : ", item);
    // Send item value to mainWindow, to display it in the shopping list
    mainWindow.webContents.send('item:add', item);
    // Close the "New Item" window once this new item has been added to the list
    addWindow.close();
});


/* Create menu template
 * Menu in electron is just an array of objects
*/
const mainMenuTemplate = [
    // file object
    {
        label: 'File',
        // submenu will also be array of object
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+Delete' : 'Ctrl+Shift+Delete',
                click(){
                    mainWindow.webContents.send('item:clear');
                }  
            },
            {
                label: 'Quit',
                // Shortcut key, darwin is for mac
                accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
                // Quit the app when clicked on 'Quit' label
                click(){
                    app.quit();
                }
            }
        ]
    }

];

// If Mac, add empty object to the menu array, at 0th index 
if(process.platform == 'darwin'){
    /* this will add an empty label object to the beginning
       of the menu array
     * Then we'll have other labels like 'File' in sequence
     * unshift is similar to adding something at the beginning 
       of an array
    */
    mainMenuTemplate.unshift({});
}

// Add dev tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Devtools',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+I' : 'Ctrl+Shift+I',
                // We need item, focusedWindow coz
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                // Adds Reload option in the submenu
                // To reload the app
                role: 'reload'
            }
        ]
    })
}

