"use strict";

const {WindowTracker} = require("window-utils");
const windows = require("windows").browserWindows;
const {Helpers} = require("./helpers");
const self = require("self");
const {Session} = require("session");
const {SessionDisplay} = require("session_display");
const {WindowSession} = require("window_session");

// Before you mess this up again, use the low level windowTracker so that
// you can get the document.  You need the document to create the CSS and 
// to attach the sessionDisplay.


let WindowManager = function() {
    let delegate = {
        onTrack: onTrack.bind(this),
        onUntrack: onUntrack.bind(this)
    };

    let tracker = new WindowTracker(delegate);

    windows.on("open", onWindowOpen.bind(this));
    for each(let win in windows) {
        onWindowOpen.call(this, win);
    }
};

function onTrack(window) {
     console.log("onWindowTrack");
     let doc = window.document;
     try {
         let uri = self.data.url("styles/identity-session.css");
         Helpers.chrome.loadStylesheet(uri, doc);
     } catch(e) {
          // do nothing
       console.log('catching error');
     }

     let session = new Session();
     let windowSession = new WindowSession({
         session: session
     });
     let sessionDisplay = new SessionDisplay({
         document: doc,
         session: session
     });

     // Save this off to use in onWindowOpen since the window
     // here is a low level window and everywhere else we
     // get a BrowserWindow.  in onWindowOpen, we get a
     // BrowserWindow to attach our session to.
     this.windowSession = windowSession;
}

function onUntrack(window) {
}

function onWindowOpen(browserWindow) {
    browserWindow.session = this.windowSession;
}


exports.WindowManager = WindowManager;


