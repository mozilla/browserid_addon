"use strict";

const {Session} = require("sessions/session");
const {Helpers} = require("../helpers");
const {CookieMonster} = require("sessions/cookie_monster");
const {Bindings} = require("sessions/bindings");
const tabs = require("tabs");
const timers = require("timers");
const unload = require("unload");

// The TabManager keeps track of which tabs are open and which tab is currently 
// active.  When a tab is opened, we create a Session model for it.  This 
// session model is updated whenever the untrusted content of that tab updates 
// it.  Whenever a tab is made active, associate the window's session with the 
// session from the active tab.
let TabManager = function() {
    // Watch for any cookies.  A change to cookies, if the session is bound to 
    // cookie information, invalidates the session.
    this._cookieManager = new CookieMonster();

    // Keep track of all of the bindings.  A binding is when a session is 
    // active as long as the value of a cookie remains constant.
    this.bindings = new Bindings({
      cookieManager: this._cookieManager
    });

    // Create the session model for each tab.
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

    // A tab's contents are ready, if session info has not been set by now, 
    // remove the session display box.
    tabReady: function(tab, data) {
      if(this._resetSession) {
          tab.session.noInfo();
      }
    },

    // The session model for a particular tab has been updated.  Update that 
    // tab's model, stop the session reset from happening.
    sessionUpdate: function(tab, data) {
       tab.sessions = data.sessions;
       this._resetSession = false;
    },

    // sessionReset happens whenever a new tab is opened or when a current tab 
    // has its URL updated.
    sessionReset: function(tab, data) {
       tab.session.host = data.host;
       this._resetSession = true;
    }
};

// Create the Session model for a tab.
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
    // update the window's session model with the active tab's session model.  
    // This will force the displays to update appropriately.
    tab.window.session = tab.session;
}

exports.TabManager = TabManager;
