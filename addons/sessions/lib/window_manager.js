"use strict";

const {WindowTracker} = require("window-utils");
const {Helpers} = require("./helpers");
const self = require("self");
const {Session} = require("session");
const {SessionDisplay} = require("session_display");

// Before you mess this up again, use the low level windowTracker so that
// you can get the document.  You need the document to create the CSS and 
// to attach the sessionDisplay.

let delegate = {
    onTrack: function(window) {
         let doc = window.document;
         let uri = self.data.url("styles/identity-session.css");
         Helpers.chrome.loadStylesheet(uri, doc);


/*         let windowSession = new Session();
         let sessionDisplay = new SessionDisplay({
            document: doc,
            session: windowSession
         });

         window.session = windowSession;
         console.log("ontrack");
  */  },

    onUntrack: function(window) {
    }

};


let WindowManager = function() {
    let tracker = new WindowTracker(delegate);
};

WindowManager.prototype = {

};




exports.WindowManager = WindowManager;


