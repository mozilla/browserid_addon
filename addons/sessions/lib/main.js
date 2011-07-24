"use strict";
const {data} = require("self");
const {Panel} = require("panel");
const {Widget} = require("widget");
const {PageMod} = require("page-mod");
const {Fakers} = require("./fakers");
const tabs = require("tabs");
const {Helpers} = require("./helpers");
const timers = require("timers");
const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
const {CookieMonster} = require("./cookie_monster");

var cookieMonster = new CookieMonster();

var panel = Panel({
    contentURL: data.url("sessions.html"),
    contentScriptFile: data.url("sessions.js")
});

panel.port.on("sessions.setheight", function(height) {
    panel.height = height + 20;
});
panel.port.on("sessions.selectsession", onSessionSelection);
panel.port.on("sessions.logout", function() {
    panel.hide();
    logoutCallback();
}); 

Fakers();

let windowManager = new WindowManager();
let tabManager = new TabManager();

var currWorker;

var pageMod = PageMod({
    include: ["*"],
    contentScriptWhen: "start",
    contentScriptFile: data.url("page_interaction.js"),
    onAttach: function(worker) {
        Helpers.workers.prepare(worker);

        console.log("we have a worker");
        console.log("worker.tab.window.expando in pagemod: " + worker.tab.window.expando);
        worker.port.on("sessions.set", onSessionSet.bind(worker));
        worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker, worker.tab));
    }
});



function onSessionSet(data) {
    currWorker = this;
    let tab = this.tab;
    let sessions = data.sessions;
    
    let status = tabManager.sessionsUpdate(tab, sessions);

    if("none" === status) {
        if(this.loggedin) {
            this.loggedin = false;
            this.port.emit("emitevent.logout");
        }
    }
    else if("loggedin" === status) {
        // We support cookie login and have sessions.  Keep track of
        // these cookies, we may have to logout.
        this.loggedin = true;
        panel.port.emit("sessions.set", sessions);
        console.log("setting loggedIn");
    }
    else if("login" === status) {
    }
}


function onSessionTabOpen(tab) {
    console.log("session tab open");

    console.log("typeof tab.window: " + typeof tab.window);
};


tabs.on("open", function(tab) {
  console.log("tab open");
  tab.window.expando = "my expando";
});

tabs.on("ready", onSessionTabReady);
tabs.on("activate", function(tab) {
    console.log("tab activated");
});

function onSessionTabReady(tab) {
    console.log("typeof tab.window: " + typeof tab.window);
    if(tab.cookie) {
        console.log("some cookies watched for this tab");
    }

    timers.setTimeout(function() {
        if(!tab.loginShown) {
            console.log("hiding login");
            //loginWidget.none();
        }
    }, 1000);
}

function onSessionSelection(payload) {
    var session = payload.session;
}

function loginCallback() {
    if(currWorker) {
        currWorker.port.emit("emitevent.login");
    }
};

function logoutCallback() {
    if(currWorker) {
        currWorker.port.emit("emitevent.logout");
    }
};

function sessionCallback() {
    var el = Helpers.chrome.getElementById("identity-session-box");
    panel.show(el);
};



