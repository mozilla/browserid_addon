"use strict";

const {Session} = require("session");
const tabs = require("tabs");


let TabManager = function() {
    for each(let tab in tabs) {
        createTabSession.call(this, tab);
    }
    tabs.on("open", createTabSession);
};
TabManager.prototype = {
    constructor: TabManager
};

function createTabSession(tab) {
    if(!tab.session) {
        tab.session = Session();
    }
};

exports.TabManager = TabManager;

