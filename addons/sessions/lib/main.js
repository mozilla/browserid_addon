"use strict";
const {data} = require("self");
const {Widget} = require("widget");
const {PageMod} = require("page-mod");
const {Fakers} = require("./fakers");
const {Helpers} = require("./helpers");
const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
const tabs = require("tabs");
const {Permissions} = require("permissions");
const timers = require("timers");

let pm = new Permissions();

Fakers();

let windowManager = new WindowManager();
windowManager.on("login", emitEvent.bind(null, "emitevent.login"));
windowManager.on("logout", emitEvent.bind(null, "emitevent.logout"));
let tabManager = new TabManager();

let currWorker;

let pageMod = PageMod({
    include: ["*"],
    contentScriptWhen: "start",
    contentScriptFile: data.url("page_interaction.js"),
    onAttach: function(worker) {
        Helpers.workers.prepare(worker);

        worker.tab.worker = worker;
        worker.port.on("sessions.set", onSessionSet.bind(worker));
        worker.port.on("sessions.opentab", onSessionTabOpen.bind(worker));
    }
});



function onSessionSet(data) {
    tabManager.sessionsUpdate(this.tab, data);
}


function onSessionTabOpen() {
    tabManager.sessionReset(this.tab);
};



function emitEvent(eventName) {
    let tab = tabs.activeTab;
    if(tab) {
        pm.allow("popup");
        tab.worker.port.emit(eventName);
        timers.setTimeout(function() {
            pm.reset("popup", tab);
        }, 500);
    }
};

