"use strict";

const {Session} = require("session");
const {Helpers} = require("helpers");
const tabs = require("tabs");
const timers = require("timers");

let TabManager = function() {
    for each(let tab in tabs) {
        createTabSession.call(this, tab);
    }
    tabs.on("open", createTabSession);
    tabs.on("activate", setActiveTab);
    tabs.on("ready", onTabReady.bind(this));
};
TabManager.prototype = {
    constructor: TabManager,
    sessionsUpdate: function(tab, data) {
       let session = tab.session;
       session.sessions = data.sessions;
        this._resetSession = false;
    },
    sessionReset: function(tab) {
        // console.log("session reset");
        this._resetSession = true;
    }
};

function createTabSession(tab) {
    if(!tab.session) {
        tab.session = new Session();
        setActiveTab(tab);
    }
}

function setActiveTab(tab) {
  //console.log("new tab made active");
    let windowSessions = tab.window.session;
    if (windowSessions) {
        windowSessions.session = tab.session;
    }
}

function onTabReady(tab){
  if(this._resetSession) {
    //  console.log("resetting sessions");
      tab.session.noInfo();
  }
}

exports.TabManager = TabManager;
