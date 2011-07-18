const {data} = require("self");
const {WindowListener} = require("./window_listener");
const {Panel} = require("panel");
const {PageMod} = require("page-mod");
const {Cc, Ci} = require("chrome");

exports.main = AuthLoader;


function AuthLoader() {
    createWindowListener.call(this);
}

function showPanel(host, worker) {
    var panel = createShowPanel();

    panel.port.on("controllerReady", function() {
        panel.port.emit("getVerifiedEmail", {
            host: host 
        });
    });

    panel.port.on("assertionReady", function(payload) {
        let assertion = payload.assertion;
        console.log("main: WE HAVE ASSERTION! " + assertion);
        worker.port.emit("assertionReady", {
            assertion: assertion
        });
        panel.hide();
    });



    return panel;
}

function createWindowListener() {
    var windowListener = new WindowListener();
    windowListener.on("windowopen", onNewWindow);
    windowListener.init();
    return windowListener;
}

function onNewWindow(window) {
    var pageMod = PageMod({
        include: "*",
        contentScriptWhen: "start",
        contentScriptFile: data.url("injector.js"),
        onAttach: function(worker) {
            worker.port.on("getAssertion", function(payload) {
                showPanel(payload.location, worker);
            });

        }
    });
}

function createShowPanel() {
    var panel = Panel({
        contentURL: "https://browserid.org/dialog/dialog.html",
        contentScriptFile: [
            data.url("channel.js")
        ],
        contentScriptWhen: "start",
        allow: { script: true },
        width: 540,
        height: 370
    });

    let WM = Cc["@mozilla.org/appshell/window-mediator;1"] 
        .getService(Ci.nsIWindowMediator);
    let doc = WM.getMostRecentWindow("navigator:browser").document;
    let el = doc.getElementById("identity-box-inner");
    panel.show(el);

    return panel;
}

