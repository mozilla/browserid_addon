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
const stylesheetURI = self.data.url("sessions/styles/identity-session.css");

let WindowManager = EventEmitter.compose({
    constructor: function() {
        let delegate = {
            onTrack: onTrack.bind(this),
            onUntrack: onUntrack.bind(this)
        };

        let tracker = this._tracker = new WindowTracker(delegate);

        // TODO: This scheme is incorrect if multiple windows
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
        // When the window manager is torn down, we force an unload on all of 
        // the windows that are watched by the tracker, removing the 
        // stylesheets that we attached.
        this._tracker.unload();
        this._tracker = null;
    }
});

function onTrack(win) {
    if(this.unloaded) return;

    let doc = win.document;

    // For each window that is tracked, add a stylesheet.
    try {
        Helpers.chrome.loadStylesheet(stylesheetURI, doc);
    } catch(e) {
        // do nothing
    }

    // For every window that is open, we create the SessionWindow (the model of 
    // the session for the window), the SessionDisplay (the bit in the URL bar 
    // that displays the session info) and the SessionPanel (the doorhanger 
    // that opens to sign out)
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

    // relay the login message to those who take care of login.
    sessionDisplay.on("login", this._emit.bind(this, "login", win));

    // when a userinfo request comes in, show the session panel.
    sessionDisplay.on("userinfo", sessionPanel.show.bind(sessionPanel));

    // relay the logout message to those who take care of logout.
    sessionPanel.on("sessionlogout", this._emit.bind(this, "logout", win));

    // Save this off to use in onWindowOpen since the window
    // here is a low level window and everywhere else we
    // get a BrowserWindow.  in onWindowOpen, we get a
    // BrowserWindow to attach our session to.
    this.windowSession = windowSession;
}

function onUntrack(win) {
    // We've gotta remove this stuff.
    let doc = win.document;
    try {
        Helpers.chrome.removeStylesheet(stylesheetURI, doc);
    } catch(e) {
        // do nothing
    }
}

// onWindowOpen is a Jetpack BrowserWindow which is a wrapped window object.
// These wrapped objects do not give direct access to the native DOM window 
// object (booo), but because these wrapped objects are used through all 
// of the Jetpack code, we have to somehow associate the session information
// we created above in the window tracker (which uses native window objects)
// to the wrapped Jetpack object.  This is a big pain.
function onWindowOpen(win) {
    if(this.unloaded) return;

    Helpers.toConsole(win.browserWindow);

    let windowSession = this.windowSession;

    // The getter and setter are used anywhere a BrowserWindow is 
    // passed from Jetpack code.
    win.__defineGetter__('session', function() {
        return windowSession.session;
    });
    win.__defineSetter__('session', function(session) {
        windowSession.session = session; 
    });
}

exports.WindowManager = WindowManager;


