"use strict";

const {Session} = require("session");
const {Helpers} = require("helpers");
const tabs = require("tabs");


let TabManager = function() {
    for each(let tab in tabs) {
        createTabSession.call(this, tab);
    }
    tabs.on("open", createTabSession);
    tabs.on("activate", setActiveTab);
    tabs.on("ready", onTabReady);
};
TabManager.prototype = {
    constructor: TabManager,
    sessionsUpdate: function(tab, data) {
      console.log("updating sessions: " + data.sessions.length);
       let session = tab.session;
       session.sessions = data.sessions;
    }
};

function createTabSession(tab) {
    if(!tab.session) {
        tab.session = Session();
    }
}

function setActiveTab(tab) {
  console.log("new tab made active");
    let windowSessions = tab.window.session;
//    Helpers.toConsole(tab.session);
  //  console.log("session length: " + tab.session.sessions.length);
    windowSessions.session = tab.session;
}

function onTabReady(){}

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
