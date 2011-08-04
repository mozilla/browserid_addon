const {Cc, Ci, Cm, Cu, Cr, components} = require("chrome");

var tmp = {};
Cu.import("resource://gre/modules/Services.jsm", tmp);
var {Services} = tmp;

const {EventEmitter} = require("events");

const WindowListener = EventEmitter.compose({
    constructor: function WindowListener() {
        // not doing a whole lot             
    },
    init: function() {
        createAuthForOpenWindows.call(this);
        listenForNewWindows.call(this);
    }
});

exports.WindowListener = WindowListener;

function createAuthForOpenWindows() {
    let iter = Cc["@mozilla.org/appshell/window-mediator;1"]
               .getService(Ci.nsIWindowMediator)
               .getEnumerator("navigator:browser");

    while(iter.hasMoreElements()) {
        let window = iter.getNext().QueryInterface(Ci.nsIDOMWindow);
        this._emit("windowopen", window);
    }
}

function listenForNewWindows() {
    Services.ww.registerNotification(winWatcher.bind(this));

    function winWatcher(subject, topic) {
        if(topic === "domwindowopened") {
            subject.addEventListener("load", onLoad.bind(this, subject), false);
        }
    }

    function onLoad(subject) {
        subject.removeEventListener("load", arguments.callee, false);

        let doc = subject.document.documentElement;
        if(doc.getAttribute("windowtype") === "navigator:browser") {
            this._emit("windowopen", subject);
        }
    }
}

