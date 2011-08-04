const {data} = require("self");
const {WindowListener} = require("./window_listener");
const {Panel} = require("panel");
const {PageMod} = require("page-mod");
const {Cc, Ci} = require("chrome");
const {Helpers} = require("helpers");
const tabs = require("tabs");

exports.MainBrowserID = function() {
  createWindowListener();

  function showPanel(host, worker) {
      let panel = createShowPanel();

      panel.port.on("controllerReady", function() {
          panel.port.emit("getVerifiedEmail", {
              host: host 
          });
      });

      panel.port.on("assertionReady", emitAndHide.bind(null, "assertionReady"));
      panel.port.on("assertionFailure", emitAndHide.bind(null, "assertionFailure"));

      function emitAndHide(message, payload) {
          worker.port.emit(message, payload);
          panel.hide();
          panel.destroy();
          panel = null;
      }

      tabs.once("activate", function() {
          emitAndHide("assertionFailure", { reason: "new tab" });
      });

      return panel;
  }

  function createWindowListener() {
      let windowListener = new WindowListener();
      windowListener.on("windowopen", onNewWindow);
      windowListener.init();
      return windowListener;
  }

  function onNewWindow(window) {
      var pageMod = PageMod({
          include: "*",
          contentScriptWhen: "start",
          contentScriptFile: data.url("browserid/injector.js"),
          onAttach: function(worker) {
              worker.port.on("getAssertion", function(payload) {
                  showPanel(payload.host, worker);
              });
          }
      });
  }

  function createShowPanel() {
      let panel = Panel({
          contentURL: "https://browserid.org/dialog/dialog.html",
          contentScriptFile: [
              data.url("browserid/channel.js")
          ],
          contentScriptWhen: "start",
          allow: { script: true },
          width: 540,
          height: 370
      });

      let el = Helpers.chrome.getElementById("identity-box-inner");
      panel.show(el);

      return panel;
  }
};

