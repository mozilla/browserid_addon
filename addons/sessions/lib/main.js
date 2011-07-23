const {data} = require("self");
const {Panel} = require("panel");
const {Widget} = require("widget");
const {PageMod} = require("page-mod");
const {Fakers} = require("./fakers");
const tabs = require("tabs");
const {Helpers} = require("./helpers");
const timers = require("timers");

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


var currWorker;

var pageMod = PageMod({
    include: ["*"],
    contentScriptWhen: "start",
    contentScriptFile: data.url("page_interaction.js"),
    onAttach: function(worker) {
        Helpers.workers.prepare(worker);

        console.log("we have a worker");

        worker.port.on("sessions.set", onSessionSet.bind(worker));
        worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker, worker.tab));
    }
});



function onSessionSet(data) {
    console.log("session set");
    currWorker = this;
    var tab = this.tab;
    var sessions = data.sessions;
    var host = data.host;

    if("undefined" === typeof sessions) {
        loginWidget.none();
        console.log("clearing sessions");
        if(this.loggedin) {
            this.loggedin = false;
            this.port.emit("emitevent.logout");
        }
    }
    else if(sessions.length) {
        // We support cookie login and have sessions.  Keep track of
        // these cookies, we may have to logout.
        this.loggedin = true;
        panel.port.emit("sessions.set", sessions);
        var username = '';
        sessions.forEach(function(session) {
            var boundTo = session.bound_to;
            if(boundTo && boundTo.type === "cookie") {
                console.log("bound to a cookie: " + boundTo.name);
                tab.cookie = boundTo.name;
                cookieMonster.watch(host, boundTo.name, function() {
                    //console.log("cookie changed, we should do something");
                });
            }
            username = session.email;
        });
        console.log("setting loggedIn");
        tab.loginShown = true;
        loginWidget.loggedIn(username, host);
    }
    else if(this.loggedin) {
        // in this case, sessions is set to [], which means the site
        // supports our login scheme.  We were logged in, so we have
        // to logout.
        this.loggedin = false;
        this.port.emit("emitevent.logout");
        console.log("setting login");
        loginWidget.login(host);                            
        tab.loginShown = true;
    }
    else {
        // in this case, we have a sessions, but we were not previously
        // logged in, show the login button only.
        console.log("setting login");
        loginWidget.login(host);                            
        tab.loginShown = true;
    }
}


function onSessionTabOpen(tab) {
    console.log("session tab open");

    console.log("typeof tab.window: " + typeof tab.window);
    tab.loginShown = false;
};

/*
tabs.on("open", function(tab) {
  console.log("tab open");
  tab.expando = "my expando";
});
*/
tabs.on("ready", onSessionTabReady);
tabs.on("activate", function(tab) {
    console.log("tab activated");
    console.log("typeof tab.expando: " + typeof tab.expando);
    console.log("tab.expando: " + tab.expando);
});

function onSessionTabReady(tab) {
    if(!tab.expando) {
      tab.expando = "my expando";
    }
    console.log('typeof tab.window: ' + typeof tab.window);
    if(tab.cookie) {
        console.log("some cookies watched for this tab");
    }

    timers.setTimeout(function() {
        if(!tab.loginShown) {
            console.log("hiding login");
            loginWidget.none();
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
    var el = Helpers.chrome.getElementById('identity-session-box');
    panel.show(el);
};



