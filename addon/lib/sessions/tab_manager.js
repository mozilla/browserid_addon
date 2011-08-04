"use strict";

const {Session} = require("sessions/session");
const {Helpers} = require("../helpers");
const {CookieMonster} = require("sessions/cookie_monster");
const {Bindings} = require("sessions/bindings");
const tabs = require("tabs");
const timers = require("timers");
const unload = require("unload");

let TabManager = function() {
    this._cookieManager = new CookieMonster();
    this.bindings = new Bindings({
      cookieManager: this._cookieManager
    });

    for each(let tab in tabs) {
        createTabSession.call(this, tab);
    }
    tabs.on("open", createTabSession.bind(this));
    tabs.on("activate", setActiveTab.bind(this));
    unload.ensure(this, "teardown");
};
TabManager.prototype = {
    constructor: TabManager,
    teardown: function() {
      this._cookieManager.teardown();
      this._cookieManager = null;
    },
    tabReady: function(tab, data) {
      if(this._resetSession) {
          tab.session.noInfo();
      }
    },
    sessionUpdate: function(tab, data) {
       tab.sessions = data.sessions;
       this._resetSession = false;
    },
    sessionReset: function(tab, data) {
       tab.session.host = data.host;
       this._resetSession = true;
    }
};

function createTabSession(tab) {
    if(!tab.session) {
        let model = new Session({
          bindings: this.bindings, 
          host: tab.url
        });

        tab.__defineGetter__('session', function() { return model; });
        tab.__defineGetter__('sessions', function() { return model.sessions; });
        tab.__defineSetter__('sessions', function(sessions) { model.sessions = sessions; });
        setActiveTab.call(this, tab);
    }
}

function setActiveTab(tab) {
    this.activeTab = tab;
    tab.window.session = tab.session;
    tab.window.activeTab = tab;
}

exports.TabManager = TabManager;
