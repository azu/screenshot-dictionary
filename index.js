// LICENSE : MIT
"use strict";
require("babel/register")();
var app = require('app');
var BrowserWindow = require('browser-window');
var Command = require("command-promise");
var ipc = require('ipc');
var UserDict = require("./lib/UserDict");

const userDir = __dirname + "/user-data/";
var userDict = new UserDict(userDir);
userDict.input = process.argv[2];

function saveUserDict(userDict) {
    var fs = require("fs");
    var dictList = [];
    try {
        dictList = require(userDict.dictFilePath);
    } catch (e) {
    }
    dictList.push(userDict);
    fs.writeFileSync(userDict.dictFilePath, JSON.stringify(dictList, null, 4));
}
function launchRegisterView() {
    var mainWindow = new BrowserWindow({width: 400, height: 400});
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send("form-label", "En: " + userDict.input);
    });
    var isFinishInput = false;
    ipc.on('finish-input', function (event, arg) {
        if (arg.length === 0) {
            return;
        }
        console.log(arg);
        userDict.output = arg;
        saveUserDict(userDict);
        isFinishInput = true;
        mainWindow.close();
    });
    mainWindow.on('closed', function () {
        if (!isFinishInput) {
            var fs = require("fs-extra");
            fs.removeSync(userDict.imageFilePath);
        }
        mainWindow = null;
        app.quit();
    });
}
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

var launchViewer = function () {
    var mainWindow = new BrowserWindow({width: 400, height: 400});
    mainWindow.loadUrl('file://' + __dirname + '/viewer.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });
};
app.on('ready', function () {
    if (process.argv[2] == null) {
        launchViewer();
    } else {
        Command('screencapture -l $(./GetForegroundWindowID) ' + userDict.imageFilePath)
            .then(launchRegisterView, console.error);
    }
});
