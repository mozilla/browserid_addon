"use strict";
const {data} = require("self");
const {Widget} = require("widget");
const {PageMod} = require("page-mod");
const {Fakers} = require("./fakers");
const {Helpers} = require("./helpers");
const timers = require("timers");
const {WindowManager} = require("window_manager");
const {TabManager} = require("tab_manager");
Fakers();

let windowManager = new WindowManager();
let tabManager = new TabManager();

let currWorker;

let pageMod = PageMod({
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
    tabManager.sessionsUpdate(this.tab, data);
}


function onSessionTabOpen(tab) {
    console.log("session tab open");

    console.log("typeof tab.window: " + typeof tab.window);
};




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
    panel.show(el);
};



