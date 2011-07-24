"use strict";

const {Session} = require("session");
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
       let session = tab.session;
       let sessions = data.sessions;

       let status = "none";

       if(sessions) {
           if(sessions.length === 0) {
               status = "login";
           }
           else {
               status = "loggedin";
           }
       }

       session.status = status;
       return status;
    }
};

function createTabSession(tab) {
    if(!tab.session) {
        tab.session = Session();
    }
}

function setActiveTab(tab) {
    
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
