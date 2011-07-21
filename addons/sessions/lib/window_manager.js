const {WindowTracker} = require("window-utils");
const {SessionDisplay} = require("./session_display");
const {Helpers} = require("./helpers");
const self = require("self");

const logins = [];
logins.login = function(host) {
    this.forEach(function(login) {
        login.login(host);
    });
};

logins.loggedIn = function(username, host) {
    this.forEach(function(login) {
        login.loggedIn(username, host);
    });
};

logins.none = function() {
    this.forEach(function(login) {
        login.none();
    });
};

let login, logout, sessions;
var delegate = {
    onTrack: function(window) {
         console.log("window track");
         let sessionDisplay = SessionDisplay({
             window: window,
             document: window.document
         });
         sessionDisplay.none();
         sessionDisplay.on("login", function() {
            login();   
         });
         sessionDisplay.on("userinfo", function() {
             sessions();
         });
         logins.push(sessionDisplay);

         let uri = self.data.url("styles/identity-session.css");
         Helpers.chrome.loadStylesheet(uri, window.document);
    },

    onUntrack: function(window) {
         console.log("Untracking a window: " + window.location);
    }

};

var tracker = new WindowTracker(delegate);

exports.WindowManager = function(loginCallback, logoutCallback, sessionCallback) {
    login = loginCallback;
    logout = logoutCallback;
    sessions = sessionCallback;

    return {
        none: logins.none.bind(logins),
        login: logins.login.bind(logins),
        loggedIn: logins.loggedIn.bind(logins)
    };
};


