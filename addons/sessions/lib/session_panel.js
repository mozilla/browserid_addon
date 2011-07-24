const {data} = require("self");
const {EventEmitter} = require("events");
const {Panel} = require("panel");
const {Helpers} = require("./helpers");

let SessionPanel = EventEmitter.compose({
    constructor: function(config) {
        let panel = this._panel = Panel({
            contentURL: data.url("sessions.html"),
            contentScriptFile: data.url("sessions.js")
        });

        panel.port.on("sessions.setheight", onPanelSetHeight.bind(this));
        panel.port.on("sessions.selectsession", onPanelSelection.bind(this));
        panel.port.on("sessions.logout", onPanelLogout.bind(this));

        let session = this._session = config.session;
        session.on("set:sessions", onSessionUpdate.bind(this));

        this._document = config.document;
    },

    show: function() {
        var el = Helpers.chrome.getElementById("identity-session-box", this._document);
        this._panel.show(el);
    },

    hide: function() {
        this._panel.hide();
    }
});

function onPanelSetHeight(height) {
    this._panel.height = height + 20;
}

function onPanelSelection(payload) {
    let session = payload.session;
    this._emit("sessionselect", session);
}

function onPanelLogout() {
    this._panel.hide();
    this._emit("sessionlogout");
} 

function onSessionUpdate(sessions) {
    this._panel.port.emit("sessions.set", sessions);
}

exports.SessionPanel = SessionPanel;
