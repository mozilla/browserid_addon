"use strict";

const {EventEmitter} = require("events");
const {WindowTracker} = require("window-utils");
const windows = require("windows").browserWindows;
const {Helpers} = require("../helpers");
const self = require("self");
const {Session} = require("sessions/session");
const {SessionDisplay} = require("sessions/session_display");
const {SessionPanel} = require("sessions/session_panel");
const {WindowSession} = require("sessions/window_session");
const unload = require("unload");

let WindowManager = EventEmitter.compose({
    constructor: function() {
        let delegate = {
            onTrack: onTrack.bind(this),
            onUntrack: onUntrack.bind(this)
        };

        let tracker = this._tracker = new WindowTracker(delegate);
        // Note: I believe this scheme is incorrect if multiple windows
        // open on initial load.  This is because the WindowTracker will
        // call onTrack on all of its windows before any calls to onWindowOpen
        // Perhaps a better way would be to store the windowSessions on an
        // array, and when windows.open is triggered, it will use some way
        // to find its index into the array and get the windowSession that
        // it needs
        this._windowOpen = onWindowOpen.bind(this);
        windows.on("open", this._windowOpen);
        for each(let win in windows) {
            onWindowOpen.call(this, win);
        }
        
        unload.ensure(this, "teardown");
    },

    teardown: function() {
        if(!this._tracker) return;
        this._tracker.unload();
        this._tracker = null;
    }
});

function onTrack(window) {
     if(this.unloaded) return;

     let doc = window.document;
     try {
         let uri = self.data.url("sessions/styles/identity-session.css");
         Helpers.chrome.loadStylesheet(uri, doc);
     } catch(e) {
         // do nothing
     }

     let session = new Session();
     let windowSession = new WindowSession({
         session: session
     });
     let sessionDisplay = new SessionDisplay({
         document: doc,
         session: session
     });
     let sessionPanel = new SessionPanel({
         document: doc,
         session: session
     });

     sessionDisplay.on("login", onLogin.bind(this, window));
     sessionDisplay.on("userinfo", sessionPanel.show.bind(sessionPanel));
     sessionPanel.on("sessionlogout", onLogout.bind(this, window));

     // Save this off to use in onWindowOpen since the window
     // here is a low level window and everywhere else we
     // get a BrowserWindow.  in onWindowOpen, we get a
     // BrowserWindow to attach our session to.
     this.windowSession = windowSession;
}

function onUntrack(window) {
}

function onWindowOpen(browserWindow) {
    if(this.unloaded) return;

    let windowSession = this.windowSession;

    browserWindow.__defineGetter__('session', function() {
        return windowSession.session;
    });
    browserWindow.__defineSetter__('session', function(session) {
        windowSession.session = session; 
    });
}

function onLogin(window) {
    this._emit("login", window);
};

function onLogout(window) {
    this._emit("logout", window);
};

exports.WindowManager = WindowManager;


