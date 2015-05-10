// LICENSE : MIT
"use strict";
var app = require('app');
var BrowserWindow = require('browser-window');
var Command = require("command-promise");
var ipc = require('ipc');
var mainWindow = null;
if (process.argv[2] == null) {
    console.error("arg[2] is undefined");
    app.quit();
}
var userDict = {
    date: (new Date()).toISOString(),
    en: process.argv[2],
    imageFilePath: ""
};

function saveUserDict(dict) {
    require("assert")(dict.date && dict.en && dict.ja);
    var fs = require("fs");
    var obj = require('./dict.json');
    obj.push(dict);
    fs.writeFileSync('dict.json', JSON.stringify(obj, null, 4));
}
function launchApp() {
    mainWindow = new BrowserWindow({width: 400, height: 400});
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send("form-label", "En: " + userDict.en);
    });
    ipc.on('synchronous-message', function (event, arg) {
        if (arg.length === 0) {
            return;
        }
        console.log(arg);
        userDict.ja = arg;
        saveUserDict(userDict);
        mainWindow.close();
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });
}
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    var path = require("path");
    var utc = (new Date()).toISOString();
    var imageFilePath = path.join(process.cwd(), utc + ".png");
    userDict.imageFilePath = imageFilePath;
    Command('screencapture -l $(./GetForegroundWindowID) ' + imageFilePath)
        .then(launchApp, console.error);
});
