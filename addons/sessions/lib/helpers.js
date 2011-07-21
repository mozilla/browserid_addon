const {Cc, Ci} = require("chrome");

const Helpers = {
    toConsole: function(obj, printer) {
        let printer = printer || console;
        printer.log("printing object");
        for(var key in obj) {
            printer.log(key + ': ' + obj[key]);
        }
    },

    chrome: {
        getMostRecentWindow: function() {
            let WM = Cc["@mozilla.org/appshell/window-mediator;1"] 
                .getService(Ci.nsIWindowMediator);
            let win = WM.getMostRecentWindow("navigator:browser");                                                            
            return win;
        },
        
        getDocument: function(window) {
            window = window || Helpers.chrome.getMostRecentWindow();
            return window.document;
        },

        getElementById: function(id, document) {
            document = document || Helpers.chrome.getDocument();                                       
            let el = document.getElementById(id);
            return el;
        },


        simulateDOMEvent: function(el, evtClass, type, document) {
            document = document || Helpers.chrome.getDocument();                    
            let evt = document.createEvent(evtClass);

            if(evtClass === "MouseEvents") {
                evt.initMouseEvent(type, true, true, document.defaultView,
                        0, 0, 0, 0, 0, false, false, false, false, 0, null);
            }

            el.dispatchEvent(evt);

            return evt;
        },

        loadStylesheet: function(uri, document) {
            document = document || Helpers.chrome.getDocument();
            let pi = document.createProcessingInstruction(
                   "xml-stylesheet", "href=\"" + uri + "\" type=\"text/css\"");
                document.insertBefore(pi, document.firstChild);
            return pi;
        }
    },

    workers: {

        // Overrides worker.port.on so that listeners are automatically 
        // detached when the worker is removed.
        // Not sure if this is strictly needed.
        prepare: function(worker) {
            worker.portListeners = {};
            
            let origOn = worker.port.on;
            worker.port.on = function(message, listener) {
                worker.portListeners[message] = worker.portListeners[message] || [];
                worker.portListeners[message].push(listener);
                origOn.call(worker, message, listener);
            };

            worker.once("detach", function() {
                for(var key in worker.portListeners) {
                    var listeners = worker.portListeners[key];
                    listeners.forEach(function(listener) {
                        worker.port.removeListener(key, listener);
                    });
                    worker.portListeners[key] = null;
                    delete worker.portListeners[key];
                }
            });
        }


    }
};

exports.Helpers = Helpers;
