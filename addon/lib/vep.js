/*
 * the VEP APIs
 */


const {data} = require("self");
const {Panel} = require("panel");
const {Helpers} = require("helpers");
const tabs = require("tabs");
var pageMod = require("page-mod");

// initialize the injector if we are <fx9
const injector = require("./injector");

function createPanel() {
  let panel = Panel({
    contentURL: "https://browserid.org/sign_in",
//    contentURL: "http://localhost:10002/sign_in",
    contentScriptFile: [
      data.url("browserid/channel.js")
    ],
    contentScriptWhen: "start",
    allow: { script: true },
    width: 700,
    height: 375
  });
  
  
  return panel;
}

function createShowPanel(window, options, callback) {
  var host = window.location.toString();
  
  if (window._browserid_panel) {
    return window._browserid_panel;
  }
  
  window._browserid_panel = createPanel();
  let panel = window._browserid_panel;
  
  let complete = false;
  
  function emitAndHide(message, payload) {
    // Only do this if we haven't already completed.  Otherwise, the flow has 
    // already completed and we are incorrectly overriding the old state.
    if (!complete) {
      complete = true;

      panel.hide();
      panel.destroy();
      window._browserid_panel = null;

      if (message == "assertionReady") {
        callback(payload.assertion);
      } else {
        callback(null);
      }
    }
  }

  panel.port.on("controllerReady", function() {
    panel.port.emit("getVerifiedEmail", {
      host: host,
      options: options      
    });
  });
  
  panel.port.on("assertionReady", emitAndHide.bind(null, "assertionReady"));
  panel.port.on("assertionFailure", emitAndHide.bind(null, "assertionFailure"));
  panel.once("hide", emitAndHide.bind(null, "assertionFailure", { reason: "close panel" }));
  tabs.once("activate", emitAndHide.bind(null, "assertionFailure", { reason: "new tab" }));

  console.log("showing");
  let el = Helpers.chrome.getElementById("identity-box-inner");
  panel.show(el);
  
  return panel;
}

exports.init = function() {
  // the ID API
  var idAPI = function(window) {
    return {
      'getVerifiedEmail': function(callback) {
        console.log("call get");
        createShowPanel(window, {}, callback);
      },
      'get': function(callback, options) {
        // FIXME: sanitize the options
        createShowPanel(window, options, callback);
      }
    };
  };
  
  injector.registerNavigatorAPI('id', idAPI);
};
