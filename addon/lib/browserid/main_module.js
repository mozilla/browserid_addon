const {data} = require("self");
//const {WindowListener} = require("browserid/window_listener");
const {Panel} = require("panel");
const {PageMod} = require("page-mod");
const {Helpers} = require("helpers");
const tabs = require("tabs");

exports.MainBrowserID = function() {
  function createPanel() {
    let panel = Panel({
      contentURL: "https://browserid.org/sign_in",
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

  function createShowPanel(host, worker) {
    let panel = createPanel();
    
    panel.port.on("controllerReady", function() {
      panel.port.emit("getVerifiedEmail", {
        host: host 
      });
    });
    
    panel.port.on("assertionReady", emitAndHide.bind(null, "assertionReady"));
    panel.port.on("assertionFailure", emitAndHide.bind(null, "assertionFailure"));
    panel.once("hide", emitAndHide.bind(null, "assertionFailure", { reason: "close panel" }));
    tabs.once("activate", emitAndHide.bind(null, "assertionFailure", { reason: "new tab" }));
    
    let el = Helpers.chrome.getElementById("identity-box-inner");
    panel.show(el);
    
    let complete = false;
    function emitAndHide(message, payload) {
      // Only do this if we haven't already completed.  Otherwise, the flow has 
      // already completed and we are incorrectly overriding the old state.
      if (!complete) {
        complete = true;
        worker.port.emit(message, payload);
        panel.hide();
        panel.destroy();
        panel = null;
      }
    }
    
    return panel;
  }
  
};

