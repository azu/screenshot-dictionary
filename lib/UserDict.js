// LICENSE : MIT
"use strict";
let path = require("path");
let mkdirp = require('mkdirp');
class UserDict {
    constructor(userDir) {
        this.date = new Date();
        this.userDir = userDir || __dirname;
        this.dictFilePath = path.join(this.userDir, "dict.json");
        this.imageFilePath = path.join(this.userDir, this.date.toISOString() + ".png");
        this.input = "";
        this.output = "";

        mkdirp.sync(this.userDir);
    }

    toJSON() {
        return {
            date: this.date.toISOString(),
            imageFilePath: this.imageFilePath,
            input: this.input,
            output: this.output
        };
    }
}
export default UserDict;