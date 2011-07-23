const {WindowTracker} = require("window-utils");
const {Helpers} = require("./helpers");
const self = require("self");
const {Session} = require("session");
const {SessionDisplay} = require("session_display");

let delegate = {
    onTrack: function(window) {
         let doc = window.document;
/*         let uri = self.data.url("styles/identity-session.css");
         Helpers.chrome.loadStylesheet(uri, doc);
*/

         let windowSession = new Session();
         let sessionDisplay = new SessionDisplay({
            document: doc,
            session: windowSession
         });

         window.session = windowSession;
         console.log("ontrack");
    },

    onUntrack: function(window) {
    }

};


let WindowManager = function() {
    let tracker = new WindowTracker(delegate);
};

WindowManager.prototype = {

};




exports.WindowManager = WindowManager;


