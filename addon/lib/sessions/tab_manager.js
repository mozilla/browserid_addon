"use strict";

const {Session} = require("sessions/session");
const {Helpers} = require("../helpers");
const {CookieMonster} = require("sessions/cookie_monster");
const {Bindings} = require("sessions/bindings");
const tabs = require("tabs");
const unload = require("unload");

/** 
 * The TabManager keeps track of all tabs and all sessions for all tabs.
 * A single TabManager keeps track of all tabs that are opened across all 
 * windows. It creates a session for every tab and does the management of those 
 * sessions. When a new tab becomes active, the TabManager informs that tab's 
 * window that it needs to display the newly active tab's sessions.
 */
let TabManager = function() {
    this._cookieManager = new CookieMonster();
    this.bindings = new Bindings({
      cookieManager: this._cookieManager
    });

    /**
     * For every tab that is already open, create a session
     */
    for each(let tab in tabs) {
        createTabSession.call(this, tab);
    }

    /**
     * Wait for new tabs too.
     */
    tabs.on("open", createTabSession.bind(this));

    /**
     * Whenever a new tab is activated, tell that tab's window that it needs to 
     * show the sessions for the newly active tab.
     */
    tabs.on("activate", setActiveTab.bind(this));
    unload.ensure(this, "teardown");
};
TabManager.prototype = {
    constructor: TabManager,
    teardown: function() {
      this._cookieManager.teardown();
      this._cookieManager = null;
    },

    /**
     * If a tab becomes ready and navigator.id.sessions has not been set, 
     * remove the session info from the tab.
     * @method tabReady
     */
    tabReady: function(tab, data) {
      if(this._resetSession) {
          tab.session.noInfo();
      }
    },

    /**
     * Update the session info for a tab.  This is called whenever 
     * navigator.id.sessions is set.
     * @method sessionUpdate
     * @param {Tab} tab - tab whose session is being updated.
     * @param {object} data - navigator.id.sessions for the tab.
     */
    sessionUpdate: function(tab, data) {
       tab.sessions = data.sessions;
       this._resetSession = false;
    },

    /**
     * This is called whenever a tab's page is reloaded.  We set the new host 
     * being loaded and wait for the window's load event.  When the window's 
     * load event occurs, tabReady will be called.  
     * @method sessionReset
     * @param {Tab} tab - the tab whose page is being updated.
     * @param {object} data - object containing the new host name.
     */
    sessionReset: function(tab, data) {
       tab.session.host = data.host;
       this._resetSession = true;
    }
};

function createTabSession(tab) {
    if(!tab.session) {
        /**
         * Creates a new Session.  We are passing the bindings collection so 
         * that if this Session model does get some bindings at some point, it 
         * can store those bindings off to be used across tabs/windows.
         */
        let model = new Session({
          bindings: this.bindings, 
          host: tab.url
        });

        /** 
         * Define some getters and setters on the tab so that we have 
         * a shortcut to tab.session and tab.sessions.  This keeps us from 
         * having to do tab.session.sessions every time we want access to the 
         * tab's sessions.
         */
        tab.__defineGetter__('session', function() { return model; });
        tab.__defineGetter__('sessions', function() { return model.sessions; });
        tab.__defineSetter__('sessions', function(sessions) { model.sessions = sessions; });
        setActiveTab.call(this, tab);
    }
}

function setActiveTab(tab) {
    this.activeTab = tab;

    /**
     * When a new tab becomes active, we have to notify that tab's window to 
     * start watching a new set of sessions.  window.session is actually 
     * a setter that tells the window's session model to start watching changes 
     * on the tab's session model.
     */
    tab.window.session = tab.session;
    tab.window.activeTab = tab;
}
exports.TabManager = TabManager;
