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
       tab.sessions = data.sessions;
       this._resetSession = false;
    },
    sessionReset: function(tab) {
     //   console.log("session reset");
        this._resetSession = true;
    }
};

function createTabSession(tab) {
    if(!tab.session) {
        let model = Session();
        tab.__defineGetter__('session', function() { return model; });
        tab.__defineGetter__('sessions', function() { return model.sessions; });
        tab.__defineSetter__('sessions', function(sessions) { model.sessions = sessions; });
        setActiveTab(tab);
    }
}

function setActiveTab(tab) {
    //console.log("new tab made active");
    tab.window.session = tab.session;
}

function onTabReady(tab){
  if(this._resetSession) {
      //console.log("resetting sessions");
      tab.sessions = undefined;
  }
}

exports.TabManager = TabManager;
/*
    let host = data.host;
        var username = "";
        sessions.forEach(function(session) {
            var boundTo = session.bound_to;
            if(boundTo && boundTo.type === "cookie") {
                console.log("bound to a cookie: " + boundTo.name);
                tab.cookie = boundTo.name;
                cookieMonster.watch(host, boundTo.name, function() {
                    //console.log("cookie changed, we should do something");
                });
            }
        });
*/
