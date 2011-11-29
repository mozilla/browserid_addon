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
        
        getDocument: function(win) {
            win = win || Helpers.chrome.getMostRecentWindow();
            return win.document;
        },

        getElementById: function(id, doc) {
            doc = doc || Helpers.chrome.getDocument();                                       
            let el = doc.getElementById(id);
            return el;
        },


        simulateDOMEvent: function(el, evtClass, type, doc) {
            doc = doc || Helpers.chrome.getDocument();                    
            let evt = doc.createEvent(evtClass);

            if(evtClass === "MouseEvents") {
                evt.initMouseEvent(type, true, true, doc.defaultView,
                        0, 0, 0, 0, 0, false, false, false, false, 0, null);
            }

            el.dispatchEvent(evt);

            return evt;
        },

        loadStylesheet: function(uri, doc) {
            doc = doc || Helpers.chrome.getDocument();
            let pi;
            if (!Helpers.chrome.stylesheetExists(uri, doc)) {
              pi = doc.createProcessingInstruction(
                     "xml-stylesheet", getXMLStylesheetInstruction(uri)); 
              doc.insertBefore(pi, doc.firstChild);
            }
            return pi;
        },

        removeStylesheet: function(uri, doc) {
            doc = doc || Helpers.chrome.getDocument();
            let sheet = getStylesheet(uri, doc);

            if (sheet) {
              sheet.parentNode.removeChild(sheet);
            }
        },

        stylesheetExists: function(uri, doc) {
            doc = doc || Helpers.chrome.getDocument();
            let sheet = getStylesheet(uri, doc);

            return !!sheet;
        }


    }
};

function getXMLStylesheetInstruction(uri) {
  return "href=\"" + uri + "\" type=\"text/css\"";
}

function getStylesheet(uri, doc) {
  let children = doc.childNodes;

  for(let len = children.length - 1; len >= 0; --len) {
    let sheet = children[len];
    let data = sheet.data;
    if (sheet.nodeName == "xml-stylesheet" && 
        data == getXMLStylesheetInstruction(uri)) {
      return sheet; 
    }
  };
}

exports.Helpers = Helpers;
